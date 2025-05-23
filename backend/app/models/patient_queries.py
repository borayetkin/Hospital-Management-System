# app/models/patient_queries.py

# Get patient profile
GET_PATIENT_PROFILE = """
SELECT p.patientID, p.name, p.email, p.phoneNumber, p.DOB, p.Balance
FROM Patients p
WHERE p.patientID = %s
"""

# Update patient profile
UPDATE_USER_NAME = """
UPDATE "User"
SET name = %s
WHERE userID = %s
RETURNING userID, name
"""

UPDATE_PATIENT_PROFILE = """
UPDATE Patients
SET name = %s, email = %s, phoneNumber = %s
WHERE patientID = %s
RETURNING patientID, name, email, phoneNumber, DOB, Balance
"""

# Add to patient balance
ADD_TO_BALANCE = """
UPDATE Patients
SET Balance = Balance + %s
WHERE patientID = %s
RETURNING patientID, name, email, phoneNumber, DOB, Balance
"""