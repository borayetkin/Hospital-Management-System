# app/models/resource_queries.py

# Get all medical resources
GET_ALL_RESOURCES = """
SELECT resourceID as "resourceID", name, availability
FROM MedicalResources
{where_clause}
ORDER BY name
"""

# Get resource by ID
GET_RESOURCE_BY_ID = """
SELECT resourceID as "resourceID", name, availability
FROM MedicalResources
WHERE resourceID = %s
"""

# Filter resources by name
FILTER_RESOURCES_BY_NAME = """
SELECT resourceID as "resourceID", name, availability
FROM MedicalResources
WHERE name ILIKE %s
ORDER BY name
"""

# Filter resources by department
FILTER_RESOURCES_BY_DEPARTMENT = """
SELECT mr.resourceID as "resourceID", mr.name, mr.availability, d.deptName
FROM MedicalResources mr
JOIN Request req ON mr.resourceID = req.resourceID
JOIN Doctors doc ON req.doctorID = doc.employeeID
JOIN Dept d ON doc.deptName = d.deptName
WHERE d.deptName = %s
ORDER BY mr.name
"""

# Show available resources
GET_AVAILABLE_RESOURCES = """
SELECT resourceID as "resourceID", name, availability
FROM MedicalResources
WHERE availability = 'Available'
ORDER BY name
"""

# Create resource request
CREATE_RESOURCE_REQUEST = """
INSERT INTO Request (doctorID, resourceID, status)
VALUES (%s, %s, %s)
ON CONFLICT (doctorID, resourceID) DO UPDATE 
SET status = EXCLUDED.status
"""

# Get doctor resource requests
GET_DOCTOR_RESOURCE_REQUESTS = """
SELECT r.doctorID as "doctorID", r.resourceID as "resourceID", r.status, mr.name as "resourceName"
FROM Request r
JOIN MedicalResources mr ON r.resourceID = mr.resourceID
WHERE r.doctorID = %s
ORDER BY r.status, mr.name
"""

# Get all resource requests
GET_ALL_RESOURCE_REQUESTS = """
SELECT r.doctorID as "doctorID", r.resourceID as "resourceID", r.status, mr.name as "resourceName", u.name as "doctorName"
FROM Request r
JOIN MedicalResources mr ON r.resourceID = mr.resourceID
JOIN Doctors d ON r.doctorID = d.employeeID
JOIN "User" u ON d.employeeID = u.userID
ORDER BY r.status, u.name, mr.name
"""

# Update resource availability
UPDATE_RESOURCE_AVAILABILITY = """
UPDATE MedicalResources
SET availability = %s
WHERE resourceID = %s
"""

# Create a new resource
CREATE_RESOURCE = """
INSERT INTO MedicalResources (name, availability)
VALUES (%s, 'Available')
RETURNING resourceID as "resourceID", name, availability
"""

# Get recent resource activities
GET_RECENT_RESOURCE_ACTIVITIES = """
SELECT 
    r.doctorID as "doctorID", 
    r.resourceID as "resourceID", 
    r.status, 
    mr.name as "resourceName", 
    u.name as "doctorName",
    COALESCE(r.timestamp, CURRENT_TIMESTAMP) as "timestamp"
FROM Request r
JOIN MedicalResources mr ON r.resourceID = mr.resourceID
JOIN Doctors d ON r.doctorID = d.employeeID
JOIN "User" u ON d.employeeID = u.userID
ORDER BY COALESCE(r.timestamp, CURRENT_TIMESTAMP) DESC
LIMIT %s
"""

# Get resource statistics
GET_RESOURCE_STATISTICS = """
SELECT 
    COUNT(*) as "totalRequests",
    COUNT(CASE WHEN status = 'Approved' AND (timestamp IS NULL OR DATE(timestamp) = CURRENT_DATE) THEN 1 END) as "approvedToday",
    COUNT(CASE WHEN status = 'Pending' THEN 1 END) as "pendingRequests",
    (SELECT COUNT(*) FROM MedicalResources) as "resourcesManaged"
FROM Request
"""