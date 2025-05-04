# app/schemas/patient.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class PatientProfile(BaseModel):
    patientID: int
    name: str
    email: EmailStr
    phoneNumber: Optional[str] = None
    DOB: Optional[date] = None
    Balance: float

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None