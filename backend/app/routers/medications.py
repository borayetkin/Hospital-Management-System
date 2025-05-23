from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging
from ..utils.auth import get_current_user
from ..database import execute_query, execute_transaction
from ..schemas.medication import MedicationCreate, MedicationResponse, PrescriptionCreate, PrescriptionResponse

router = APIRouter(prefix="/medications", tags=["Medications"])

# Configure logging
logger = logging.getLogger(__name__)

# SQL queries
CREATE_MEDICATION = """
    INSERT INTO Medications (medicationName, description, information)
    VALUES (%s, %s, %s)
    RETURNING medicationName as "medicationName", description, information
"""

CREATE_PRESCRIPTION = """
    INSERT INTO Prescribes (medicationName, appointmentID)
    VALUES (%s, %s)
"""

GET_ALL_MEDICATIONS = """
    SELECT medicationName as "medicationName", description, information
    FROM Medications
"""

GET_APPOINTMENT_MEDICATIONS = """
    SELECT m.medicationName as "medicationName", m.description, m.information
    FROM Medications m
    JOIN Prescribes p ON m.medicationName = p.medicationName
    WHERE p.appointmentID = %s
"""

DELETE_PRESCRIPTION = """
    DELETE FROM Prescribes cascade
    WHERE medicationName = %s AND appointmentID = %s
"""

@router.get("", response_model=List[MedicationResponse])
async def get_all_medications(
    current_user = Depends(get_current_user)
):
    """Get all available medications"""
    if current_user["role"] not in ["Doctor", "Patient"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    medications = execute_query(GET_ALL_MEDICATIONS)
    return medications

@router.post("/create-and-prescribe", response_model=MedicationResponse)
async def create_and_prescribe_medication(
    medication: MedicationCreate,
    appointmentID: int,
    current_user = Depends(get_current_user)
):
    """Create a new medication and prescribe it to an appointment"""
    logger.info(f"Creating and prescribing medication: {medication.medicationName} for appointment {appointmentID}")
    
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create and prescribe medications"
        )
    
    try:
        # First check if medication already exists
        existing_medication = execute_query(
            "SELECT medicationName FROM Medications WHERE medicationName = %s",
            (medication.medicationName,)
        )
        
        if not existing_medication:
            # Create medication if it doesn't exist
            logger.info(f"Creating new medication: {medication.medicationName}")
            medication_result = execute_query(
                CREATE_MEDICATION,
                (medication.medicationName, medication.description, medication.information)
            )
            
            if not medication_result:
                logger.error(f"Failed to create medication: {medication.medicationName}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create medication"
                )
        else:
            logger.info(f"Medication {medication.medicationName} already exists")
            medication_result = [{
                "medicationName": medication.medicationName,
                "description": medication.description,
                "information": medication.information
            }]
        
        # Check if prescription already exists
        existing_prescription = execute_query(
            "SELECT * FROM Prescribes WHERE medicationName = %s AND appointmentID = %s",
            (medication.medicationName, appointmentID)
        )
        
        if existing_prescription:
            logger.warning(f"Prescription already exists for medication {medication.medicationName} and appointment {appointmentID}")
            return medication_result[0]
        
        # Create prescription
        logger.info(f"Creating prescription for medication {medication.medicationName} and appointment {appointmentID}")
        execute_query(
            CREATE_PRESCRIPTION,
            (medication.medicationName, appointmentID),
            fetch=False
        )
        
        return medication_result[0]
        
    except Exception as e:
        logger.error(f"Error creating and prescribing medication: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create and prescribe medication: {str(e)}"
        )

@router.get("/appointment/{appointment_id}", response_model=List[MedicationResponse])
async def get_appointment_medications(
    appointment_id: int,
    current_user = Depends(get_current_user)
):
    """Get all medications prescribed for an appointment"""
    logger.info(f"Fetching medications for appointment {appointment_id}")
    
    if current_user["role"] not in ["Doctor", "Patient"]:
        logger.warning(f"Access denied for user {current_user['userid']} with role {current_user['role']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    try:
        # First verify the appointment exists
        appointment_check = execute_query(
            "SELECT appointmentid FROM Appointment WHERE appointmentid = %s",
            (appointment_id,)
        )
        
        if not appointment_check:
            logger.warning(f"Appointment {appointment_id} not found")
            return []
        
        # Get medications
        logger.info(f"Executing query to get medications for appointment {appointment_id}")
        medications = execute_query(GET_APPOINTMENT_MEDICATIONS, (appointment_id,))
        logger.info(f"Raw medications data: {medications}")
        
        if not medications:
            logger.info(f"No medications found for appointment {appointment_id}")
            return []
            
        # Transform the data to match the expected format
        transformed_medications = []
        for med in medications:
            transformed_med = {
                "medicationName": med.get("medicationName") or med.get("medicationname"),
                "description": med.get("description"),
                "information": med.get("information")
            }
            transformed_medications.append(transformed_med)
            
        logger.info(f"Transformed medications: {transformed_medications}")
        return transformed_medications
        
    except Exception as e:
        logger.error(f"Error fetching medications for appointment {appointment_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch medications: {str(e)}"
        )

@router.delete("/{medication_name}/appointment/{appointment_id}")
async def remove_prescription(
    medication_name: str,
    appointment_id: int,
    current_user = Depends(get_current_user)
):
    """Remove a medication prescription from an appointment"""
    if current_user["role"] != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can remove prescriptions"
        )
    
    result = execute_query(
        DELETE_PRESCRIPTION,
        (medication_name, appointment_id),
        fetch=False
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    return {"message": "Prescription removed successfully"} 