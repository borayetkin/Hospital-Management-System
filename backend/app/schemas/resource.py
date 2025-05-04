# app/schemas/resource.py
from pydantic import BaseModel
from typing import Optional
from datetime import date

class ResourceBase(BaseModel):
    name: str
    availability: str

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    resourceID: int

class ResourceRequest(BaseModel):
    doctorID: int
    resourceID: int
    status: str = "Pending"