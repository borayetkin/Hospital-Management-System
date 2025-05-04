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
    COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduledAppointments,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completedAppointments,
    COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelledAppointments
FROM Appointment
WHERE startTime BETWEEN %s AND %s
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