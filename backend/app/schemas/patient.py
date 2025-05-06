# app/schemas/patient.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

class PatientProfile(BaseModel):
    patientID: int = Field(..., alias="patientid")
    name: str
    email: EmailStr
    phoneNumber: Optional[str] = Field(None, alias="phonenumber")
    dateOfBirth: Optional[date] = Field(None, alias="dob")
    balance: float = Field(..., alias="balance")
    
    class Config:
        populate_by_name = True
        from_attributes = True

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None