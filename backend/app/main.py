# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .routers import auth, patients, doctors, admin, appointments, resources, processes, medications
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

# Create FastAPI app
app = FastAPI(
    title="MediSync API",
    description="Hospital Appointment Management System API",
    version="1.0.0",
)

# Configure CORS - simplified permissive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods 
    allow_headers=["*"],  # Allow all headers
)

# Include routers with versioned prefix
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(patients.router, prefix=api_prefix)
app.include_router(doctors.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(appointments.router, prefix=api_prefix)
app.include_router(resources.router, prefix=api_prefix)
app.include_router(resources.public_router, prefix=api_prefix)
app.include_router(processes.router, prefix=api_prefix)
app.include_router(medications.router, prefix=api_prefix)

@app.get("/")
async def root():
    return {
        "name": "MediSync API",
        "description": "Hospital Appointment Management System",
        "version": "1.0.0",
        "status": "running",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )