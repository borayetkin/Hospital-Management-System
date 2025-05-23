# app/schemas/resource.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class ResourceBase(BaseModel):
    name: str
    availability: str

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    resourceID: int

class ResourceRequest(BaseModel):
    resourceID: int
    status: str = "Pending"
    doctorID: Optional[int] = None  # Make doctorID optional as we'll get it from the token
    
class ResourceRequestResponse(BaseModel):
    doctorID: int
    resourceID: int
    status: str
    resourceName: str
    doctorName: Optional[str] = None
    timestamp: Optional[datetime] = None

# Add new schemas for recent activity and statistics

class RecentActivity(BaseModel):
    doctorID: int
    resourceID: int
    status: str
    resourceName: str
    doctorName: str
    timestamp: datetime

class ResourceStats(BaseModel):
    totalRequests: int
    approvedToday: int
    pendingRequests: int
    resourcesManaged: int