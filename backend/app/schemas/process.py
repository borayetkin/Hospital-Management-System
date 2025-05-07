# app/schemas/process.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProcessBase(BaseModel):
    processName: str
    processDescription: str

class ProcessCreate(ProcessBase):
    appointmentID: int
    amount: float

class ProcessStatusUpdate(BaseModel):
    status: str

class ProcessResponse(ProcessBase):
    processid: int
    status: str
    doctor_name: Optional[str] = None
    process_date: Optional[datetime] = None
    amount: Optional[float] = None
    paymentStatus: Optional[str] = None

    class Config:
        from_attributes = True 