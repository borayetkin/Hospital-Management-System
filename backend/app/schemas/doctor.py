# app/schemas/doctor.py
from pydantic import BaseModel, Field
from typing import Optional

class DoctorProfile(BaseModel):
    doctorID: int = Field(..., alias="employeeid")
    name: str
    specialization: Optional[str] = None
    doctorLocation: Optional[str] = Field(None, alias="doctorlocation")
    deptName: Optional[str] = Field(None, alias="deptname")
    avgRating: Optional[float] = Field(None, alias="rating")
    
    class Config:
        populate_by_name = True
        from_attributes = True