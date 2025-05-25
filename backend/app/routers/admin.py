# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
from ..utils.auth import get_current_user
from ..database import execute_query
from ..models.admin_queries import *

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/doctors")
async def get_all_doctors(current_user = Depends(get_current_user)):
    """Get all doctors (for admin)"""
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )
    
    doctors = execute_query(GET_ALL_DOCTORS)
    return doctors

@router.get("/patients")
async def get_all_patients(current_user = Depends(get_current_user)):
    """Get all patients (for admin)"""
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )
    
    patients = execute_query(GET_ALL_PATIENTS)
    return patients

@router.get("/resources")
async def get_all_resources_admin(current_user = Depends(get_current_user)):
    """Get all medical resources (for admin)"""
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )
    
    resources = execute_query("SELECT * FROM MedicalResources")
    return resources

@router.get("/stats/appointments")
async def get_appointment_statistics(
    period: Optional[str] = "month",
    current_user = Depends(get_current_user)
):
    """Get appointment statistics for a time period (for admin)"""
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )
    
    # Calculate date range based on period
    end_date = datetime.now()
    
    if period == "week":
        start_date = end_date - timedelta(days=7)
    elif period == "month":
        start_date = end_date - timedelta(days=30)
    elif period == "quarter":
        start_date = end_date - timedelta(days=90)
    elif period == "year":
        start_date = end_date - timedelta(days=365)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Must be one of: week, month, quarter, year"
        )
    
    print(f"Date range for {period}: {start_date} to {end_date}")  # Debug log
    
    # Get all appointments regardless of date for now
    stats = execute_query(GET_APPOINTMENT_STATS, (start_date, end_date))
    
    if not stats:
        return {
            "totalAppointments": 0,
            "scheduledAppointments": 0,
            "completedAppointments": 0,
            "cancelledAppointments": 0,
            "period": period,
            "startDate": start_date,
            "endDate": end_date
        }
    
    result = stats[0]
    result["period"] = period
    result["startDate"] = start_date
    result["endDate"] = end_date
    
    print(f"Query result: {result}")  # Debug log
    return result

@router.get("/stats/revenue")
async def get_revenue_statistics(
    period: Optional[str] = "month",
    current_user = Depends(get_current_user)
):
    """Get revenue statistics for a time period (for admin)"""
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )
    
    # Calculate date range based on period
    end_date = datetime.now()
    
    if period == "week":
        start_date = end_date - timedelta(days=7)
    elif period == "month":
        start_date = end_date - timedelta(days=30)
    elif period == "quarter":
        start_date = end_date - timedelta(days=90)
    elif period == "year":
        start_date = end_date - timedelta(days=365)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Must be one of: week, month, quarter, year"
        )
    
    stats = execute_query(GET_REVENUE_STATS, (start_date, end_date))
    
    if not stats or stats[0]["totalrevenue"] is None:
        return {
            "totalRevenue": 0,
            "billingCount": 0,
            "avgBillingAmount": 0,
            "period": period,
            "startDate": start_date,
            "endDate": end_date
        }
    
    result = stats[0]
    result["period"] = period
    result["startDate"] = start_date
    result["endDate"] = end_date
    
    return result

