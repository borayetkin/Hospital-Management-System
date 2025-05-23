# app/routers/resources.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..utils.auth import get_current_user
from ..database import execute_query
from ..schemas.resource import ResourceBase, ResourceCreate, ResourceResponse, ResourceRequest, ResourceRequestResponse, RecentActivity, ResourceStats
from ..models.resource_queries import *
import logging

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resources", tags=["Medical Resources"])

# Create a public router for statistics and activities
public_router = APIRouter(prefix="/public/resources", tags=["Public Resources"])

@router.get("/", response_model=List[ResourceResponse])
async def get_all_resources(
    name: Optional[str] = None,
    department: Optional[str] = None,
    available_only: Optional[bool] = False,
    current_user = Depends(get_current_user)
):
    """Get all medical resources with optional filters"""
    # Build where clause based on filters
    where_conditions = []
    params = []
    
    if name:
        where_conditions.append("name ILIKE %s")
        params.append(f"%{name}%")
    
    if available_only:
        where_conditions.append("availability = 'Available'")
    
    where_clause = ""
    if where_conditions:
        where_clause = "WHERE " + " AND ".join(where_conditions)
    
    # Format the query with the where clause
    formatted_query = GET_ALL_RESOURCES.format(where_clause=where_clause)
    
    # Handle department filter separately as it requires joins
    if department:
        resources = execute_query(FILTER_RESOURCES_BY_DEPARTMENT, (department,))
    else:
        resources = execute_query(formatted_query, params)
    
    return resources

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource_by_id(
    resource_id: int,
    current_user = Depends(get_current_user)
):
    """Get medical resource by ID"""
    result = execute_query(GET_RESOURCE_BY_ID, (resource_id,))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    return result[0]

@router.post("/doctor/request", status_code=status.HTTP_201_CREATED)
async def request_resource(
    request: ResourceRequest,
    current_user = Depends(get_current_user)
):
    """Request a medical resource (for doctors)"""
    if current_user["role"].lower() != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can request resources"
        )
    
    # Use the userID from current_user as the doctorID - no need for the doctorID in the request
    doctor_id = current_user["userid"]
    
    # Check if resource exists
    resource = execute_query(GET_RESOURCE_BY_ID, (request.resourceID,))
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    # Create resource request with status "Pending" by default
    try:
        execute_query(
            CREATE_RESOURCE_REQUEST, 
            (doctor_id, request.resourceID, request.status),
            fetch=False
        )
        
        return {"message": "Resource request created successfully", "status": request.status}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create resource request: {str(e)}"
        )

@router.get("/doctor/requests", response_model=List[ResourceRequestResponse])
async def get_my_resource_requests(current_user = Depends(get_current_user)):
    """Get all resource requests for the logged in doctor"""
    if current_user["role"].lower() != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can view their resource requests"
        )
    
    requests = execute_query(GET_DOCTOR_RESOURCE_REQUESTS, (current_user["userid"],))
    
    return requests

@router.get("/staff/requests", response_model=List[ResourceRequestResponse])
async def get_all_resource_requests(current_user = Depends(get_current_user)):
    """Get all resource requests (for staff/admin)"""
    if current_user["role"].lower() not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or staff can view all resource requests"
        )
    
    requests = execute_query(GET_ALL_RESOURCE_REQUESTS)
    
    return requests

@router.put("/staff/requests/{doctor_id}/{resource_id}")
async def update_request_status(
    doctor_id: int,
    resource_id: int,
    status: str,
    current_user = Depends(get_current_user)
):
    """Update resource request status (for staff/admin)"""
    if current_user["role"].lower() not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or staff can update request status"
        )
    
    # Validate status
    valid_statuses = ["Pending", "Approved", "Rejected"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of {valid_statuses}"
        )
    
    # Update request status
    try:
        execute_query(
            CREATE_RESOURCE_REQUEST,
            (doctor_id, resource_id, status),
            fetch=False
        )
        
        # If approved, update resource availability
        if status == "Approved":
            execute_query(
                UPDATE_RESOURCE_AVAILABILITY,
                ("In Use", resource_id),
                fetch=False
            )
        
        return {"message": f"Request status updated to {status}"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update request status: {str(e)}"
        )

