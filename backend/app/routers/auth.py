# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..models.auth_queries import *
from ..utils.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token
)
from ..config import settings
from ..database import execute_query, execute_transaction
from ..schemas.user import UserCreate, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new user"""
    # Check if email already exists
    email_check = execute_query(GET_USER_BY_EMAIL, (user.email,))
    if email_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Begin transaction for user creation
    try:
        # Insert into User table
        user_result = execute_query(
            CREATE_USER, 
            (user.name, user.email, user.identityNumber, hashed_password)
        )
        
        if not user_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        user_id = user_result[0]["userid"]
        
        # Prepare transaction queries
        transaction_queries = []
        
        # Add role-specific queries
        if user.role == "Patient":
            transaction_queries.append((
                CREATE_PATIENT, 
                (user_id, user.name, user.dob, user.email, user.phoneNumber)
            ))
        elif user.role == "Doctor":
            transaction_queries.append((CREATE_EMPLOYEE, (user_id,)))
            transaction_queries.append((CREATE_DOCTOR, (user_id, user.specialization)))
        elif user.role == "Staff":
            transaction_queries.append((CREATE_EMPLOYEE, (user_id,)))
            transaction_queries.append((CREATE_STAFF, (user_id, user.staffRole)))
        elif user.role == "Admin":
            transaction_queries.append((CREATE_ADMIN, (user_id,)))
        
        # Execute transaction
        execute_transaction(transaction_queries)
        
        # Return user data
        return {
            "id": user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Get access token (login)"""
    # Find user by email
    results = execute_query(GET_USER_BY_EMAIL, (form_data.username,))
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = results[0]
    
    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["userid"])},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["userid"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }