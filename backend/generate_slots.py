#!/usr/bin/env python3
"""
Script to generate appointment slots for doctors in the Hospital Management System.
This script will create a year's worth of appointment slots for all doctors in the system,
and can also generate mock doctor data for testing purposes.
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, time, date
import random
import argparse

# Database connection parameters (from app/config.py)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "hospital_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")

# Mock data for doctors
MOCK_SPECIALIZATIONS = [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", 
    "Neurology", "Obstetrics", "Oncology", "Ophthalmology", 
    "Orthopedics", "Pediatrics", "Psychiatry", "Urology"
]

MOCK_DOCTOR_NAMES = [
    "Dr. Emma Smith", "Dr. James Wilson", "Dr. Olivia Johnson", "Dr. William Brown",
    "Dr. Sophia Lee", "Dr. Benjamin Taylor", "Dr. Ava Martinez", "Dr. Michael Chen",
    "Dr. Isabella Garcia", "Dr. Alexander Wright", "Dr. Mia Rodriguez", "Dr. Ethan Lewis",
    "Dr. Charlotte King", "Dr. Daniel Davis", "Dr. Amelia Thompson", "Dr. Matthew Clark"
]

MOCK_LOCATIONS = [
    "Main Hospital - Floor 1", "Main Hospital - Floor 2", "North Wing", "South Wing",
    "East Wing", "West Wing", "Outpatient Center", "Medical Tower"
]

MOCK_DEPARTMENTS = [
    "Internal Medicine", "Surgery", "Pediatrics", "Family Medicine",
    "Emergency Medicine", "Radiology", "Psychiatry", "Pathology"
]

def get_connection():
    """Get a connection to the database"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def generate_mock_users(conn, count=10, start_id=1000):
    """Generate mock users in the system"""
    print(f"Generating {count} mock users...")
    users_created = 0
    
    for i in range(count):
        user_id = start_id + i
        name = MOCK_DOCTOR_NAMES[i % len(MOCK_DOCTOR_NAMES)]
        email = name.lower().replace(' ', '.').replace('.', '_') + "@hospital.com"
        identity = f"ID{100000 + user_id}"
        password = "password123"  # In a real system, this would be hashed
        
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO "User" (userid, name, email, identitynumber, password)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (userid) DO NOTHING
                """, (user_id, name, email, identity, password))
                if cursor.rowcount > 0:
                    users_created += 1
                conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error creating user {name}: {e}")
    
    print(f"Created {users_created} new mock users")
    return [start_id + i for i in range(count)]

def generate_mock_employees(conn, user_ids):
    """Generate mock employees from users"""
    print(f"Converting {len(user_ids)} users to employees...")
    employees_created = 0
    
    for user_id in user_ids:
        salary = random.randint(50000, 150000)
        
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO Employee (employeeid, salary)
                    VALUES (%s, %s)
                    ON CONFLICT (employeeid) DO NOTHING
                """, (user_id, salary))
                if cursor.rowcount > 0:
                    employees_created += 1
                conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error creating employee for user {user_id}: {e}")
    
    print(f"Created {employees_created} new mock employees")

def ensure_departments_exist(conn):
    """Ensure all departments exist in the database"""
    departments_created = 0
    
    for dept in MOCK_DEPARTMENTS:
        location = MOCK_LOCATIONS[MOCK_DEPARTMENTS.index(dept) % len(MOCK_LOCATIONS)]
        
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO Dept (deptname, deptlocation)
                    VALUES (%s, %s)
                    ON CONFLICT (deptname) DO NOTHING
                """, (dept, location))
                if cursor.rowcount > 0:
                    departments_created += 1
                conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error creating department {dept}: {e}")
    
    if departments_created > 0:
        print(f"Created {departments_created} new departments")

def generate_mock_doctors(conn, employee_ids):
    """Generate mock doctors from employees"""
    print(f"Converting {len(employee_ids)} employees to doctors...")
    doctors_created = 0
    
    # Make sure departments exist
    ensure_departments_exist(conn)
    
    for employee_id in employee_ids:
        specialization = random.choice(MOCK_SPECIALIZATIONS)
        location = random.choice(MOCK_LOCATIONS)
        department = random.choice(MOCK_DEPARTMENTS)
        
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO Doctors (employeeid, specialization, doctorlocation, deptname)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (employeeid) DO NOTHING
                """, (employee_id, specialization, location, department))
                if cursor.rowcount > 0:
                    doctors_created += 1
                conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error creating doctor for employee {employee_id}: {e}")
    
    print(f"Created {doctors_created} new mock doctors")

