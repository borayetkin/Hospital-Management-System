from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routers import admin, doctor, patient, auth
from app.database import get_db

app = FastAPI(title="Hospital Management System API")

# Make get_db available as a dependency
app.dependency_overrides[get_db] = get_db

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(doctor.router, prefix="/doctor", tags=["Doctor"])
app.include_router(patient.router, prefix="/patient", tags=["Patient"])

@app.get("/")
async def root():
    return {"message": "Welcome to Hospital Management System API"} 