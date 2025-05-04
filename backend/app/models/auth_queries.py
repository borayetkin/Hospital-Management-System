# app/models/auth_queries.py

# Find user by email
GET_USER_BY_EMAIL = """
SELECT u.userID, u.name, u.email, u.password,
       CASE 
           WHEN a.AdminID IS NOT NULL THEN 'Admin' 
           WHEN d.employeeID IS NOT NULL THEN 'Doctor' 
           WHEN s.employeeID IS NOT NULL THEN 'Staff' 
           WHEN p.patientID IS NOT NULL THEN 'Patient' 
       END AS role 
FROM "User" u 
LEFT JOIN Admin a ON u.userID = a.AdminID 
LEFT JOIN Doctors d ON u.userID = d.employeeID 
LEFT JOIN Staff s ON u.userID = s.employeeID 
LEFT JOIN Patients p ON u.userID = p.patientID 
WHERE u.email = %s
"""

# Create new user
CREATE_USER = """
INSERT INTO "User" (name, email, identityNumber, password)
VALUES (%s, %s, %s, %s)
RETURNING userID
"""

# Create patient
CREATE_PATIENT = """
INSERT INTO Patients (patientID, name, DOB, email, phoneNumber, Balance)
VALUES (%s, %s, %s, %s, %s, 0)
"""

# Create employee
CREATE_EMPLOYEE = """
INSERT INTO Employee (employeeID, salary)
VALUES (%s, NULL)
"""

# Create doctor
CREATE_DOCTOR = """
INSERT INTO Doctors (employeeID, specialization, doctorLocation, deptName)
VALUES (%s, %s, NULL, NULL)
"""

# Create staff
CREATE_STAFF = """
INSERT INTO Staff (employeeID, role)
VALUES (%s, %s)
"""

# Create admin
CREATE_ADMIN = """
INSERT INTO Admin (AdminID)
VALUES (%s)
"""