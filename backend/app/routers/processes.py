# app/routers/processes.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..utils.auth import get_current_user
from ..database import execute_query, execute_transaction
from ..models.process_queries import *
from ..schemas.process import ProcessCreate, ProcessResponse, ProcessStatusUpdate

router = APIRouter(prefix="/processes", tags=["Processes"])

@router.get("/patient", response_model=List[ProcessResponse])
async def get_patient_processes(
    current_user = Depends(get_current_user)
):
    """Get all medical processes for the current patient"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can view their processes"
        )
    
    processes = execute_query(GET_PATIENT_PROCESSES, (current_user["name"],))
    return processes

@router.get("/doctor/patient/{patient_id}", response_model=List[ProcessResponse])
async def get_doctor_patient_processes(
    patient_id: int,
    current_user = Depends(get_current_user)
):
    """Get all processes for a specific patient under the current doctor"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can view patient processes"
        )
    
    processes = execute_query(
        GET_DOCTOR_PATIENT_PROCESSES, 
        (patient_id, current_user["userid"])
    )
    return processes

@router.get("/doctor/appointments/{patient_id}")
async def get_appointments_for_process(
    patient_id: int,
    current_user = Depends(get_current_user)
):
    """Get available appointments for creating new processes"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create processes"
        )
    
    appointments = execute_query(
        GET_APPOINTMENTS_FOR_PROCESS,
        (patient_id, current_user["userid"])
    )
    return appointments

@router.post("/create", response_model=ProcessResponse)
async def create_medical_process(
    process: ProcessCreate,
    current_user = Depends(get_current_user)
):
    """Create a new medical process"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create processes"
        )
    
    try:
        # Create process in a transaction
        process_result = execute_query(
            CREATE_MEDICAL_PROCESS,
            (
                process.processName,
                process.processDescription,
                process.appointmentID
            )
        )
        
        process_id = process_result[0]["processid"]
        
        # Create billing record
        billing_result = execute_query(
            CREATE_PROCESS_BILLING,
            (process.amount, process_id)
        )
        
        # Update patient statistics
        execute_query(
            UPDATE_PATIENT_STATISTICS,
            (process.patientID,),
            fetch=False
        )
        
        # Get the created process with all details
        created_process = execute_query(
            GET_DOCTOR_PATIENT_PROCESSES,
            (process.patientID, current_user["userid"])
        )
        
        return created_process[0]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create process: {str(e)}"
        )

@router.put("/{processid}/status", response_model=ProcessResponse)
async def update_process_status(
    processid: int,
    status_update: ProcessStatusUpdate,
    current_user = Depends(get_current_user)
):
    """Update the status of a medical process"""
    if current_user["role"] not in ["Doctor", "Staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and staff can update process status"
        )
    
    try:
        # Update process status
        execute_query(
            UPDATE_PROCESS_STATUS,
            (status_update.status, processid),
            fetch=False
        )
        
        # Get updated process details
        updated_process = execute_query(
            GET_DOCTOR_PATIENT_PROCESSES,
            (processid, current_user["userid"])
        )
        
        if not updated_process:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Process not found"
            )
        
        return updated_process[0]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update process status: {str(e)}"
        )

@router.get("/appointment/{appointment_id}", response_model=List[ProcessResponse])
async def get_processes_by_appointment(
    appointment_id: int,
    current_user = Depends(get_current_user)
):
    """Get all processes for a specific appointment"""
    # You may want to restrict this to doctors/staff or the patient
    processes = execute_query(
        GET_PROCESSES_BY_APPOINTMENT,
        (appointment_id,)
    )
    print(processes)
    return processes 