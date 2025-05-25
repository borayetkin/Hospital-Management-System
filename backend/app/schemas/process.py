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

class BillingResponse(BaseModel):
    amount: float
    paymentStatus: str
    billingDate: Optional[datetime]

class ProcessResponse(BaseModel):
    processid: int
    processName: str
    processDescription: str
    status: str
    billing: Optional[BillingResponse] = None

    class Config:
        from_attributes = True 