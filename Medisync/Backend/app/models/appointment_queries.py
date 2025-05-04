# app/models/appointment_queries.py

# Get doctors for appointments
GET_DOCTORS_FOR_APPOINTMENTS = """
SELECT d.employeeID, u.name, d.specialization, 
       AVG(a.rating) as rating
FROM Doctors d
JOIN "User" u ON d.employeeID = u.userID
LEFT JOIN Appointment a ON d.doctorID = a.doctorID
{where_clause}
GROUP BY d.employeeID, u.name, d.specialization
ORDER BY rating DESC NULLS LAST
"""

# Get doctor's available slots
GET_DOCTOR_SLOTS = """
SELECT doctorID, startTime, endTime
FROM Slots
WHERE doctorID = %s
AND DATE(startTime) = %s
AND availability = 'Available'
ORDER BY startTime
"""

# Get all available dates for a doctor
GET_DOCTOR_AVAILABLE_DATES = """
SELECT DISTINCT DATE(startTime) as date
FROM Slots
WHERE doctorID = %s
AND availability = 'Available'
AND startTime > NOW()
ORDER BY date
"""

# Check slot availability
CHECK_SLOT_AVAILABILITY = """
SELECT doctorID, startTime, endTime
FROM Slots
WHERE doctorID = %s
AND startTime = %s
AND endTime = %s
AND availability = 'Available'
"""

# Check patient balance
CHECK_PATIENT_BALANCE = """
SELECT Balance
FROM Patients
WHERE patientID = %s AND Balance >= %s
"""

# Create appointment
CREATE_APPOINTMENT = """
INSERT INTO Appointment (status, rating, review, patientID, doctorID, startTime, endTime)
VALUES ('Scheduled', NULL, NULL, %s, %s, %s, %s)
RETURNING appointmentID
"""

# Update slot availability
UPDATE_SLOT_STATUS = """
UPDATE Slots
SET availability = 'Booked'
WHERE doctorID = %s AND startTime = %s AND endTime = %s
"""

# Deduct appointment fee
DEDUCT_BALANCE = """
UPDATE Patients
SET Balance = Balance - %s
WHERE patientID = %s
"""

# Get patient appointments
GET_PATIENT_APPOINTMENTS = """
SELECT a.appointmentID, a.patientID, a.doctorID, a.startTime, a.endTime, 
       a.status, a.rating, a.review, u.name as doctorName,
       d.specialization
FROM Appointment a
JOIN Doctors d ON a.doctorID = d.employeeID
JOIN "User" u ON d.employeeID = u.userID
WHERE a.patientID = %s
{status_clause}
ORDER BY a.startTime DESC
"""

# Get doctor appointments
GET_DOCTOR_APPOINTMENTS = """
SELECT a.appointmentID, a.patientID, a.doctorID, a.startTime, a.endTime, 
       a.status, a.rating, a.review, u.name as patientName
FROM Appointment a
JOIN Patients p ON a.patientID = p.patientID
JOIN "User" u ON p.patientID = u.userID
WHERE a.doctorID = %s
{status_clause}
{time_clause}
ORDER BY a.startTime {order}
"""

# Update appointment status
UPDATE_APPOINTMENT_STATUS = """
UPDATE Appointment
SET status = %s
WHERE appointmentID = %s
RETURNING appointmentID
"""

# Add review to appointment
ADD_APPOINTMENT_REVIEW = """
UPDATE Appointment
SET rating = %s, review = %s
WHERE appointmentID = %s
AND patientID = %s
AND status = 'Completed'
RETURNING appointmentID
"""