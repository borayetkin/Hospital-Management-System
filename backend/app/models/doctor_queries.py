# app/models/doctor_queries.py

# Get doctor profile
GET_DOCTOR_PROFILE = """
SELECT d.employeeID, u.name, d.specialization, d.doctorLocation, d.deptName,
       AVG(a.rating) as rating
FROM Doctors d
JOIN "User" u ON d.employeeID = u.userID
LEFT JOIN Appointment a ON d.employeeID = a.doctorID
WHERE d.employeeID = %s
GROUP BY d.employeeID, u.name, d.specialization, d.doctorLocation, d.deptName
"""

# Get doctor's patients
GET_DOCTOR_PATIENTS = """
SELECT DISTINCT p.patientID, u.name, p.email, p.phoneNumber, p.DOB
FROM Patients p
JOIN "User" u ON p.patientID = u.userID
JOIN Appointment a ON p.patientID = a.patientID
WHERE a.doctorID = %s
ORDER BY u.name
"""

# Get doctor stats
GET_DOCTOR_STATS = """
SELECT 
    COUNT(a.appointmentID) as appointmentCount,
    AVG(a.rating) as avgRating,
    (SELECT COUNT(*) FROM Prescribes pr WHERE pr.appointmentID IN 
        (SELECT appointmentID FROM Appointment WHERE doctorID = %s)) as prescriptionCount
FROM Appointment a
WHERE a.doctorID = %s
"""