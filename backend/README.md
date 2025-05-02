# Database Setup

1. Start the database:

```bash
docker-compose up -d
```

2. Database connection:

- Host: localhost
- Port: 5433
- Database: hospital
- Username: postgres
- Password: postgres

3. Run migrations:

```bash
# Create virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head
```
3. **Reset Database**

```bash
# Stop and remove containers
docker-compose down

# Remove volume to start fresh
docker-compose down -v

# Start again
docker-compose up -d
```

##run backend 
uvicorn app.main:app --reload