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

@router.post("/", response_model=ReportBase)
async def create_report(
    request: ReportGenerationRequest,
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin only"
        )

    try:
        logger.info(f"Creating report with request: {request}")
        
        # Calculate date range based on timeframe
        end_date = datetime.now()
        if request.timeframe == "weekly":
            start_date = end_date - timedelta(days=7)
        elif request.timeframe == "monthly":
            start_date = end_date - timedelta(days=30)
        else:  # yearly
            start_date = end_date - timedelta(days=365)

        # First create the report to get the report ID
        report_result = execute_query(CREATE_REPORT, (current_user["userid"],))
        if not report_result:
            raise HTTPException(status_code=500, detail="Failed to create report")
        report_id = report_result[0]["reportid"]
        logger.info(f"Created report with ID: {report_id}")

        # Delete any existing statistics for this report to prevent duplicates
        execute_query("DELETE FROM PatientStatistics WHERE reportID = %s", (report_id,), fetch=False)
        execute_query("DELETE FROM DoctorStatistics WHERE reportID = %s", (report_id,), fetch=False)
        execute_query("DELETE FROM EquipmentStatistics WHERE reportID = %s", (report_id,), fetch=False)

        # Generate statistics with the report ID
        queries = []
        
        # Add patient statistics only if patients are explicitly selected
        if request.patient_ids:
            logger.info(f"Generating patient statistics for IDs: {request.patient_ids}")
            patient_ids_str = ','.join(map(str, request.patient_ids))
            queries.append((f"""
                WITH patient_metrics AS (
                    SELECT 
                        p.patientID,
                        u.name,
                        COUNT(DISTINCT a.appointmentID) as totalAppointments,
                        COUNT(DISTINCT pr.processID) as totalProcesses,
                        COALESCE(SUM(CASE WHEN b.paymentStatus = 'Paid' THEN b.amount ELSE 0 END), 0) as totalPaid,
                        MAX(a.startTime) as lastVisit
                    FROM Patients p
                    JOIN "User" u ON p.patientID = u.userID
                    LEFT JOIN Appointment a ON p.patientID = a.patientID
                    LEFT JOIN Process pr ON a.appointmentID = pr.appointmentID
                    LEFT JOIN Billing b ON pr.processID = b.processID
                    WHERE p.patientID IN ({patient_ids_str})
                    AND (a.startTime BETWEEN %s AND %s OR a.startTime IS NULL)
                    GROUP BY p.patientID, u.name
                )
                INSERT INTO PatientStatistics (reportID, statID, patientID, totalAppointments, totalProcesses, totalPaid, lastVisit, reportDate)
                SELECT 
                    %s as reportID,
                    ROW_NUMBER() OVER () as statID,
                    patientID,
                    COALESCE(totalAppointments, 0),
                    COALESCE(totalProcesses, 0),
                    COALESCE(totalPaid, 0),
                    lastVisit,
                    CURRENT_DATE
                FROM patient_metrics
            """, (start_date, end_date, report_id)))

        # Add doctor statistics only if doctors are explicitly selected
        if request.doctor_ids:
            logger.info(f"Generating doctor statistics for IDs: {request.doctor_ids}")
            doctor_ids_str = ','.join(map(str, request.doctor_ids))
            queries.append((f"""
                WITH doctor_metrics AS (
                    SELECT 
                        d.employeeID as doctorID,
                        u.name,
                        d.specialization,
                        COUNT(DISTINCT pr.medicationName) as prescriptionCount,
                        COUNT(DISTINCT a.appointmentID) as appointmentCount,
                        COALESCE(SUM(CASE WHEN b.paymentStatus = 'Paid' THEN b.amount ELSE 0 END), 0) as totalRevenue,
                        AVG(CASE WHEN a.status = 'completed' THEN a.rating ELSE NULL END) as ratings
                    FROM Doctors d
                    JOIN "User" u ON d.employeeID = u.userID
                    LEFT JOIN Appointment a ON d.employeeID = a.doctorID
                    LEFT JOIN Prescribes pr ON a.appointmentID = pr.appointmentID
                    LEFT JOIN Process p ON a.appointmentID = p.appointmentID
                    LEFT JOIN Billing b ON p.processID = b.processID
                    WHERE d.employeeID IN ({doctor_ids_str})
                    AND (a.startTime BETWEEN %s AND %s OR a.startTime IS NULL)
                    GROUP BY d.employeeID, u.name, d.specialization
                )
                INSERT INTO DoctorStatistics (reportID, statID, doctorID, prescriptionCount, appointmentCount, totalRevenue, reportDate, ratings)
                SELECT 
                    %s as reportID,
                    ROW_NUMBER() OVER () as statID,
                    doctorID,
                    COALESCE(prescriptionCount, 0),
                    COALESCE(appointmentCount, 0),
                    COALESCE(totalRevenue, 0),
                    CURRENT_DATE,
                    COALESCE(ratings, 0)
                FROM doctor_metrics
            """, (start_date, end_date, report_id)))

        # Add equipment statistics only if equipment is explicitly selected
        if request.equipment_ids:
            logger.info(f"Generating equipment statistics for IDs: {request.equipment_ids}")
            equipment_ids_str = ','.join(map(str, request.equipment_ids))
            queries.append((f"""
                WITH equipment_metrics AS (
                    SELECT 
                        mr.resourceID,
                        mr.name as resourceName,
                        COUNT(DISTINCT r.doctorID) as usageCount,
                        MAX(r.status) as lastStatus,
                        COUNT(DISTINCT r.doctorID) as totalRequests
                    FROM MedicalResources mr
                    LEFT JOIN Request r ON mr.resourceID = r.resourceID
                    WHERE mr.resourceID IN ({equipment_ids_str})
                    GROUP BY mr.resourceID, mr.name
                )
                INSERT INTO EquipmentStatistics (statID, reportID, resourceID, resourceName, usageCount, lastUsedDate, totalRequests)
                SELECT 
                    ROW_NUMBER() OVER () as statID,
                    %s as reportID,
                    resourceID,
                    resourceName,
                    COALESCE(usageCount, 0),
                    CURRENT_DATE as lastUsedDate,
                    COALESCE(totalRequests, 0)
                FROM equipment_metrics
            """, (report_id,)))
        
        # Execute all queries in a transaction
        if queries:
            logger.info("Executing statistics generation queries")
            execute_transaction(queries)
        else:
            logger.info("No statistics to generate - no items selected")
        
        # Get the final report with the correct ID
        report = execute_query(GET_REPORT_BY_ID, (report_id,))[0]
        logger.info(f"Successfully created report: {report}")
        return report
    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
        equipment_stats = execute_query(GET_EQUIPMENT_STATISTICS, (report_id,))
        
        return {
            **report,
            "patientStatistics": patient_stats,
            "doctorStatistics": doctor_stats,
            "equipmentStatistics": equipment_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 