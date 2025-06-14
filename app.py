from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, date
from typing import Optional, List
import re

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./meditrack.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="MediTrack Lite API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "patient" or "doctor"
    created_at = Column(DateTime, default=datetime.utcnow)

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    patient_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)
    health_concern = Column(Text, nullable=True)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    
    @validator('email')
    def validate_email(cls, v):
        if not v.endswith('@meditrack.local'):
            raise ValueError('Email must be from @meditrack.local domain')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['patient', 'doctor']:
            raise ValueError('Role must be either "patient" or "doctor"')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class AppointmentCreate(BaseModel):
    doctor_name: str
    appointment_date: str
    appointment_time: str
    health_concern: Optional[str] = None
    
    @validator('appointment_time')
    def validate_time(cls, v):
        allowed_times = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
            "15:00", "15:30", "16:00", "16:30", "17:00"
        ]
        if v not in allowed_times:
            raise ValueError('Invalid appointment time')
        return v

class AppointmentResponse(BaseModel):
    id: int
    patient_name: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    health_concern: Optional[str]
    status: str
    created_at: datetime

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# API Routes
@app.post("/register", response_model=dict)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        db_user = User(
            name=user.name,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"message": "User registered successfully", "user_id": db_user.id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login", response_model=Token)
def login_user(user_login: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_login.email).first()
    if not user or not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

@app.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):
    doctors = db.query(User).filter(User.role == "doctor").all()
    return [{"name": doctor.name, "email": doctor.email} for doctor in doctors]

@app.post("/appointments", response_model=dict)
def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    # Check if patient already has 2 appointments on the same day
    existing_appointments = db.query(Appointment).filter(
        Appointment.patient_id == current_user.id,
        Appointment.appointment_date == appointment.appointment_date
    ).count()
    
    if existing_appointments >= 2:
        raise HTTPException(
            status_code=400,
            detail="Cannot book more than 2 appointments per day"
        )
    
    # Create new appointment
    db_appointment = Appointment(
        patient_id=current_user.id,
        patient_name=current_user.name,
        doctor_name=appointment.doctor_name,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        health_concern=appointment.health_concern,
        status="Pending"
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    return {"message": "Appointment booked successfully", "appointment_id": db_appointment.id}

@app.get("/appointments", response_model=List[AppointmentResponse])
def get_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "patient":
        appointments = db.query(Appointment).filter(
            Appointment.patient_id == current_user.id
        ).order_by(Appointment.created_at.desc()).all()
    else:  # doctor
        appointments = db.query(Appointment).filter(
            Appointment.doctor_name == current_user.name
        ).order_by(Appointment.created_at.desc()).all()
    
    return appointments

@app.get("/appointments/pending", response_model=List[AppointmentResponse])
def get_pending_appointments(db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(
        Appointment.status == "Pending"
    ).order_by(Appointment.created_at.desc()).all()
    
    return appointments

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)