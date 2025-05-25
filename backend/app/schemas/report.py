from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class ReportGenerationRequest(BaseModel):
    timeframe: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
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
    lastvisit: Optional[date]
    reportdate: date

class DoctorStatistics(BaseModel):
    statid: int
    reportid: int
    doctorid: int
    doctorname: str
    specialization: str
    prescriptioncount: int
    appointmentcount: int
    totalrevenue: float
    reportdate: date
    ratings: float

class EquipmentStatistics(BaseModel):
    statid: int
    reportid: int
    resourceid: int
    resourcename: str
    usagecount: int
    lastuseddate: date
    totalrequests: int

class ReportDetail(ReportBase):
    patientStatistics: List[PatientStatistics]
    doctorStatistics: List[DoctorStatistics]
    equipmentStatistics: List[EquipmentStatistics] 