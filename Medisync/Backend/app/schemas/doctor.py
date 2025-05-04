# app/schemas/doctor.py
from pydantic import BaseModel
from typing import Optional

class DoctorProfile(BaseModel):
    employeeID: int
    name: str
    specialization: Optional[str] = None
    doctorLocation: Optional[str] = None
    deptName: Optional[str] = None
    rating: Optional[float] = None