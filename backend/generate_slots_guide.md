# Appointment Slot Generator Guide

This guide will help you use the `generate_slots.py` script to populate the Hospital Management System database with appointment slots for doctors and generate mock doctor data for testing.

## Prerequisites

- Python 3.6+
- PostgreSQL database from the Hospital Management System
- `psycopg2` Python package

If you don't have the required package, install it with:

```bash
pip install psycopg2-binary
```

## Configuration

The script uses the following environment variables for database connection:

- `DB_HOST`: Database host (default: "localhost")
- `DB_PORT`: Database port (default: "5432")
- `DB_NAME`: Database name (default: "hospital_db")
- `DB_USER`: Database user (default: "postgres")
- `DB_PASS`: Database password (default: "postgres")

You can set these variables in your environment or modify the defaults in the script.

## Important Note About Column Names

PostgreSQL is case-sensitive with column names unless they are quoted. This script uses lowercase column names (e.g., `doctorid`, `starttime`, `endtime`) to match the database schema. If you encounter errors related to column names, ensure that your database columns are also using consistent lowercase naming.

## Usage

### Basic Usage

To generate slots for all doctors for the next 365 days:

```bash
python generate_slots.py
```

### Options

The script supports several command-line options:

- `--doctor <id>`: Generate slots for a specific doctor ID only
- `--days <number>`: Number of days to generate slots for (default: 365)
- `--clear`: Clear existing slots before generating new ones
- `--generate-mock-doctors <count>`: Generate this many mock doctors before creating slots
- `--start-id <id>`: Starting user ID for mock data (default: 1000)

### Examples

Generate slots for doctor with ID 101 for the next 30 days:

```bash
python generate_slots.py --doctor 101 --days 30
```

Clear all existing slots and generate new ones for all doctors:

```bash
python generate_slots.py --clear
```

Generate 10 mock doctors and create slots for all doctors:

```bash
python generate_slots.py --generate-mock-doctors 10
```

Generate 5 mock doctors starting from user ID 2000, then create slots for the next 30 days:

```bash
python generate_slots.py --generate-mock-doctors 5 --start-id 2000 --days 30
```

## How It Works

### Slot Generation

The script performs the following steps:

1. Connects to the database using the provided credentials
2. Retrieves all doctors or a specific doctor based on the parameters
3. For each doctor:
   - Determines working hours (varied by doctor)
   - Determines days off (varied by doctor)
   - Determines appointment duration (30 or 45 minutes)
   - Generates slots for each working day
   - Skips lunch hours (12-1pm)
   - Inserts slots into the database

### Mock Data Generation

When using the `--generate-mock-doctors` option, the script will:

1. Create user accounts with mock names and credentials
2. Convert these users to employees with random salaries
3. Ensure department records exist
4. Create doctor records with random specializations and department assignments
5. Then proceed to generate slots for all doctors (including the newly created ones)

The mock data includes:

- 12 different medical specializations
- 16 doctor names (reused if generating more than 16 doctors)
- 8 hospital locations
- 8 departments

## Integration with Frontend

After generating the slots, you can set the frontend to use real data instead of mock data:

1. Open `src/api/index.ts` in the frontend project
2. Set `USE_MOCK_DATA` to `false` at the top of the file
3. Make sure the `BASE_URL` points to your backend API endpoint

## Notes

- The script avoids creating duplicate slots by handling integrity errors
- Different doctors have different schedules for variety
- Some doctors work weekends but take other days off
- Some specialists have longer appointment durations
- The mock doctor generator uses ON CONFLICT DO NOTHING to avoid errors when running multiple times

## Troubleshooting

If you encounter any issues:

1. Check database connection parameters
2. Ensure the database schema matches the expected structure
3. Verify that the Doctor records exist in the database
4. Check permissions for inserting into the Slots table
5. For mock data generation issues, make sure all required tables exist in the database
6. If you see column name errors, ensure all SQL queries use lowercase column names to match PostgreSQL's behavior
