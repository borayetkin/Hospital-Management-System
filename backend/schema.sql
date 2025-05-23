-- User Table
CREATE TABLE IF NOT EXISTS "User" (
    userID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    identityNumber VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Admin Table
CREATE TABLE IF NOT EXISTS Admin (
    AdminID INTEGER PRIMARY KEY,
    FOREIGN KEY (AdminID) REFERENCES "User"(userID)
);

-- Employee Table
CREATE TABLE IF NOT EXISTS Employee (
    employeeID INTEGER PRIMARY KEY,
    salary NUMERIC,
    FOREIGN KEY (employeeID) REFERENCES "User"(userID)
);

-- Dept Table
CREATE TABLE IF NOT EXISTS Dept (
    deptName VARCHAR(255) PRIMARY KEY,
    deptLocation VARCHAR(255) UNIQUE NOT NULL
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS Doctors (
    employeeID INTEGER PRIMARY KEY,
    specialization VARCHAR(255),
    doctorLocation VARCHAR(255),
    deptName VARCHAR(255),
    FOREIGN KEY (employeeID) REFERENCES Employee(employeeID),
    FOREIGN KEY (deptName) REFERENCES Dept(deptName)
);

-- Staff Table
CREATE TABLE IF NOT EXISTS Staff (
    employeeID INTEGER PRIMARY KEY,
    role VARCHAR(255),
    FOREIGN KEY (employeeID) REFERENCES Employee(employeeID)
);

-- HospitalAdministrators Table
CREATE TABLE IF NOT EXISTS HospitalAdministrators (
    employeeID INTEGER PRIMARY KEY,
    role VARCHAR(255),
    FOREIGN KEY (employeeID) REFERENCES Employee(employeeID)
);

-- Patients Table
CREATE TABLE IF NOT EXISTS Patients (
    patientID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    DOB DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phoneNumber VARCHAR(20) UNIQUE NOT NULL,
    Balance NUMERIC,
    FOREIGN KEY (patientID) REFERENCES "User"(userID)
);

-- MedicalResources Table
CREATE TABLE IF NOT EXISTS MedicalResources (
    resourceID SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    availability VARCHAR(50) NOT NULL
);

-- DoctorPatient Table
CREATE TABLE IF NOT EXISTS DoctorPatient (
    doctorID INTEGER,
    patientID INTEGER,
    PRIMARY KEY (doctorID, patientID),
    FOREIGN KEY (doctorID) REFERENCES Doctors(employeeID),
    FOREIGN KEY (patientID) REFERENCES Patients(patientID)
);

-- Slots Table
CREATE TABLE IF NOT EXISTS Slots (
    doctorID INTEGER,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    availability VARCHAR(50),
    PRIMARY KEY (doctorID, startTime, endTime),
    FOREIGN KEY (doctorID) REFERENCES Doctors(employeeID)
);

-- Appointment Table
CREATE TABLE IF NOT EXISTS Appointment (
    appointmentID SERIAL PRIMARY KEY,
    status VARCHAR(50),
    rating FLOAT,
    review TEXT,
    patientID INTEGER,
    doctorID INTEGER,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    FOREIGN KEY (patientID) REFERENCES Patients(patientID),
    FOREIGN KEY (doctorID, startTime, endTime) REFERENCES Slots(doctorID, startTime, endTime)
);

-- Process Table
CREATE TABLE IF NOT EXISTS Process (
    processID SERIAL PRIMARY KEY,
    processName VARCHAR(255),
    processDescription TEXT,
    status VARCHAR(50),
    appointmentID INTEGER,
    FOREIGN KEY (appointmentID) REFERENCES Appointment(appointmentID)
);

-- Billing Table
CREATE TABLE IF NOT EXISTS Billing (
    billingID SERIAL PRIMARY KEY,
    billingDate DATE,
    amount NUMERIC,
    paymentStatus VARCHAR(50),
    processID INTEGER,
    FOREIGN KEY (processID) REFERENCES Process(processID)
);

-- Medications Table
CREATE TABLE IF NOT EXISTS Medications (
    medicationName VARCHAR(255) PRIMARY KEY,
    description TEXT,
    information TEXT
);

-- Prescribes Table
CREATE TABLE IF NOT EXISTS Prescribes (
    medicationName VARCHAR(255),
    appointmentID INTEGER,
    PRIMARY KEY (medicationName, appointmentID),
    FOREIGN KEY (medicationName) REFERENCES Medications(medicationName),
    FOREIGN KEY (appointmentID) REFERENCES Appointment(appointmentID)
);

-- Report Table
CREATE TABLE IF NOT EXISTS Report (
    reportID SERIAL PRIMARY KEY,
    created_by INTEGER,
    time_stamp TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Admin(AdminID)
);

-- PatientStatistics Table
CREATE TABLE IF NOT EXISTS PatientStatistics (
    reportID INTEGER,
    statID INTEGER,
    patientID INTEGER,
    totalAppointments INTEGER,
    totalProcesses INTEGER,
    totalPaid NUMERIC,
    lastVisit DATE,
    reportDate DATE,
    PRIMARY KEY (reportID, statID),
    FOREIGN KEY (reportID) REFERENCES Report(reportID),
    FOREIGN KEY (patientID) REFERENCES Patients(patientID)
);

-- DoctorStatistics Table
CREATE TABLE IF NOT EXISTS DoctorStatistics (
    reportID INTEGER,
    statID INTEGER,
    doctorID INTEGER,
    prescriptionCount INTEGER,
    appointmentCount INTEGER,
    totalRevenue NUMERIC,
    reportDate DATE,
    ratings FLOAT,
    PRIMARY KEY (reportID, statID),
    FOREIGN KEY (reportID) REFERENCES Report(reportID),
    FOREIGN KEY (doctorID) REFERENCES Doctors(employeeID)
);

-- EquipmentStatistics Table
CREATE TABLE IF NOT EXISTS EquipmentStatistics (
    statID INTEGER,
    reportID INTEGER,
    resourceID INTEGER,
    usageCount INTEGER,
    lastUsedDate DATE,
    totalRequests INTEGER,
    PRIMARY KEY (statID, reportID),
    FOREIGN KEY (reportID) REFERENCES Report(reportID),
    FOREIGN KEY (resourceID) REFERENCES MedicalResources(resourceID)
);

-- Request Table
CREATE TABLE IF NOT EXISTS Request (
    doctorID INTEGER,
    resourceID INTEGER,
    status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (doctorID, resourceID),
    FOREIGN KEY (doctorID) REFERENCES Doctors(employeeID),
    FOREIGN KEY (resourceID) REFERENCES MedicalResources(resourceID)
); 


-- View for Doctor Listings with Ratings (for appointment booking)
CREATE OR REPLACE VIEW DoctorListingView AS
SELECT 
    d.employeeID,
    u.name as doctorName,
    u.email as doctorEmail,
    d.specialization,
    d.doctorLocation,
    d.deptName,
    dept.deptLocation,
    COUNT(DISTINCT a.appointmentID) as totalAppointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.appointmentID END) as completedAppointments,
    AVG(a.rating) as averageRating,
    COUNT(a.rating) as totalRatings,
    COUNT(DISTINCT a.patientID) as totalPatients,
    COALESCE(AVG(a.rating), 0) as rating  -- For backward compatibility with your query
FROM Doctors d
JOIN Employee e ON d.employeeID = e.employeeID
JOIN "User" u ON e.employeeID = u.userID
JOIN Dept dept ON d.deptName = dept.deptName
LEFT JOIN Appointment a ON d.employeeID = a.doctorID
GROUP BY d.employeeID, u.name, u.email, d.specialization, 
         d.doctorLocation, d.deptName, dept.deptLocation
ORDER BY rating DESC NULLS LAST;


-- View for Doctor Available Slots with Enhanced Information
CREATE OR REPLACE VIEW DoctorAvailableSlots AS
SELECT 
    s.doctorID,
    u.name as doctorName,
    d.specialization,
    d.doctorLocation,
    s.startTime,
    s.endTime,
    s.availability,
    DATE(s.startTime) as slotDate,
    EXTRACT(HOUR FROM s.startTime) as startHour,
    EXTRACT(MINUTE FROM s.startTime) as startMinute,
    (s.endTime - s.startTime) as slotDuration,
    CASE 
        WHEN s.startTime < CURRENT_TIMESTAMP THEN 'past'
        WHEN s.startTime <= CURRENT_TIMESTAMP + INTERVAL '1 hour' THEN 'upcoming'
        ELSE 'future'
    END as timeStatus
FROM Slots s
JOIN Doctors d ON s.doctorID = d.employeeID
JOIN Employee e ON d.employeeID = e.employeeID
JOIN "User" u ON e.employeeID = u.userID
WHERE s.availability = 'available'
ORDER BY s.startTime;

-- Alternative: View showing ALL users who could be doctors (even with incomplete records)
CREATE OR REPLACE VIEW AllDoctorUsersView AS
SELECT 
    u.userID as employeeID,
    u.name as doctorName,
    u.email as doctorEmail,
    COALESCE(d.specialization, 'Not Specified') as specialization,
    COALESCE(d.doctorLocation, 'Not Assigned') as doctorLocation,
    d.deptName,
    dept.deptLocation,
    e.salary,
    COUNT(DISTINCT a.appointmentID) as totalAppointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.appointmentID END) as completedAppointments,
    AVG(a.rating) as averageRating,
    COUNT(a.rating) as totalRatings,
    COUNT(DISTINCT a.patientID) as totalPatients,
    COALESCE(AVG(a.rating), 0) as rating,
    CASE 
        WHEN d.employeeID IS NOT NULL THEN 'Complete'
        WHEN e.employeeID IS NOT NULL THEN 'Employee Only'
        ELSE 'User Only'
    END as registrationStatus
