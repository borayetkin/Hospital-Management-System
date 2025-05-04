# app/schemas/appointment.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    doctorID: int
    startTime: datetime
    endTime: datetime

class AppointmentResponse(BaseModel):
    appointmentID: int
    patientID: int
    doctorID: int
    startTime: datetime
    endTime: datetime
    status: str
    rating: Optional[float] = None
    review: Optional[str] = None