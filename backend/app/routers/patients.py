# app/routers/patients.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..utils.auth import get_current_user
from ..database import execute_query
from ..schemas.patient import PatientProfile, PatientUpdate
from ..models.patient_queries import *

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/profile", response_model=PatientProfile)
async def get_patient_profile(current_user = Depends(get_current_user)):
    """Get patient profile information"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a patient"
        )
    
    result = execute_query(GET_PATIENT_PROFILE, (current_user["userid"],))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    
    return result[0]

@router.put("/profile", response_model=PatientProfile)
async def update_patient_profile(
    updates: PatientUpdate,
    current_user = Depends(get_current_user)
):
    """Update patient profile information"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a patient"
        )
    
    # Execute updates in transaction
    try:
        # Update User table first
        execute_query(
            UPDATE_USER_NAME, 
            (updates.name, current_user["userid"]), 
            fetch=False
        )
        
        # Then update Patients table
        result = execute_query(
            UPDATE_PATIENT_PROFILE,
            (updates.name, updates.email, updates.phoneNumber, current_user["userid"])
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to update profile"
            )
        
        return result[0]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update failed: {str(e)}"
        )

@router.put("/balance/add", response_model=PatientProfile)
async def add_to_balance(
    amount: float,
    current_user = Depends(get_current_user)
):
    """Add funds to patient balance"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a patient"
        )
    
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    try:
        result = execute_query(ADD_TO_BALANCE, (amount, current_user["userid"]))
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        return result[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add balance: {str(e)}"
        )