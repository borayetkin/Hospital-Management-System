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