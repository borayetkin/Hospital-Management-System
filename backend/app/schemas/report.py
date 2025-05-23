from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReportGenerationRequest(BaseModel):
    timeframe: str
    patient_ids: Optional[List[int]] = None
    doctor_ids: Optional[List[int]] = None
    equipment_ids: Optional[List[int]] = None

class ReportBase(BaseModel):
    reportid: int
    created_by: int
    time_stamp: datetime

class PatientStatistics(BaseModel):
    statid: int
    reportid: int
    patientid: int
    patientname: str
    totalappointments: int
    totalprocesses: int
    totalpaid: float
    lastvisit: datetime
    reportdate: datetime

class DoctorStatistics(BaseModel):
    statid: int
    reportid: int
    doctorid: int
    doctorname: str
    specialization: str
    prescriptioncount: int
    appointmentcount: int
    totalrevenue: float
    reportdate: datetime
    ratings: float

class EquipmentStatistics(BaseModel):
    statid: int
    reportid: int
    resourceid: int
    resourcename: str
    usagecount: int
    lastuseddate: datetime
    totalrequests: int

class ReportDetail(ReportBase):
    patientStatistics: List[PatientStatistics]
    doctorStatistics: List[DoctorStatistics]
    equipmentStatistics: List[EquipmentStatistics] 