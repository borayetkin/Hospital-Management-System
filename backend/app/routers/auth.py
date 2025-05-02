from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
import psycopg2
from datetime import datetime, timedelta, date
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from app.database import get_db
import traceback
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# JWT settings
SECRET_KEY = "your-secret-key"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class UserSignUp(BaseModel):
    name: str
    email: str
    identity_number: str
    password: str
    role: str  # "patient", "doctor", "staff", or "admin"
    phone_number: Optional[str] = None
    specialization: Optional[str] = None
    staff_role: Optional[str] = None
    dob: Optional[date] = None  # Required for patients

@router.post("/signin")
async def signin(form_data: OAuth2PasswordRequestForm = Depends(), response: Response = None):
    with get_db() as db:
        cur = db.cursor()
        
        # Your sign-in query
        cur.execute("""
            SELECT u.userID, u.name, u.email, u.password,
                CASE 
                    WHEN p.patientID IS NOT NULL THEN 'Patient'
                    WHEN d.employeeID IS NOT NULL THEN 'Doctor'
                    WHEN s.employeeID IS NOT NULL THEN 'Staff'
                    WHEN a.AdminID IS NOT NULL THEN 'Admin'
                END AS role
            FROM "User" u
            LEFT JOIN Patients p ON u.userID = p.patientID
            LEFT JOIN Doctors d ON u.userID = d.employeeID
            LEFT JOIN Staff s ON u.userID = s.employeeID
            LEFT JOIN Admin a ON u.userID = a.AdminID
            WHERE u.email = %s
        """, (form_data.username,))
        
        user = cur.fetchone()
        
        if not user or not verify_password(form_data.password, user['password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user['userid']),
                "email": user['email'],
                "role": user['role']
            }, 
            expires_delta=access_token_expires
        )
        
        # Set cookie
        response.set_cookie(
            key="session",
            value=access_token,
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax"
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user['userid'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role'].lower()
            }
        }

@router.post("/signup")
async def signup(user: UserSignUp):
    with get_db() as db:
        cur = db.cursor()
        
        try:
            # Start transaction
            cur.execute("BEGIN")
            
            # Check if user already exists
            cur.execute("SELECT userID FROM \"User\" WHERE email = %s OR identityNumber = %s", 
                        (user.email, user.identity_number))
            if cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email or identity number already registered"
                )
            
            # Insert into User table
            hashed_password = get_password_hash(user.password)
            logger.info(f"Attempting to insert user with email: {user.email}")
            
            # Convert role to lowercase
            role = user.role.lower()
            
            cur.execute("""
                INSERT INTO "User" (name, email, identityNumber, password)
                VALUES (%s, %s, %s, %s)
                RETURNING userid
            """, (user.name, user.email, user.identity_number, hashed_password))
            
            # Get the user ID
            user_id = cur.fetchone()["userid"]
            logger.info(f"Successfully created user with ID: {user_id}")
            
            if role == "patient":
                if not user.dob:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Date of birth is required for patients"
                    )
                # Insert into Patients table
                logger.info("Creating patient record")
                cur.execute("""
                    INSERT INTO Patients (patientID, name, email, phoneNumber, Balance, DOB)
                    VALUES (%s, %s, %s, %s, 0, %s)
                """, (user_id, user.name, user.email, user.phone_number, user.dob))
                
            elif role == "doctor":
                # Insert into Employee table
                logger.info("Creating doctor record")
                cur.execute("""
                    INSERT INTO Employee (employeeID, salary)
                    VALUES (%s, NULL)
                """, (user_id,))
                
                # Insert into Doctors table
                cur.execute("""
                    INSERT INTO Doctors (employeeID, specialization, doctorLocation, deptName)
                    VALUES (%s, %s, NULL, NULL)
                """, (user_id, user.specialization))
                
            elif role == "staff":
                # Insert into Employee table
                logger.info("Creating staff record")
                cur.execute("""
                    INSERT INTO Employee (employeeID, salary)
                    VALUES (%s, NULL)
                """, (user_id,))
                
                # Insert into Staff table
                cur.execute("""
                    INSERT INTO Staff (employeeID, role)
                    VALUES (%s, %s)
                """, (user_id, user.staff_role))
                
            elif role == "admin":
                # Insert into Admin table
                logger.info("Creating admin record")
                cur.execute("""
                    INSERT INTO Admin (AdminID)
                    VALUES (%s)
                """, (user_id,))
            
            # Commit transaction
            cur.execute("COMMIT")
            logger.info("Successfully completed signup process")
            return {"message": "Successfully signed up", "user_id": user_id}
            
        except Exception as e:
            # Rollback on error
            cur.execute("ROLLBACK")
            error_msg = f"Error during signup: {str(e)}\n{traceback.format_exc()}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)

@router.post("/signout")
async def signout(response: Response):
    response.delete_cookie(key="session")
    return {"message": "Successfully signed out"} 