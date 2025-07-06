from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, date
from typing import Optional, List
import re
SQLALCHEMY_DATABASE_URL = "sqlite:///./meditrack.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="MediTrack Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  
    created_at = Column(DateTime, default=datetime.utcnow)

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    patient_name = Column(String, nullable=False)
    doctor_id = Column(Integer, nullable=True)  
    doctor_name = Column(String, nullable=False)
    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)
    health_concern = Column(Text, nullable=True)
    status = Column(String, default="Pending") 
    prescription = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=False)  
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    
    @validator('email')
    def validate_email(cls, v):
        email_pattern = r'^[a-zA-Z0-9._%+-]+@meditrack\.local$'
        if not re.match(email_pattern, v):
            raise ValueError('Email must be from @meditrack.local domain')
        return v.lower()
    
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
    email: str
    password: str
    
    @validator('email')
    def validate_email(cls, v):
        return v.lower()

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

class AppointmentUpdate(BaseModel):
    status: str
    prescription: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed']
        if v not in allowed_statuses:
            raise ValueError('Invalid status')
        return v

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    doctor_id: Optional[int]
    doctor_name: str
    appointment_date: str
    appointment_time: str
    health_concern: Optional[str]
    status: str
    prescription: Optional[str]
    created_at: datetime
    updated_at: datetime

class FeedbackCreate(BaseModel):
    appointment_id: int
    rating: int
    comment: Optional[str] = None
    
    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v
    
    @validator('comment')
    def validate_comment(cls, v):
        if v and len(v) > 150:
            raise ValueError('Comment must be 150 characters or less')
        return v

class FeedbackResponse(BaseModel):
    id: int
    appointment_id: int
    patient_id: int
    doctor_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime


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

@app.post("/register", response_model=dict)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email.lower()).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user.password)
        db_user = User(
            name=user.name,
            email=user.email.lower(),
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
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login", response_model=Token)
def login_user(user_login: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_login.email.lower()).first()
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
    return [{"id": doctor.id, "name": doctor.name, "email": doctor.email} for doctor in doctors]

@app.post("/appointments", response_model=dict)
def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    
    existing_appointments = db.query(Appointment).filter(
        Appointment.patient_id == current_user.id,
        Appointment.appointment_date == appointment.appointment_date
    ).count()
    
    if existing_appointments >= 2:
        raise HTTPException(
            status_code=400,
            detail="Cannot book more than 2 appointments per day"
        )
    
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
            Appointment.doctor_id == current_user.id
        ).order_by(Appointment.created_at.desc()).all()
    
    return appointments

@app.get("/appointments/pending", response_model=List[AppointmentResponse])
def get_pending_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view pending appointments")
    
    appointments = db.query(Appointment).filter(
        Appointment.status == "Pending"
    ).order_by(Appointment.created_at.desc()).all()
    
    return appointments

@app.put("/appointments/{appointment_id}/accept")
def accept_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can accept appointments")
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.status != "Pending":
        raise HTTPException(status_code=400, detail="Appointment is not pending")
    
    if appointment.doctor_id and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=400, detail="Appointment already accepted by another doctor")
    
    appointment.status = "Confirmed"
    appointment.doctor_id = current_user.id
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Appointment accepted successfully"}

@app.put("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update appointment status")
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own appointments")
    
    valid_transitions = {
        "Confirmed": ["In Progress"],
        "In Progress": ["Completed"]
    }
    
    if appointment.status not in valid_transitions:
        raise HTTPException(status_code=400, detail="Invalid current status for update")
    
    if appointment_update.status not in valid_transitions[appointment.status]:
        raise HTTPException(status_code=400, detail="Invalid status transition")
    
    appointment.status = appointment_update.status
    if appointment_update.prescription:
        appointment.prescription = appointment_update.prescription
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Appointment status updated successfully"}

@app.post("/feedback", response_model=dict)
def create_feedback(
    feedback: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can submit feedback")
    
    appointment = db.query(Appointment).filter(
        Appointment.id == feedback.appointment_id,
        Appointment.patient_id == current_user.id,
        Appointment.status == "Completed"
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Completed appointment not found")
    
    existing_feedback = db.query(Feedback).filter(
        Feedback.appointment_id == feedback.appointment_id
    ).first()
    
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this appointment")
    
    db_feedback = Feedback(
        appointment_id=feedback.appointment_id,
        patient_id=current_user.id,
        doctor_id=appointment.doctor_id,
        rating=feedback.rating,
        comment=feedback.comment
    )
    
    db.add(db_feedback)
    db.commit()
    
    return {"message": "Feedback submitted successfully"}

@app.get("/feedback/doctor", response_model=List[FeedbackResponse])
def get_doctor_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view their feedback")
    
    feedback = db.query(Feedback).filter(
        Feedback.doctor_id == current_user.id
    ).order_by(Feedback.created_at.desc()).all()
    
    return feedback

@app.get("/stats/doctor")
def get_doctor_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view stats")
    
    total_appointments = db.query(Appointment).filter(Appointment.doctor_id == current_user.id).count()
    completed_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == current_user.id,
        Appointment.status == "Completed"
    ).count()
    
    feedback_query = db.query(Feedback).filter(Feedback.doctor_id == current_user.id)
    feedback_list = feedback_query.all()
    
    average_rating = 0
    if feedback_list:
        total_rating = sum(f.rating for f in feedback_list)
        average_rating = round(total_rating / len(feedback_list), 1)
    
    return {
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "total_feedback": len(feedback_list),
        "average_rating": average_rating
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)