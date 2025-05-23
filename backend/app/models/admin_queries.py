# app/models/admin_queries.py

# Get all doctors
GET_ALL_DOCTORS = """
SELECT d.employeeID, u.name, d.specialization, d.doctorLocation, d.deptName,
       AVG(a.rating) as rating
FROM Doctors d
JOIN "User" u ON d.employeeID = u.userID
LEFT JOIN Appointment a ON d.employeeID = a.doctorID
GROUP BY d.employeeID, u.name, d.specialization, d.doctorLocation, d.deptName
ORDER BY u.name
"""

# Get all patients
GET_ALL_PATIENTS = """
SELECT p.patientID, u.name, p.email, p.phoneNumber, p.DOB, p.Balance
FROM Patients p
JOIN "User" u ON p.patientID = u.userID
ORDER BY u.name
"""

# Get appointment stats
GET_APPOINTMENT_STATS = """
SELECT 
    COUNT(*) as totalAppointments,
    COUNT(CASE WHEN status = 'scheduled' or status = 'Scheduled' THEN 1 END) as scheduledAppointments,
    COUNT(CASE WHEN status = 'completed' or status = 'Completed' THEN 1 END) as completedAppointments,
    COUNT(CASE WHEN status = 'cancelled' or status = 'Cancelled' THEN 1 END) as cancelledAppointments
FROM Appointment
WHERE starttime BETWEEN %s AND %s
"""

# Get revenue stats
GET_REVENUE_STATS = """
SELECT 
    SUM(b.amount) as totalRevenue,
    COUNT(b.billingID) as billingCount,
    AVG(b.amount) as avgBillingAmount
FROM Billing b
WHERE b.billingDate BETWEEN %s AND %s
AND b.paymentStatus = 'Paid'
"""

# Create report
CREATE_REPORT = """
INSERT INTO Report (created_by, time_stamp)
VALUES (%s, NOW())
RETURNING reportID
"""

# Create patient statistics
CREATE_PATIENT_STATISTICS = """
INSERT INTO PatientStatistics (reportID, statID, patientID, totalAppointments, totalProcesses, totalPaid, lastVisit, reportDate)
VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_DATE)
"""

# Create doctor statistics
CREATE_DOCTOR_STATISTICS = """
INSERT INTO DoctorStatistics (reportID, statID, doctorID, prescriptionCount, appointmentCount, totalRevenue, reportDate, ratings)
VALUES (%s, %s, %s, %s, %s, %s, CURRENT_DATE, %s)
"""

# Create equipment statistics
CREATE_EQUIPMENT_STATISTICS = """
INSERT INTO EquipmentStatistics (statID, reportID, resourceID, usageCount, lastUsedDate, totalRequests)
VALUES (%s, %s, %s, %s, %s, %s)
"""

# Get report by ID
GET_REPORT_BY_ID = """
SELECT r.reportID, r.created_by, r.time_stamp
FROM Report r
WHERE r.reportID = %s
"""

# Get all reports
GET_ALL_REPORTS = """
SELECT r.reportID, r.created_by, r.time_stamp
FROM Report r
ORDER BY r.time_stamp DESC
"""

# Get patient statistics for a report
GET_PATIENT_STATISTICS = """
SELECT ps.reportID, ps.statID, ps.patientID, ps.totalAppointments, 
       ps.totalProcesses, ps.totalPaid, ps.lastVisit, ps.reportDate,
       u.name as patientName
FROM PatientStatistics ps
JOIN Patients p ON ps.patientID = p.patientID
JOIN "User" u ON p.patientID = u.userID
WHERE ps.reportID = %s
ORDER BY ps.patientID
"""

# Get doctor statistics for a report
GET_DOCTOR_STATISTICS = """
SELECT ds.reportID, ds.statID, ds.doctorID, ds.prescriptionCount,
       ds.appointmentCount, ds.totalRevenue, ds.reportDate, ds.ratings,
       u.name as doctorName, d.specialization
FROM DoctorStatistics ds
JOIN Doctors d ON ds.doctorID = d.employeeID
JOIN "User" u ON d.employeeID = u.userID
WHERE ds.reportID = %s
ORDER BY ds.doctorID
"""

