from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timedelta
import logging
from ..models.admin_queries import (
    CREATE_REPORT,
    GET_REPORT_BY_ID,
    GET_ALL_REPORTS,
    GET_PATIENT_STATISTICS,
    GET_DOCTOR_STATISTICS,
    GET_EQUIPMENT_STATISTICS,
    GENERATE_PATIENT_STATS,
    GENERATE_DOCTOR_STATS,
    GENERATE_EQUIPMENT_STATS
)
from ..database import execute_query, execute_transaction
from ..utils.auth import get_current_user
from ..schemas.report import (
    ReportGenerationRequest,
    ReportBase,
    ReportDetail,
    PatientStatistics,
    DoctorStatistics,
    EquipmentStatistics
)

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)

logger = logging.getLogger(__name__)

# SQL Queries
CREATE_REPORT = """
    INSERT INTO Report (created_by, time_stamp) 
    VALUES (%s, %s) 
    RETURNING reportID
"""

@router.post("/", response_model=ReportBase)
async def create_report(
    request: ReportGenerationRequest,
    current_user = Depends(get_current_user)
):

    try:
        logger.info(f"Creating report with request: {request}")
        
        # Use provided dates if available, otherwise calculate based on timeframe
        end_date = request.end_date if request.end_date else datetime.now()
        
        if request.start_date:
            start_date = request.start_date
        else:
            # Calculate date range based on timeframe
            if request.timeframe == "weekly":
                start_date = end_date - timedelta(days=7)
            elif request.timeframe == "monthly":
                # If current day is after 15th, calculate for current month's period (15th to next 15th)
                # If current day is before or on 15th, calculate for previous month's period
                current_day = end_date.day
                if current_day > 15:
                    # Period is 15th of current month to 15th of next month
                    start_date = end_date.replace(day=15, hour=0, minute=0, second=0, microsecond=0)
                    if end_date.month == 12:
                        end_date = end_date.replace(year=end_date.year + 1, month=1, day=15, hour=23, minute=59, second=59, microsecond=999999)
                    else:
                        end_date = end_date.replace(month=end_date.month + 1, day=15, hour=23, minute=59, second=59, microsecond=999999)
                else:
                    # Period is 15th of previous month to 15th of current month
                    if end_date.month == 1:
                        start_date = end_date.replace(year=end_date.year - 1, month=12, day=15, hour=0, minute=0, second=0, microsecond=0)
                    else:
                        start_date = end_date.replace(month=end_date.month - 1, day=15, hour=0, minute=0, second=0, microsecond=0)
                    end_date = end_date.replace(day=15, hour=23, minute=59, second=59, microsecond=999999)
            else:  # yearly
                start_date = end_date.replace(year=end_date.year - 1)
                
                # Align to 15th if it's a yearly report too
                start_date = start_date.replace(day=15, hour=0, minute=0, second=0, microsecond=0)
                end_date = end_date.replace(day=15, hour=23, minute=59, second=59, microsecond=999999)

        logger.info(f"Using date range: {start_date} to {end_date}")

        # Create the report with timestamp
        report_result = execute_query(CREATE_REPORT, (current_user["userid"], end_date))
        if not report_result:
            raise HTTPException(status_code=500, detail="Failed to create report")
        report_id = report_result[0]["reportid"]
        logger.info(f"Created report with ID: {report_id}")

        # Prepare all queries for transaction
        transaction_queries = []
        
        # Delete any existing statistics for this report ID (cleanup)
        transaction_queries.extend([
            ("DELETE FROM PatientStatistics WHERE reportID = %s", (report_id,)),
            ("DELETE FROM DoctorStatistics WHERE reportID = %s", (report_id,)),
            ("DELETE FROM EquipmentStatistics WHERE reportID = %s", (report_id,))
        ])

        # Add patient statistics if patients are selected
        if request.patient_ids:
            logger.info(f"Generating patient statistics for IDs: {request.patient_ids}")
            patient_ids_str = ','.join(map(str, request.patient_ids))
            
            patient_stats_query = f"""
                INSERT INTO PatientStatistics (reportID, statID, patientID, totalAppointments, totalProcesses, totalPaid, lastVisit, reportDate)
                SELECT 
                    %s as reportID,
                    ROW_NUMBER() OVER (ORDER BY p.patientID) as statID,
                    p.patientID,
                    COALESCE(COUNT(DISTINCT a.appointmentID) FILTER (WHERE a.startTime BETWEEN %s AND %s), 0) as totalAppointments,
                    COALESCE(COUNT(DISTINCT pr.processID) FILTER (WHERE a.startTime BETWEEN %s AND %s), 0) as totalProcesses,
                    COALESCE(SUM(b.amount) FILTER (WHERE b.paymentStatus = 'Paid' AND a.startTime BETWEEN %s AND %s), 0) as totalPaid,
                    MAX(DATE(a.startTime)) FILTER (WHERE a.startTime <= %s) as lastVisit,
                    CURRENT_DATE as reportDate
                FROM Patients p
                LEFT JOIN Appointment a ON p.patientID = a.patientID
                LEFT JOIN Process pr ON a.appointmentID = pr.appointmentID
                LEFT JOIN Billing b ON pr.processID = b.processID
                WHERE p.patientID IN ({patient_ids_str})
                GROUP BY p.patientID
                ORDER BY p.patientID
            """
            transaction_queries.append((
                patient_stats_query, 
                (report_id, start_date, end_date, start_date, end_date, start_date, end_date, end_date)
            ))

        # Add doctor statistics if doctors are selected
        if request.doctor_ids:
            logger.info(f"Generating doctor statistics for IDs: {request.doctor_ids}")
            doctor_ids_str = ','.join(map(str, request.doctor_ids))
            
            doctor_stats_query = f"""
                INSERT INTO DoctorStatistics (reportID, statID, doctorID, prescriptionCount, appointmentCount, totalRevenue, reportDate, ratings)
                SELECT 
                    %s as reportID,
                    ROW_NUMBER() OVER (ORDER BY d.employeeID) as statID,
                    d.employeeID as doctorID,
                    COALESCE(COUNT(DISTINCT pr.medicationName) FILTER (WHERE a.startTime BETWEEN %s AND %s), 0) as prescriptionCount,
                    COALESCE(COUNT(DISTINCT a.appointmentID) FILTER (WHERE a.startTime BETWEEN %s AND %s), 0) as appointmentCount,
                    COALESCE(SUM(b.amount) FILTER (WHERE b.paymentStatus = 'Paid' AND a.startTime BETWEEN %s AND %s), 0) as totalRevenue,
                    CURRENT_DATE as reportDate,
                    COALESCE(AVG(a.rating) FILTER (WHERE a.status = 'completed' AND a.startTime BETWEEN %s AND %s), 0) as ratings
                FROM Doctors d
                LEFT JOIN Appointment a ON d.employeeID = a.doctorID
                LEFT JOIN Prescribes pr ON a.appointmentID = pr.appointmentID
                LEFT JOIN Process p ON a.appointmentID = p.appointmentID
                LEFT JOIN Billing b ON p.processID = b.processID
                WHERE d.employeeID IN ({doctor_ids_str})
                GROUP BY d.employeeID
                ORDER BY d.employeeID
            """
            transaction_queries.append((
                doctor_stats_query,
                (report_id, start_date, end_date, start_date, end_date, start_date, end_date, start_date, end_date)
            ))

        # Add equipment statistics if equipment is selected
        if request.equipment_ids:
            logger.info(f"Generating equipment statistics for IDs: {request.equipment_ids}")
            equipment_ids_str = ','.join(map(str, request.equipment_ids))
            
            equipment_stats_query = f"""
                INSERT INTO EquipmentStatistics (statID, reportID, resourceID, usageCount, lastUsedDate, totalRequests)
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY mr.resourceID) as statID,
                    %s as reportID,
                    mr.resourceID,
                    COALESCE(COUNT(DISTINCT r.doctorID) FILTER (WHERE r.timestamp BETWEEN %s AND %s), 0) as usageCount,
                    COALESCE(MAX(DATE(r.timestamp)) FILTER (WHERE r.timestamp <= %s), CURRENT_DATE) as lastUsedDate,
                    COALESCE(COUNT(r.doctorID) FILTER (WHERE r.timestamp BETWEEN %s AND %s), 0) as totalRequests
                FROM MedicalResources mr
                LEFT JOIN Request r ON mr.resourceID = r.resourceID
                WHERE mr.resourceID IN ({equipment_ids_str})
                GROUP BY mr.resourceID
                ORDER BY mr.resourceID
            """
            transaction_queries.append((
                equipment_stats_query,
                (report_id, start_date, end_date, end_date, start_date, end_date)
            ))
        
        # Execute all queries in a transaction
        if len(transaction_queries) > 3:  # More than just the DELETE queries
            logger.info("Executing statistics generation in transaction")
            execute_transaction(transaction_queries)
        else:
            logger.info("No statistics to generate - no items selected")
            # Still execute the cleanup queries
            execute_transaction(transaction_queries[:3])
        
        # Get the final report
        report = execute_query(GET_REPORT_BY_ID, (report_id,))
        if not report:
            raise HTTPException(status_code=500, detail="Failed to retrieve created report")
        
        logger.info(f"Successfully created report: {report[0]}")
        return report[0]
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[ReportBase])
async def get_all_reports(
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )

    try:
        reports = execute_query(GET_ALL_REPORTS)
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}", response_model=ReportDetail)
async def get_report(
    report_id: int,
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )

    try:
        # Get report details
        report = execute_query(GET_REPORT_BY_ID, (report_id,))
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        report = report[0]
            
        # Get statistics
        patient_stats = execute_query(GET_PATIENT_STATISTICS, (report_id,))
        doctor_stats = execute_query(GET_DOCTOR_STATISTICS, (report_id,))
        equipment_stats = execute_query("""
            SELECT es.*, mr.name as resourcename 
            FROM EquipmentStatistics es
            JOIN MedicalResources mr ON es.resourceID = mr.resourceID 
            WHERE es.reportID = %s
        """, (report_id,))
        
        return {
            **report,
            "patientStatistics": patient_stats,
            "doctorStatistics": doctor_stats,
            "equipmentStatistics": equipment_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 