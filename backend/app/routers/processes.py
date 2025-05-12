# app/routers/processes.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..utils.auth import get_current_user
from ..database import execute_query, execute_transaction
from ..models.process_queries import *
from ..schemas.process import ProcessCreate, ProcessResponse, ProcessStatusUpdate
import json

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
    processes = execute_query(
        GET_PROCESSES_BY_APPOINTMENT,
        (appointment_id,)
    )
    for proc in processes:
        if proc.get("billing") and isinstance(proc["billing"], str):
            proc["billing"] = json.loads(proc["billing"])
    print("Processes returned from SQL:", processes)
    return processes

@router.post("/{process_id}/pay", response_model=ProcessResponse)
async def pay_for_process(
    process_id: int,
    current_user = Depends(get_current_user)
):
    """Pay for a medical process"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can make payments"
        )
    
    try:
        # First, get the appointment ID for this process
        appointment_result = execute_query(
            "SELECT appointmentid FROM Process WHERE processid = %s",
            (process_id,)
        )
        if not appointment_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found for this process"
            )
        appointment_id = appointment_result[0]["appointmentid"]

        # First check if the process exists and get its details
        process_check = execute_query("""
            SELECT b.amount, b.paymentStatus, a.patientid, pa.balance
            FROM Billing b
            JOIN Process p ON b.processid = p.processid
            JOIN Appointment a ON p.appointmentid = a.appointmentid
            JOIN Patients pa ON a.patientid = pa.patientid
            WHERE b.processid = %s
        """, (process_id,))
        
        if not process_check:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Process not found"
            )
            
        process_info = process_check[0]
        
        # Check if already paid
        if process_info["paymentstatus"] == "Paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This process has already been paid"
            )
            
        # Check if sufficient balance
        if process_info["balance"] < process_info["amount"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Required: ${process_info['amount']}, Available: ${process_info['balance']}"
            )
        
        # Update the billing status
        payment_result = execute_query(
            UPDATE_PROCESS_PAYMENT,
            (process_id, process_id)
        )
        
        if not payment_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment failed. Please try again."
            )
        
        # Get the amount and patient ID from the payment result
        amount = payment_result[0]["amount"]
        patient_id = payment_result[0]["patientid"]
        
        # Deduct the amount from patient's balance
        balance_result = execute_query(
            DEDUCT_PROCESS_PAYMENT,
            (amount, patient_id)
        )
        
        if not balance_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update patient balance"
            )
        
        # Get the updated process with all details
        updated_process = execute_query(
            GET_PROCESSES_BY_APPOINTMENT,
            (appointment_id,)
        )
        
        if not updated_process:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Process not found after payment"
            )
        
        # Parse billing JSON if needed
        for proc in updated_process:
            if proc.get("billing") and isinstance(proc["billing"], str):
                proc["billing"] = json.loads(proc["billing"])
        
        return updated_process[0]
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Payment error: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process payment: {str(e)}"
        ) 