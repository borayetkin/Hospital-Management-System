# MediSync Hospital Management System

MediSync is a comprehensive hospital management system designed to streamline healthcare operations, improve patient care, and enhance resource management. The system provides a modern, user-friendly interface for both healthcare providers and patients.

## 🌟 Features

### For Patients
- **Appointment Management**
  - Book, reschedule, and cancel appointments
  - View appointment history
  - Receive appointment reminders
  - Rate and review doctors

- **Medical Records**
  - Access medical history
  - View test results
  - Download medical documents
  - Track prescriptions

- **Billing**
  - View and pay bills online
  - Access billing history
  - Download invoices
  - Track insurance claims

### For Healthcare Providers
- **Doctor Dashboard**
  - Manage appointments
  - View patient records
  - Track patient history
  - Manage prescriptions

- **Resource Management**
  - Track medical equipment
  - Manage inventory
  - Monitor resource utilization
  - Handle resource requests

- **Department Management**
  - Monitor department performance
  - Track patient flow
  - Manage staff schedules
  - Generate reports

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Docker (optional)

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/borayetkin/Hospital-Management-System
cd medisync/backend
```

2. Create and activate virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize database
```bash
python migrate.py
```

6. Run the server
```bash
uvicorn app.main:app --reload
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd ../medisycn-patient-portal-main
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

### Docker Setup
1. Build and run using Docker Compose
```bash
docker-compose up --build
```

## 📁 Project Structure

```
Hospital-Management-System/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── tests/
│   ├── requirements.txt
│   └── docker-compose.yml
├── medisycn-patient-portal-main/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── public/
│   └── package.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing
- Input validation
- SQL injection prevention
- XSS protection

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd medisycn-patient-portal-main
npm test
```

## 📚 API Documentation

Once the backend server is running, access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Authors

- Asya Ünal
- Aybars Buğra Aksoy
- Barış Yaycı
- Bora Yetkin
- Eren Berk Eraslan

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern healthcare management systems
- Built with best practices in mind

