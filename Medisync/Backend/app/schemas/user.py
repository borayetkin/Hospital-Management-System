# app/schemas/user.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import date

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    confirmPassword: str
    identityNumber: str
    role: str
    
    # Optional fields based on role
    dob: Optional[date] = None  # For patients
    phoneNumber: Optional[str] = None  # For patients
    specialization: Optional[str] = None  # For doctors
    staffRole: Optional[str] = None  # For staff
    
    @validator('confirmPassword')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        valid_roles = ['Patient', 'Doctor', 'Staff', 'Admin']
        if v not in valid_roles:
            raise ValueError(f'Role must be one of {valid_roles}')
        return v

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[int] = None