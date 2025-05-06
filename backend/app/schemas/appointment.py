# app/schemas/appointment.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

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
    
    class Config:
        populate_by_name = True
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

class ReviewCreate(BaseModel):
    rating: float
    review: Optional[str] = None