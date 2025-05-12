# app/schemas/appointment.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BillingResponse(BaseModel):
    amount: Optional[float] = None
    paymentStatus: Optional[str] = None
    billingDate: Optional[datetime] = None

class ProcessResponse(BaseModel):
    processid: int = Field(..., alias="processid")
    processName: str = Field(..., alias="processName")
    processDescription: Optional[str] = Field(None, alias="processDescription")
    status: str
    doctor_name: str
    process_date: datetime
    billing: Optional[BillingResponse] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class AppointmentCreate(BaseModel):
    doctorID: int
    startTime: datetime
    endTime: datetime

class AppointmentResponse(BaseModel):
    appointmentID: int = Field(..., alias="appointmentid")
    patientID: int = Field(..., alias="patientid")
    doctorID: int = Field(..., alias="doctorid")
    doctorName: Optional[str] = Field(None, alias="doctorname")
    startTime: datetime = Field(..., alias="starttime")
    endTime: datetime = Field(..., alias="endtime")
    status: str  # Values: "scheduled", "completed", "cancelled"
    rating: Optional[float] = None
    review: Optional[str] = None
    specialization: Optional[str] = None
    processes: List[ProcessResponse] = []
    
    class Config:
        populate_by_name = True
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

class ReviewCreate(BaseModel):
    rating: float
    review: Optional[str] = None