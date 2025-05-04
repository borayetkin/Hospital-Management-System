# app/routers/resources.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..utils.auth import get_current_user
from ..database import execute_query
from ..schemas.resource import ResourceBase, ResourceCreate, ResourceResponse, ResourceRequest
from ..models.resource_queries import *

router = APIRouter(prefix="/resources", tags=["Medical Resources"])

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

@router.post("/request")
async def request_resource(
    request: ResourceRequest,
    current_user = Depends(get_current_user)
):
    """Request a medical resource (for doctors)"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can request resources"
        )
    
    # Check if resource exists and is available
    resource = execute_query(GET_RESOURCE_BY_ID, (request.resourceID,))
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    if resource[0]["availability"] != "Available" and request.status == "Approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource is not available"
        )
    
    # Create resource request
    try:
        execute_query(
            CREATE_RESOURCE_REQUEST, 
            (current_user["userid"], request.resourceID, request.status),
            fetch=False
        )
        
        # If request is approved, update resource availability
        if request.status == "Approved":
            execute_query(
                UPDATE_RESOURCE_AVAILABILITY,
                ("In Use", request.resourceID),
                fetch=False
            )
        
        return {"message": "Resource request created successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create resource request: {str(e)}"
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