@router.post("/", response_model=ResourceResponse)
async def create_resource(
    resource: ResourceCreate,
    current_user = Depends(get_current_user)
):
    """Create a new medical resource (for admin/staff)"""
    if current_user["role"] not in ["Admin", "Staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or staff can create resources"
        )
    
    result = execute_query(CREATE_RESOURCE, (resource.name,))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create resource"
        )
    
    return result[0]

@router.put("/{resource_id}/availability")
async def update_resource_availability(
    resource_id: int,
    availability: str,
    current_user = Depends(get_current_user)
):
    """Update resource availability (for admin/staff)"""
    if current_user["role"] not in ["Admin", "Staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or staff can update resource availability"
        )
    
    # Validate availability status
    valid_statuses = ["Available", "In Use", "Maintenance"]
    if availability not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Availability must be one of {valid_statuses}"
        )
    
    # Update availability
    execute_query(
        UPDATE_RESOURCE_AVAILABILITY,
        (availability, resource_id),
        fetch=False
    )
    
    return {"message": "Resource availability updated successfully"}

@router.get("/activities/recent", response_model=List[RecentActivity])
async def get_recent_activities(
    limit: int = 10
):
    """Get recent resource request activities"""
    
    activities = execute_query(GET_RECENT_RESOURCE_ACTIVITIES, (limit,))
    
    return activities

@router.get("/statistics")
async def get_resource_statistics():
    """Get resource request statistics"""
    
    try:
        stats = execute_query(GET_RESOURCE_STATISTICS)
        
        if not stats or len(stats) == 0:
            # Return default values if no statistics are found
            return {
                "totalRequests": 0,
                "approvedToday": 0,
                "pendingRequests": 0,
                "resourcesManaged": 0
            }
        
        # Convert to simple dict with explicit type conversion for safety
        return {
            "totalRequests": int(stats[0]["totalRequests"]) if stats[0]["totalRequests"] is not None else 0,
            "approvedToday": int(stats[0]["approvedToday"]) if stats[0]["approvedToday"] is not None else 0,
            "pendingRequests": int(stats[0]["pendingRequests"]) if stats[0]["pendingRequests"] is not None else 0,
            "resourcesManaged": int(stats[0]["resourcesManaged"]) if stats[0]["resourcesManaged"] is not None else 0
        }
    except Exception as e:
        logger.error(f"Error fetching resource statistics: {e}")
        # Return default values in case of an error
        return {
            "totalRequests": 0,
            "approvedToday": 0,
            "pendingRequests": 0,
            "resourcesManaged": 0
        }

@public_router.get("/activities/recent")
async def get_public_recent_activities(limit: int = 10):
    """Get recent resource request activities (public endpoint)"""
    try:
        activities = execute_query(GET_RECENT_RESOURCE_ACTIVITIES, (limit,))
        return activities
    except Exception as e:
        logger.error(f"Error fetching recent activities: {e}")
        return []

@public_router.get("/statistics")
async def get_public_resource_statistics():
    """Get resource request statistics (public endpoint)"""
    try:
        stats = execute_query(GET_RESOURCE_STATISTICS)
        
        if not stats or len(stats) == 0:
            # Return default values if no statistics are found
            return {
                "totalRequests": 0,
                "approvedToday": 0,
                "pendingRequests": 0,
                "resourcesManaged": 0
            }
        
        # Convert to simple dict with explicit type conversion for safety
        return {
            "totalRequests": int(stats[0]["totalRequests"]) if stats[0]["totalRequests"] is not None else 0,
            "approvedToday": int(stats[0]["approvedToday"]) if stats[0]["approvedToday"] is not None else 0,
            "pendingRequests": int(stats[0]["pendingRequests"]) if stats[0]["pendingRequests"] is not None else 0,
            "resourcesManaged": int(stats[0]["resourcesManaged"]) if stats[0]["resourcesManaged"] is not None else 0
        }
    except Exception as e:
        logger.error(f"Error fetching resource statistics: {e}")
        # Return default values in case of an error
        return {
            "totalRequests": 0,
            "approvedToday": 0,
            "pendingRequests": 0,
            "resourcesManaged": 0
        }