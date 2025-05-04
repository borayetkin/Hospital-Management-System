# app/database.py
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import logging
from .config import settings

logger = logging.getLogger(__name__)

@contextmanager
def get_db_connection():
    """Get database connection with dictionary cursor"""
    conn = None
    try:
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        conn.autocommit = False
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield conn, cursor
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def execute_query(query, params=None, fetch=True):
    """Execute a query and return results as dictionaries"""
    with get_db_connection() as (conn, cursor):
        try:
            cursor.execute(query, params or ())
            if fetch:
                try:
                    result = cursor.fetchall()
                    conn.commit()
                    return result
                except psycopg2.ProgrammingError:
                    # No results to fetch (for INSERT, UPDATE, DELETE)
                    conn.commit()
                    return None
            else:
                # For operations that don't return results
                conn.commit()
                return None
        except Exception as e:
            conn.rollback()
            logger.error(f"Query execution error: {str(e)}, Query: {query}, Params: {params}")
            raise e

def execute_transaction(queries_and_params):
    """Execute multiple queries in a transaction"""
    with get_db_connection() as (conn, cursor):
        try:
            for query, params in queries_and_params:
                cursor.execute(query, params or ())
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            logger.error(f"Transaction error: {str(e)}")
            raise e