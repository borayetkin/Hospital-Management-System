from pydantic import BaseModel
from typing import Optional, List

class MedicationBase(BaseModel):
    medicationName: str
    description: Optional[str] = None
    information: Optional[str] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    pass

class PrescriptionCreate(BaseModel):
    medicationName: str
    appointmentID: int

class PrescriptionResponse(BaseModel):
    medicationName: str
    appointmentID: int
    description: Optional[str] = None
    information: Optional[str] = None 