# Get equipment statistics for a report
GET_EQUIPMENT_STATISTICS = """
SELECT es.statID, es.reportID, es.resourceID, es.usageCount,
       es.lastUsedDate, es.totalRequests,
       mr.name as resourceName
FROM EquipmentStatistics es
JOIN MedicalResources mr ON es.resourceID = mr.resourceID
WHERE es.reportID = %s
ORDER BY es.resourceID
"""

# Generate patient statistics
GENERATE_PATIENT_STATS = """
WITH patient_metrics AS (
    SELECT 
        p.patientID,
        COUNT(DISTINCT a.appointmentID) as totalAppointments,
        COUNT(DISTINCT pr.processID) as totalProcesses,
        COALESCE(SUM(b.amount), 0) as totalPaid,
        MAX(a.startTime) as lastVisit
    FROM Patients p
    LEFT JOIN Appointment a ON p.patientID = a.patientID
    LEFT JOIN Process pr ON a.appointmentID = pr.appointmentID
    LEFT JOIN Billing b ON pr.processID = b.processID
    WHERE a.startTime BETWEEN %s AND %s
    GROUP BY p.patientID
)
INSERT INTO PatientStatistics (reportID, statID, patientID, totalAppointments, totalProcesses, totalPaid, lastVisit, reportDate)
SELECT 
    %s as reportID,
    ROW_NUMBER() OVER () as statID,
    patientID,
    totalAppointments,
    totalProcesses,
    totalPaid,
    lastVisit,
    CURRENT_DATE
FROM patient_metrics
"""

# Generate doctor statistics
GENERATE_DOCTOR_STATS = """
WITH doctor_metrics AS (
    SELECT 
        d.employeeID as doctorID,
        COUNT(DISTINCT pr.medicationName) as prescriptionCount,
        COUNT(DISTINCT a.appointmentID) as appointmentCount,
        COALESCE(SUM(b.amount), 0) as totalRevenue,
        AVG(a.rating) as ratings
    FROM Doctors d
    LEFT JOIN Appointment a ON d.employeeID = a.doctorID
    LEFT JOIN Prescribes pr ON a.appointmentID = pr.appointmentID
    LEFT JOIN Process p ON a.appointmentID = p.appointmentID
    LEFT JOIN Billing b ON p.processID = b.processID
    WHERE a.startTime BETWEEN %s AND %s
    GROUP BY d.employeeID
)
INSERT INTO DoctorStatistics (reportID, statID, doctorID, prescriptionCount, appointmentCount, totalRevenue, reportDate, ratings)
SELECT 
    %s as reportID,
    ROW_NUMBER() OVER () as statID,
    doctorID,
    prescriptionCount,
    appointmentCount,
    totalRevenue,
    CURRENT_DATE,
    COALESCE(ratings, 0)
FROM doctor_metrics
"""

# Generate equipment statistics
GENERATE_EQUIPMENT_STATS = """
WITH equipment_metrics AS (
    SELECT 
        mr.resourceID,
        COUNT(DISTINCT r.doctorID) as usageCount,
        MAX(r.status) as lastStatus,
        COUNT(DISTINCT r.doctorID) as totalRequests
    FROM MedicalResources mr
    LEFT JOIN Request r ON mr.resourceID = r.resourceID
    WHERE r.status IS NOT NULL
    GROUP BY mr.resourceID
)
INSERT INTO EquipmentStatistics (statID, reportID, resourceID, usageCount, lastUsedDate, totalRequests)
SELECT 
    ROW_NUMBER() OVER () as statID,
    %s as reportID,
    resourceID,
    usageCount,
    CURRENT_DATE as lastUsedDate,
    totalRequests
FROM equipment_metrics
"""