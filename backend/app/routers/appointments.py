# app/routers/appointments.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, date
from ..utils.auth import get_current_user
from ..database import execute_query, execute_transaction
from ..schemas.appointment import AppointmentCreate, AppointmentResponse, StatusUpdate, ReviewCreate
from ..models.appointment_queries import *
import logging

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
        
        # Get doctor name and specialization
        doctor_info = execute_query(
            "SELECT u.name, d.specialization FROM Doctors d JOIN \"User\" u ON d.employeeid = u.userid WHERE d.employeeid = %s",
            (appointment.doctorID,)
        )
        
        doctor_name = doctor_info[0]["name"] if doctor_info else None
        specialization = doctor_info[0]["specialization"] if doctor_info else None
        
        # Return response formatted for the Pydantic model
        return {
            "appointmentid": appointment_id,
            "patientid": current_user["userid"],
            "doctorid": appointment.doctorID,
            "doctorname": doctor_name,
            "starttime": appointment.startTime,
            "endtime": appointment.endTime,
            "status": "scheduled",
            "rating": None,
            "review": None,
            "specialization": specialization
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
        status = status.lower()
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
    print(appointments)
    return appointments

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    status_update: StatusUpdate,
    current_user = Depends(get_current_user)
):
    
    # Normalize status to lowercase
    status_value = status_update.status.lower()
    
    # Validate status
    valid_statuses = ["scheduled", "completed", "cancelled"]
    if status_value not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of {valid_statuses}"
        )
    
    # Update status
    result = execute_query(UPDATE_APPOINTMENT_STATUS, (status_value, appointment_id))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Get updated appointment with doctor name and specialization
    appointment = execute_query(
        GET_APPOINTMENT_WITH_DOCTOR,
        (appointment_id,)
    )
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to retrieve updated appointment"
        )
    
    # Map process fields to camelCase for frontend compatibility
    appt = appointment[0]
    if "processes" in appt and isinstance(appt["processes"], list):
        new_processes = []
        for proc in appt["processes"]:
            new_proc = {
                "processid": proc.get("processid"),
                "processName": proc.get("processName") or proc.get("processname"),
                "processDescription": proc.get("processDescription") or proc.get("processdescription"),
                "status": proc.get("status"),
                "doctor_name": proc.get("doctor_name"),
                "process_date": proc.get("process_date"),
                "billing": proc.get("billing") or {
                    "amount": proc.get("amount"),
                    "paymentStatus": proc.get("paymentStatus") or proc.get("paymentstatus"),
                    "billingDate": proc.get("billingDate")
                }
            }
            new_processes.append(new_proc)
        appt["processes"] = new_processes
    return appt

@router.put("/{appointment_id}/review", response_model=AppointmentResponse)
async def add_appointment_review(
    appointment_id: int,
    review_data: ReviewCreate,
    current_user = Depends(get_current_user)
):
    """Add review to a completed appointment (for patients)"""
    logger = logging.getLogger("appointment_review")
    logger.info(f"User {current_user['userid']} ({current_user['role']}) is attempting to review appointment {appointment_id} with rating {review_data.rating} and review '{review_data.review}'")

    if current_user["role"] != "Patient":
        logger.warning(f"User {current_user['userid']} is not a patient. Forbidden.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can add reviews"
        )
    
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        logger.warning(f"Invalid rating {review_data.rating} for appointment {appointment_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Add review
    logger.info(f"Attempting to update appointment {appointment_id} for user {current_user['userid']} with rating {review_data.rating} and review '{review_data.review}'")
    result = execute_query(
        ADD_APPOINTMENT_REVIEW, 
        (review_data.rating, review_data.review, appointment_id, current_user["userid"])
    )
    logger.info(f"SQL update result: {result}")
    
    if not result:
        logger.error(f"Appointment {appointment_id} not found, not completed, or does not belong to user {current_user['userid']}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found or not completed"
        )
    
    # Get updated appointment with doctor name and specialization
    appointment = execute_query(
        GET_APPOINTMENT_WITH_DOCTOR,
        (appointment_id,)
    )
    logger.info(f"Fetched updated appointment: {appointment}")
    
    if not appointment:
        logger.error(f"Failed to retrieve updated appointment {appointment_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to retrieve updated appointment"
        )
    
    # Map process fields to camelCase for frontend compatibility
    appt = appointment[0]
    if "processes" in appt and isinstance(appt["processes"], list):
        new_processes = []
        for proc in appt["processes"]:
            new_proc = {
                "processid": proc.get("processid"),
                "processName": proc.get("processName") or proc.get("processname"),
                "processDescription": proc.get("processDescription") or proc.get("processdescription"),
                "status": proc.get("status"),
                "doctor_name": proc.get("doctor_name"),
                "process_date": proc.get("process_date"),
                "billing": proc.get("billing") or {
                    "amount": proc.get("amount"),
                    "paymentStatus": proc.get("paymentStatus") or proc.get("paymentstatus"),
                    "billingDate": proc.get("billingDate")
                }
            }
            new_processes.append(new_proc)
        appt["processes"] = new_processes
    return appt

