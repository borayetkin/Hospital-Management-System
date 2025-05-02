import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

# Database connection settings
DB_NAME = "hospital"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "localhost"
DB_PORT = "5433"

# Database connection function
@contextmanager
def get_db():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        cursor_factory=RealDictCursor
    )
    try:
        yield conn
    finally:
        conn.close() 