@router.post("/reports/generate")
async def generate_report(current_user = Depends(get_current_user)):
    """Generate a new report with statistics (for admin)"""
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )
    
    try:
        # Create report
        report_result = execute_query(CREATE_REPORT, (current_user["userid"],))
        report_id = report_result[0]["reportid"]
        
        # Get all patients for statistics
        patients = execute_query("SELECT patientID FROM Patients")
        
        # Get all doctors for statistics
        doctors = execute_query("SELECT employeeID FROM Doctors")
        
        # Get all equipment for statistics
        resources = execute_query("SELECT resourceID FROM MedicalResources")
        
        # Get all appointments for statistics
        appointments = execute_query("SELECT appointmentID FROM Appointment")
        
        # Create statistics in a transaction
        transaction_queries = []
        
        # Patient statistics
        for i, patient in enumerate(patients):
            # Get patient stats
            patient_stats = execute_query("""
                SELECT 
                    COUNT(a.appointmentID) as totalAppointments,
                    COUNT(p.processID) as totalProcesses,
                    SUM(b.amount) as totalPaid,
                    MAX(a.startTime) as lastVisit
                FROM Patients pat
                LEFT JOIN Appointment a ON pat.patientID = a.patientID
                LEFT JOIN Process p ON a.appointmentID = p.appointmentID
                LEFT JOIN Billing b ON p.processID = b.processID
                WHERE pat.patientID = %s
                AND b.paymentStatus = 'Paid'
            """, (patient["patientid"],))
            
            if patient_stats and patient_stats[0]["totalappointments"] > 0:
                transaction_queries.append((
                    CREATE_PATIENT_STATISTICS,
                    (
                        report_id, 
                        i + 1,  # statID
                        patient["patientid"],
                        patient_stats[0]["totalappointments"] or 0,
                        patient_stats[0]["totalprocesses"] or 0,
                        patient_stats[0]["totalpaid"] or 0,
                        patient_stats[0]["lastvisit"]
                    )
                ))
        
        # Doctor statistics
        for i, doctor in enumerate(doctors):
            # Get doctor stats
            doctor_stats = execute_query("""
                SELECT 
                    COUNT(p.medicationName) as prescriptionCount,
                    COUNT(a.appointmentID) as appointmentCount,
                    SUM(b.amount) as totalRevenue,
                    AVG(a.rating) as ratings
                FROM Doctors d
                LEFT JOIN Appointment a ON d.employeeID = a.doctorID
                LEFT JOIN Prescribes p ON a.appointmentID = p.appointmentID
                LEFT JOIN Process pr ON a.appointmentID = pr.appointmentID
                LEFT JOIN Billing b ON pr.processID = b.processID
                WHERE d.employeeID = %s
                AND b.paymentStatus = 'Paid'
            """, (doctor["employeeid"],))
            
            if doctor_stats:
                transaction_queries.append((
                    CREATE_DOCTOR_STATISTICS,
                    (
                        report_id,
                        i + 1,  # statID
                        doctor["employeeid"],
                        doctor_stats[0]["prescriptioncount"] or 0,
                        doctor_stats[0]["appointmentcount"] or 0,
                        doctor_stats[0]["totalrevenue"] or 0,
                        doctor_stats[0]["ratings"]
                    )
                ))
        
        # Equipment statistics
        for i, resource in enumerate(resources):
            # Get resource stats
            resource_stats = execute_query("""
                SELECT 
                    COUNT(r.doctorID) as usageCount,
                    MAX(r.doctorID) as lastUsedBy,
                    COUNT(r.doctorID) as totalRequests
                FROM MedicalResources mr
                LEFT JOIN Request r ON mr.resourceID = r.resourceID
                WHERE mr.resourceID = %s
            """, (resource["resourceid"],))
            
            if resource_stats:
                transaction_queries.append((
                    CREATE_EQUIPMENT_STATISTICS,
                    (
                        i + 1,  # statID
                        report_id,
                        resource["resourceid"],
                        resource_stats[0]["usagecount"] or 0,
                        datetime.now().date() if resource_stats[0]["lastusedby"] else None,
                        resource_stats[0]["totalrequests"] or 0
                    )
                ))

        # Appointment statistics
        for i, appointment in enumerate(appointments):
            # Get appointment stats
            appointment_stats = execute_query("""
                SELECT 
                    a.status,
                    a.rating,
                    a.startTime,
                    a.endTime,
                    COUNT(p.processID) as totalProcesses,
                    SUM(b.amount) as totalBilling
                FROM Appointment a
                LEFT JOIN Process p ON a.appointmentID = p.appointmentID
                LEFT JOIN Billing b ON p.processID = b.processID
                WHERE a.appointmentID = %s
                GROUP BY a.appointmentID, a.status, a.rating, a.startTime, a.endTime
            """, (appointment["appointmentid"],))
            
            if appointment_stats:
                transaction_queries.append((
                    """
                    INSERT INTO AppointmentStatistics 
                    (statID, reportID, appointmentID, status, rating, startTime, endTime, totalProcesses, totalBilling)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        i + 1,  # statID
                        report_id,
                        appointment["appointmentid"],
                        appointment_stats[0]["status"],
                        appointment_stats[0]["rating"],
                        appointment_stats[0]["starttime"],
                        appointment_stats[0]["endtime"],
                        appointment_stats[0]["totalprocesses"] or 0,
                        appointment_stats[0]["totalbilling"] or 0
                    )
                ))
        
        # Execute transaction
        execute_transaction(transaction_queries)
        
        return {
            "reportID": report_id, 
            "message": "Report generated successfully",
            "timestamp": datetime.now(),
            "patientStatistics": len(patients),
            "doctorStatistics": len(doctors),
            "equipmentStatistics": len(resources),
            "appointmentStatistics": len(appointments)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )