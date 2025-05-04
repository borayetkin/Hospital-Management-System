# app/routers/doctors.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..utils.auth import get_current_user
from ..database import execute_query
from ..schemas.doctor import DoctorProfile
from ..models.doctor_queries import *

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/{doctor_id}", response_model=DoctorProfile)
async def get_doctor_profile(
    doctor_id: int,
    current_user = Depends(get_current_user)
):
    """Get doctor profile information"""
    result = execute_query(GET_DOCTOR_PROFILE, (doctor_id,))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    return result[0]

@router.get("/profile", response_model=DoctorProfile)
async def get_current_doctor_profile(current_user = Depends(get_current_user)):
    """Get current doctor's profile information"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a doctor"
        )
    
    result = execute_query(GET_DOCTOR_PROFILE, (current_user["userid"],))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    
    return result[0]

@router.get("/patients")
async def get_doctor_patients(current_user = Depends(get_current_user)):
    """Get doctor's patients"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a doctor"
        )
    
    patients = execute_query(GET_DOCTOR_PATIENTS, (current_user["userid"],))
    return patients

@router.get("/stats")
async def get_doctor_statistics(current_user = Depends(get_current_user)):
    """Get doctor's statistics"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a doctor"
        )
    
    stats = execute_query(
        GET_DOCTOR_STATS, 
        (current_user["userid"], current_user["userid"])
    )
    
    if not stats:
        return {
            "appointmentCount": 0,
            "avgRating": None,
            "prescriptionCount": 0
        }
    
    return stats[0]