FROM "User" u
LEFT JOIN Employee e ON u.userID = e.employeeID
LEFT JOIN Doctors d ON e.employeeID = d.employeeID
LEFT JOIN Dept dept ON d.deptName = dept.deptName
LEFT JOIN Appointment a ON d.employeeID = a.doctorID
WHERE u.userID IN (
    SELECT employeeID FROM Doctors
    UNION
    SELECT employeeID FROM Employee WHERE employeeID IN (SELECT employeeID FROM Doctors)
    UNION
    -- Add any other logic to identify potential doctors, e.g.:
    SELECT userID FROM "User" WHERE email LIKE '%doctor%' OR email LIKE '%dr.%'
)
GROUP BY u.userID, u.name, u.email, d.specialization, 
         d.doctorLocation, d.deptName, dept.deptLocation, e.salary, d.employeeID, e.employeeID
ORDER BY rating DESC NULLS LAST;

ALTER TABLE Appointment 
    ADD CONSTRAINT chk_appointment_status 
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show'));

ALTER TABLE Slots 
    ADD CONSTRAINT chk_slot_times 
    CHECK (endTime > startTime);

ALTER TABLE Billing 
    ADD CONSTRAINT chk_billing_amount 
    CHECK (amount >= 0);



-- 7. Trigger to Sync Patient Name with User Table
CREATE OR REPLACE FUNCTION sync_patient_user_name()
RETURNS TRIGGER AS $$
BEGIN
    -- When Patients table name is updated, update User table
    IF LOWER(TG_TABLE_NAME) = 'patients' THEN
        UPDATE "User" 
        SET name = NEW.name
        WHERE userID = NEW.patientID;
    -- When User table name is updated, update Patients table if they exist as a patient
    ELSIF TG_TABLE_NAME = 'User' THEN
        -- Only update if this user is actually a patient
        IF EXISTS (SELECT 1 FROM Patients WHERE patientID = NEW.userID) THEN
            UPDATE Patients 
            SET name = NEW.name
            WHERE patientID = NEW.userID;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on Patients table
CREATE TRIGGER trg_sync_patient_name
AFTER UPDATE OF name ON Patients
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION sync_patient_user_name();

-- Trigger on User table (for patients) - removed subquery from WHEN
CREATE TRIGGER trg_sync_user_name_for_patients
AFTER UPDATE OF name ON "User"
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION sync_patient_user_name();