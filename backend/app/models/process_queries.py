# app/models/process_queries.py

# Get patient's medical processes
GET_PATIENT_PROCESSES = """
SELECT 
    P.processid,
    P.processName AS "processName",
    P.processDescription AS "processDescription",
    U2.name AS doctor_name,
    DATE(A.startTime) AS process_date,
    P.status,
    B.amount,
    B.paymentStatus
FROM User U
JOIN Patients Pa ON U.userID = Pa.patientID
JOIN Appointment A ON Pa.patientID = A.patientID
JOIN Doctors D ON A.doctorID = D.employeeID
JOIN User U2 ON D.employeeID = U2.userID
JOIN Process P ON A.appointmentID = P.appointmentID
JOIN Billing B ON P.processid = B.processid
WHERE U.name = %s
ORDER BY A.startTime
"""

# Get doctor's patient processes
GET_DOCTOR_PATIENT_PROCESSES = """
SELECT 
    pr.processid,
    pr.processName AS "processName",
    pr.processDescription AS "processDescription",
    pr.status,
    a.startTime AS "process_date",
    b.amount,
    b.paymentStatus,
    d.name AS "doctor_name"
FROM Process pr
JOIN Appointment a ON pr.appointmentID = a.appointmentID
LEFT JOIN Billing b ON pr.processid = b.processid
JOIN "User" d ON d.userID = a.doctorID
WHERE a.patientID = %s
AND a.doctorID = %s
ORDER BY a.startTime DESC
"""

# Get appointments for process creation
GET_APPOINTMENTS_FOR_PROCESS = """
SELECT 
    a.appointmentID, a.startTime
FROM Appointment a
WHERE a.patientID = %s
AND a.doctorID = %s
ORDER BY a.startTime DESC
"""

# Create new medical process
CREATE_MEDICAL_PROCESS = """
INSERT INTO Process (
    processName, processDescription, status, appointmentID
)
VALUES (%s, %s, 'Scheduled', %s)
RETURNING processid
"""

# Create billing for process
CREATE_PROCESS_BILLING = """
INSERT INTO Billing (
    billingDate, amount, paymentStatus, processid
)
VALUES (NOW(), %s, 'Pending', %s)
RETURNING billingID
"""

# Update process status
UPDATE_PROCESS_STATUS = """
UPDATE Process
SET status = %s
WHERE processid = %s
RETURNING processid
"""

# Update patient statistics for new process
UPDATE_PATIENT_STATISTICS = """
UPDATE PatientStatistics
SET totalProcesses = totalProcesses + 1
WHERE patientID = %s
AND reportDate = CURRENT_DATE
"""

# Get processes by appointment
GET_PROCESSES_BY_APPOINTMENT = """
SELECT 
    processid,
    processname AS "processName",
    processdescription AS "processDescription",
    status,
    appointmentid
FROM Process
WHERE appointmentid = %s
ORDER BY processid DESC
""" 