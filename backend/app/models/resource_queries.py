# app/models/resource_queries.py

# Get all medical resources
GET_ALL_RESOURCES = """
SELECT resourceID, name, availability
FROM MedicalResources
{where_clause}
ORDER BY name
"""

# Get resource by ID
GET_RESOURCE_BY_ID = """
SELECT resourceID, name, availability
FROM MedicalResources
WHERE resourceID = %s
"""

# Filter resources by name
FILTER_RESOURCES_BY_NAME = """
SELECT resourceID, name, availability
FROM MedicalResources
WHERE name ILIKE %s
ORDER BY name
"""

# Filter resources by department
FILTER_RESOURCES_BY_DEPARTMENT = """
SELECT mr.resourceID, mr.name, mr.availability, d.deptName
FROM MedicalResources mr
JOIN Request req ON mr.resourceID = req.resourceID
JOIN Doctors doc ON req.doctorID = doc.employeeID
JOIN Dept d ON doc.deptName = d.deptName
WHERE d.deptName = %s
ORDER BY mr.name
"""

# Show available resources
GET_AVAILABLE_RESOURCES = """
SELECT resourceID, name, availability
FROM MedicalResources
WHERE availability = 'Available'
ORDER BY name
"""

# Create resource request
CREATE_RESOURCE_REQUEST = """
INSERT INTO Request (doctorID, resourceID, status)
VALUES (%s, %s, %s)
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
RETURNING resourceID, name, availability
"""