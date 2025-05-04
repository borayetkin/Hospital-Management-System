# app/routers/appointments.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, date
from ..utils.auth import get_current_user
from ..database import execute_query, execute_transaction
from ..schemas.appointment import AppointmentCreate, AppointmentResponse
from ..models.appointment_queries import *

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("/doctors")
async def get_doctors_for_appointments(
    specialization: Optional[str] = None,
    min_rating: Optional[float] = None,
    current_user = Depends(get_current_user)
):
    """Get doctors for appointment booking, with optional filters"""
    # Build where clause based on provided filters
    where_conditions = []
    params = []
    
    if specialization:
        where_conditions.append("d.specialization = %s")
        params.append(specialization)
    
    if min_rating is not None:
        where_conditions.append("AVG(a.rating) >= %s")
        params.append(min_rating)
    
    where_clause = ""
    if where_conditions:
        where_clause = "WHERE " + " AND ".join(where_conditions)
    
    # Format the query with the where clause
    formatted_query = GET_DOCTORS_FOR_APPOINTMENTS.format(where_clause=where_clause)
    
    # Execute the query
    doctors = execute_query(formatted_query, params)
    return doctors

@router.get("/doctor/{doctor_id}/available-dates")
async def get_doctor_available_dates(
    doctor_id: int,
    current_user = Depends(get_current_user)
):
    """Get all available dates for a doctor"""
    dates = execute_query(GET_DOCTOR_AVAILABLE_DATES, (doctor_id,))
    
    # Extract date values from result
    available_dates = [row["date"].isoformat() for row in dates]
    return available_dates

@router.get("/doctor/{doctor_id}/slots")
async def get_doctor_slots(
    doctor_id: int,
    date: str,
    current_user = Depends(get_current_user)
):
    """Get available time slots for a doctor on a specific date"""
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    slots = execute_query(GET_DOCTOR_SLOTS, (doctor_id, parsed_date))
    return slots

@router.post("/book", response_model=AppointmentResponse)
async def book_appointment(
    appointment: AppointmentCreate,
    current_user = Depends(get_current_user)
):
    """Book a new appointment"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can book appointments"
        )
    
    # Check if slot is available
    slot = execute_query(
        CHECK_SLOT_AVAILABILITY, 
        (appointment.doctorID, appointment.startTime, appointment.endTime)
    )
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected time slot is not available"
        )
    
    # Book appointment in a transaction
    try:
        # Create appointment
        appointment_result = execute_query(
            CREATE_APPOINTMENT,
            (
                current_user["userid"],
                appointment.doctorID,
                appointment.startTime,
                appointment.endTime
            )
        )
        
        appointment_id = appointment_result[0]["appointmentid"]
        
        # Update slot availability
        execute_query(
            UPDATE_SLOT_STATUS,
            (appointment.doctorID, appointment.startTime, appointment.endTime),
            fetch=False
        )
        
        return {
            "appointmentID": appointment_id,
            "patientID": current_user["userid"],
            "doctorID": appointment.doctorID,
            "startTime": appointment.startTime,
            "endTime": appointment.endTime,
            "status": "Scheduled",
            "rating": None,
            "review": None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book appointment: {str(e)}"
        )

@router.get("/patient", response_model=List[AppointmentResponse])
async def get_patient_appointments(
    current_user = Depends(get_current_user),
    status: Optional[str] = None
):
    """Get current patient's appointments"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a patient"
        )
    
    status_clause = ""
    params = [current_user["userid"]]
    
    if status:
        status_clause = "AND a.status = %s"
        params.append(status)
    
    formatted_query = GET_PATIENT_APPOINTMENTS.format(status_clause=status_clause)
    appointments = execute_query(formatted_query, params)
    return appointments

@router.get("/doctor", response_model=List[AppointmentResponse])
async def get_doctor_appointments(
    current_user = Depends(get_current_user),
    status: Optional[str] = None,
    upcoming: Optional[bool] = None
):
    """Get current doctor's appointments"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not a doctor"
        )
    
    status_clause = ""
    time_clause = ""
    order = "DESC"
    params = [current_user["userid"]]
    
    if status:
        status_clause = "AND a.status = %s"
        params.append(status)
    
    if upcoming is not None:
        if upcoming:
            time_clause = "AND a.startTime > NOW()"
            order = "ASC"
        else:
            time_clause = "AND a.startTime <= NOW()"
    
    formatted_query = GET_DOCTOR_APPOINTMENTS.format(
        status_clause=status_clause,
        time_clause=time_clause,
        order=order
    )
    
    appointments = execute_query(formatted_query, params)
    return appointments

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    status: str,
    current_user = Depends(get_current_user)
):
    """Update appointment status (for doctors)"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can update appointment status"
        )
    
    # Validate status
    valid_statuses = ["Scheduled", "Completed", "Cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of {valid_statuses}"
        )
    
    # Update status
    result = execute_query(UPDATE_APPOINTMENT_STATUS, (status, appointment_id))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Get updated appointment
    appointment = execute_query(
        """
        SELECT a.appointmentID, a.patientID, a.doctorID, a.startTime, a.endTime, 
               a.status, a.rating, a.review
        FROM Appointment a
        WHERE a.appointmentID = %s
        """,
        (appointment_id,)
    )
    
    return appointment[0]

@router.put("/{appointment_id}/review")
async def add_appointment_review(
    appointment_id: int,
    rating: float,
    review: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Add review to a completed appointment (for patients)"""
    if current_user["role"] != "Patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can add reviews"
        )
    
    # Validate rating
    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Add review
    result = execute_query(
        ADD_APPOINTMENT_REVIEW, 
        (rating, review, appointment_id, current_user["userid"])
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found or not completed"
        )
    
    return {"message": "Review added successfully"}