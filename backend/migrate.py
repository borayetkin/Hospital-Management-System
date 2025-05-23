#!/usr/bin/env python3

import psycopg2
import logging
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("migration")

def run_migration():
    """Run database migrations"""
    conn = None
    
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        
        # Create a cursor
        cursor = conn.cursor()
        
        # List all tables
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
        tables = cursor.fetchall()
        logger.info(f"Tables in database: {[table[0] for table in tables]}")
        
        # Check if Request table exists
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'request');")
        if cursor.fetchone()[0]:
            logger.info("Request table found.")
            
            # Check if timestamp column already exists
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'request' AND column_name = 'timestamp';
            """)
            
            if cursor.fetchone() is None:
                logger.info("Adding timestamp column to Request table...")
                
                # Add timestamp column
                cursor.execute("""
                    ALTER TABLE Request 
                    ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                """)
                
                logger.info("Timestamp column added successfully!")
            else:
                logger.info("Timestamp column already exists in Request table.")
            
            # Check full Request table structure
            cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'request';")
            columns = cursor.fetchall()
            logger.info(f"Request table columns: {columns}")
            
        else:
            logger.error("Request table does not exist!")
        
        # Commit changes
        conn.commit()
        
        # Test the GET_RESOURCE_STATISTICS query
        cursor.execute("""
            SELECT 
                COUNT(*) as "totalRequests",
                COUNT(CASE WHEN status = 'Approved' AND (timestamp IS NULL OR DATE(timestamp) = CURRENT_DATE) THEN 1 END) as "approvedToday",
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) as "pendingRequests",
                (SELECT COUNT(*) FROM MedicalResources) as "resourcesManaged"
            FROM Request
        """)
        
        stats = cursor.fetchone()
        logger.info(f"Resource statistics query result: {stats}")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
    
    logger.info("Migration completed")

if __name__ == "__main__":
    run_migration() 