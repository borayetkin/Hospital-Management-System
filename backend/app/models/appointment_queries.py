# app/models/appointment_queries.py

# Get doctors for appointments
GET_DOCTORS_FOR_APPOINTMENTS = """
SELECT d.employeeid, u.name, d.specialization, 
       AVG(a.rating) as rating
FROM Doctors d
JOIN "User" u ON d.employeeid = u.userid
LEFT JOIN Appointment a ON d.employeeid = a.doctorid
{where_clause}
GROUP BY d.employeeid, u.name, d.specialization
ORDER BY rating DESC NULLS LAST
"""

# Get doctor's available slots
GET_DOCTOR_SLOTS = """
SELECT doctorid, starttime, endtime
FROM Slots
WHERE doctorid = %s
AND DATE(starttime) = %s
AND availability = 'available'
ORDER BY starttime
"""

# Get all available dates for a doctor
GET_DOCTOR_AVAILABLE_DATES = """
SELECT DISTINCT DATE(starttime) as date
FROM Slots
WHERE doctorid = %s
AND availability = 'available'
AND starttime > NOW()
ORDER BY date
"""

# Check slot availability
CHECK_SLOT_AVAILABILITY = """
SELECT doctorid, starttime, endtime
FROM Slots
WHERE doctorid = %s
AND starttime = %s
AND endtime = %s
AND availability = 'available'
"""

# Check patient balance
CHECK_PATIENT_BALANCE = """
SELECT balance
FROM Patients
WHERE patientid = %s AND balance >= %s
"""

# Create appointment
CREATE_APPOINTMENT = """
INSERT INTO Appointment (status, rating, review, patientid, doctorid, starttime, endtime)
VALUES ('Scheduled', NULL, NULL, %s, %s, %s, %s)
RETURNING appointmentid
"""

# Update slot availability
UPDATE_SLOT_STATUS = """
UPDATE Slots
SET availability = 'booked'
WHERE doctorid = %s AND starttime = %s AND endtime = %s
"""

# Deduct appointment fee
DEDUCT_BALANCE = """
UPDATE Patients
SET balance = balance - %s
WHERE patientid = %s
"""

# Get patient appointments
GET_PATIENT_APPOINTMENTS = """
SELECT a.appointmentid, a.patientid, a.doctorid, a.starttime, a.endtime, 
       a.status, a.rating, a.review, u.name as doctorname,
       d.specialization
FROM Appointment a
JOIN Doctors d ON a.doctorid = d.employeeid
JOIN "User" u ON d.employeeid = u.userid
WHERE a.patientid = %s
{status_clause}
ORDER BY a.starttime DESC
"""

# Get doctor appointments
GET_DOCTOR_APPOINTMENTS = """
SELECT a.appointmentid, a.patientid, a.doctorid, a.starttime, a.endtime, 
       a.status, a.rating, a.review, u.name as patientname
FROM Appointment a
JOIN Patients p ON a.patientid = p.patientid
JOIN "User" u ON p.patientid = u.userid
WHERE a.doctorid = %s
{status_clause}
{time_clause}
ORDER BY a.starttime {order}
"""

# Update appointment status
UPDATE_APPOINTMENT_STATUS = """
UPDATE Appointment
SET status = %s
WHERE appointmentid = %s
RETURNING appointmentid
"""

# Add review to appointment
ADD_APPOINTMENT_REVIEW = """
UPDATE Appointment
SET rating = %s, review = %s
WHERE appointmentid = %s
AND patientid = %s
AND status = 'Completed'
RETURNING appointmentid
"""