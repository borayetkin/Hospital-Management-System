# app/utils/auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..config import settings
from ..database import execute_query

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

def verify_password(plain_password, hashed_password):
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token with expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Decode JWT token and get current user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    query = """
    SELECT u.userID, u.name, u.email, 
           CASE 
               WHEN a.AdminID IS NOT NULL THEN 'Admin' 
               WHEN d.employeeID IS NOT NULL THEN 'Doctor' 
               WHEN s.employeeID IS NOT NULL THEN 'Staff' 
               WHEN p.patientID IS NOT NULL THEN 'Patient' 
           END AS role 
    FROM "User" u 
    LEFT JOIN Admin a ON u.userID = a.AdminID 
    LEFT JOIN Doctors d ON u.userID = d.employeeID 
    LEFT JOIN Staff s ON u.userID = s.employeeID 
    LEFT JOIN Patients p ON u.userID = p.patientID 
    WHERE u.userID = %s
    """
    
    result = execute_query(query, (user_id,))
    if not result:
        raise credentials_exception
    
    user = result[0]
    return user