def get_all_doctors(conn):
    """Get all doctors from the database"""
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT d.employeeid, u.name, d.specialization
            FROM Doctors d
            JOIN "User" u ON d.employeeid = u.userid
        """)
        return cursor.fetchall()

def clear_existing_slots(conn, doctor_id=None):
    """Clear existing slots for a doctor or all doctors"""
    with conn.cursor() as cursor:
        if doctor_id:
            cursor.execute("DELETE FROM Slots WHERE doctorid = %s", (doctor_id,))
        else:
            cursor.execute("DELETE FROM Slots")
        conn.commit()
        affected = cursor.rowcount
        print(f"Cleared {affected} existing slots")

def generate_slots(conn, doctor_id=None, days=365, clear_slots=False):
    """Generate appointment slots for a year for all doctors or a specific doctor"""
    if clear_slots:
        clear_existing_slots(conn, doctor_id)
    
    # Get doctors to generate slots for
    if doctor_id:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT d.employeeid, u.name, d.specialization
                FROM Doctors d
                JOIN "User" u ON d.employeeid = u.userid
                WHERE d.employeeid = %s
            """, (doctor_id,))
            doctors = cursor.fetchall()
            if not doctors:
                print(f"Doctor with ID {doctor_id} not found")
                return
    else:
        doctors = get_all_doctors(conn)
        
    if not doctors:
        print("No doctors found in the system")
        return
    
    # Start date is tomorrow
    start_date = datetime.now().date() + timedelta(days=1)
    
    slots_created = 0
    
    # Loop through each doctor
    for doctor in doctors:
        doctor_id = doctor['employeeid']
        doctor_name = doctor['name']
        print(f"Generating slots for doctor {doctor_name} (ID: {doctor_id})")
        
        # Doctor-specific parameters (for variety)
        # Working hours (9am to 5pm by default)
        working_start = time(9, 0)  # 9:00 AM
        working_end = time(17, 0)   # 5:00 PM
        
        # Adjust for some doctors
        if doctor_id % 3 == 0:  # Every third doctor starts earlier
            working_start = time(8, 0)  # 8:00 AM
        elif doctor_id % 3 == 1:  # Another third starts later
            working_start = time(10, 0)  # 10:00 AM
            working_end = time(18, 0)    # 6:00 PM
        
        # Days off - weekends by default, but some doctors work different days
        days_off = {5, 6}  # Saturday (5) and Sunday (6)
        
        # Some doctors work weekends but take other days off
        if doctor_id % 5 == 0:
            days_off = {0, 3}  # Monday (0) and Thursday (3)
        elif doctor_id % 5 == 1:
            days_off = {1, 4}  # Tuesday (1) and Friday (4)
        elif doctor_id % 5 == 2:
            days_off = {0, 6}  # Monday (0) and Sunday (6)
        
        # Appointment duration (30 min by default, some specialists get 45 min)
        duration_minutes = 30
        if "Psychiatry" in doctor.get('specialization', '') or "Neurology" in doctor.get('specialization', ''):
            duration_minutes = 45
        
        # Generate slots for each day
        for day_offset in range(days):
            current_date = start_date + timedelta(days=day_offset)
            weekday = current_date.weekday()
            
            # Skip if it's a day off for this doctor
            if weekday in days_off:
                continue
            
            # Start time is working_start
            current_time = datetime.combine(current_date, working_start)
            
            # End time is working_end
            end_time = datetime.combine(current_date, working_end)
            
            # Generate slots for the day
            while current_time + timedelta(minutes=duration_minutes) <= end_time:
                slot_end = current_time + timedelta(minutes=duration_minutes)
                
                # Skip lunch hour (12-1pm)
                if not (current_time.hour == 12 and current_time.minute < 60):
                    try:
                        with conn.cursor() as cursor:
                            cursor.execute("""
                                INSERT INTO Slots (doctorid, starttime, endtime, availability)
                                VALUES (%s, %s, %s, %s)
                            """, (
                                doctor_id,
                                current_time,
                                slot_end,
                                'available'
                            ))
                            slots_created += 1
                    except psycopg2.IntegrityError as e:
                        # Slot might already exist
                        conn.rollback()
                        print(f"Warning: Slot already exists or other integrity error: {e}")
                    else:
                        conn.commit()
                
                # Move to next slot
                current_time = slot_end
    
    print(f"Created {slots_created} slots for {len(doctors)} doctors")

def main():
    parser = argparse.ArgumentParser(description='Generate appointment slots for doctors')
    parser.add_argument('--doctor', type=int, help='Generate slots for a specific doctor ID only')
    parser.add_argument('--days', type=int, default=365, help='Number of days to generate slots for')
    parser.add_argument('--clear', action='store_true', help='Clear existing slots before generating new ones')
    parser.add_argument('--generate-mock-doctors', type=int, default=0, 
                        help='Generate this many mock doctors before creating slots')
    parser.add_argument('--start-id', type=int, default=1000,
                        help='Starting user ID for mock data (default: 1000)')
    
    args = parser.parse_args()
    
    conn = get_connection()
    try:
        # Generate mock data if requested
        if args.generate_mock_doctors > 0:
            mock_user_ids = generate_mock_users(conn, args.generate_mock_doctors, args.start_id)
            generate_mock_employees(conn, mock_user_ids)
            generate_mock_doctors(conn, mock_user_ids)
        
        # Generate slots
        generate_slots(conn, args.doctor, args.days, args.clear)
    finally:
        conn.close()

if __name__ == "__main__":
    main() 