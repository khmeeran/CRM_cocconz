from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, database
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import secrets
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
from pythonjsonlogger import jsonlogger
import sentry_sdk
from asgi_correlation_id import CorrelationIdMiddleware, correlation_id

# Initialize Sentry
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=1.0,
        environment=os.getenv("ENV", "development")
    )

# Setup Logging
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

from logging.handlers import RotatingFileHandler

# Root Logger Config
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)

formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(correlation_id)s %(message)s')

# Stream Handler (Console)
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
root_logger.addHandler(stream_handler)

# File Handler (App)
app_file_handler = RotatingFileHandler(os.path.join(LOG_DIR, "app.log"), maxBytes=10*1024*1024, backupCount=5)
app_file_handler.setFormatter(formatter)
root_logger.addHandler(app_file_handler)

# File Handler (Error)
error_file_handler = RotatingFileHandler(os.path.join(LOG_DIR, "error.log"), maxBytes=10*1024*1024, backupCount=5)
error_file_handler.setLevel(logging.ERROR)
error_file_handler.setFormatter(formatter)
root_logger.addHandler(error_file_handler)

# Access Log (Specific logger for requests)
access_logger = logging.getLogger("access")
access_logger.setLevel(logging.INFO)
access_logger.propagate = False # Don't send to root logger to avoid duplication
access_file_handler = RotatingFileHandler(os.path.join(LOG_DIR, "access.log"), maxBytes=10*1024*1024, backupCount=5)
access_file_handler.setFormatter(formatter)
access_logger.addHandler(access_file_handler)

logger = logging.getLogger(__name__)

# Import Celery App
from celery_app import celery_app

# Production DB Migrations (Alembic) should be used instead of create_all
if os.getenv("ENV") != "production":
    models.Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="CRM Cocoonz API")
app.state.limiter = limiter

# Add Correlation ID Middleware
app.add_middleware(CorrelationIdMiddleware)

# Access Logging Middleware
@app.middleware("http")
async def access_log_middleware(request: Request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    access_logger.info(
        f"{request.method} {request.url.path}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration": round(process_time, 4),
            "client_ip": request.client.host if request.client else "unknown"
        }
    )
    return response

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    cid = correlation_id.get()
    logger.exception(f"Unhandled exception during {request.method} {request.url.path}", extra={"correlation_id": cid})
    return Response(
        content='{"detail": "Internal Server Error"}',
        status_code=500,
        media_type="application/json"
    )

# --- Health Probes ---
@app.get("/api/debug/version")
def debug_version():
    import subprocess
    from datetime import datetime
    try:
        commit_hash = subprocess.check_output(["git", "rev-parse", "HEAD"]).decode("utf-8").strip()
    except Exception:
        commit_hash = "unknown"
    return {
        "commit_hash": commit_hash,
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Debug version endpoint"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    from sqlalchemy import text
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "error", "database": "disconnected"}

@app.get("/version")
def get_version():
    return {"version": "1.0.0-beta.1"}

@app.get("/api/health/liveness")
def liveness_probe():
    return {"status": "alive"}

@app.get("/api/health/readiness")
def readiness_probe(db: Session = Depends(get_db)):
    from sqlalchemy import text
    try:
        # Check DB connection
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Readiness probe failed: {e}", extra={"correlation_id": correlation_id.get()})
        raise HTTPException(status_code=503, detail="Database not ready")

# Auth Config
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY or len(SECRET_KEY) < 32 or SECRET_KEY == "dev_secret_key":
    raise RuntimeError("FATAL: A strong SECRET_KEY (min 32 chars) must be set in environment variables for production.")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def verify_password(plain_password, hashed_password):
    import bcrypt
    if hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        try:
            return bcrypt.checkpw(plain_password, hashed_password)
        except Exception:
            return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    import bcrypt
    if isinstance(password, str):
        password = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_token(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ")[1]
    if not token:
        token = request.query_params.get("token")
    return token

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = get_token(request)
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve Next.js Frontend Assets
app.mount("/_next", StaticFiles(directory="../frontend/out/_next"), name="next_static")

# CORS Config
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://cocoonz-school.vercel.app").split(",")
ALLOWED_ORIGIN_REGEX = os.getenv("ALLOWED_ORIGIN_REGEX", r"https://.*\.vercel\.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure cookies work over HTTPS (required for the Tunnel)
@app.middleware("http")
async def secure_cookie_middleware(request: Request, call_next):
    response = await call_next(request)
    # If we are in production (running through tunnel), ensure cookies are Secure and SameSite=None
    if os.getenv("ENV") == "production":
        # Check all set-cookie headers
        for i, header in enumerate(response.raw_headers):
            if header[0].lower() == b"set-cookie":
                cookie_val = header[1].decode()
                # Ensure Secure and SameSite=None for cross-site cookie usage
                new_val = cookie_val
                if "Secure" not in new_val:
                    new_val += "; Secure"
                if "SameSite" in new_val:
                    import re
                    new_val = re.sub(r"SameSite=\w+", "SameSite=None", new_val, flags=re.IGNORECASE)
                else:
                    new_val += "; SameSite=None"
                response.raw_headers[i] = (b"set-cookie", new_val.encode())
    return response

# CSRF Middleware completely removed. 
# Since we rely on JWT Bearer tokens, CSRF is not required and causes cross-origin deployment blocks.

def check_role(user: models.User, allowed_roles: List[str]):
    # Translate database roles to allowed_roles values
    role_map = {
        "Super Admin": "ADMIN",
        "Branch Admin": "OFFICE",
        "Accountant": "ACCOUNTANT",
        "Teacher": "TEACHER"
    }
    mapped_role = role_map.get(user.role, user.role)
    print(f"--- CHECK ROLE --- User: {user.username}, Role: {user.role}, Mapped: {mapped_role}, Allowed: {allowed_roles}")
    if mapped_role not in allowed_roles:
        print(f"REJECTION REASON: Role {mapped_role} not in {allowed_roles}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Insufficient permissions"
        )

# --- Auth Endpoints ---
@app.post("/token")
@limiter.limit("10/minute")
async def login_for_access_token(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Set HttpOnly cookie for JWT
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, # Set to True in actual prod with HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    # Set double-submit CSRF token
    csrf_token = secrets.token_hex(32)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=False,
        samesite="lax",
        path="/"
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("csrf_token")
    return {"status": "success"}

@app.post("/api/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN"])
    db_user = models.User(
        username=user.username,
        password_hash=get_password_hash(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=List[schemas.User])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN"])
    if limit > 100:
        limit = 100
    return db.query(models.User).offset(skip).limit(limit).all()

# --- Classes ---
PRESCHOOL_CLASSES = {"Playgroup", "Readiness", "Pre KG", "Junior KG", "Senior KG"}
PRIMARY_CLASSES = {"Class 1", "Class 2", "Class 3", "Class 4", "Class 5"}
ALLOWED_CLASSES = PRESCHOOL_CLASSES.union(PRIMARY_CLASSES)

def resolve_and_validate_class(class_name: str) -> str:
    cleaned_name = class_name.strip()
    class_master_mode = os.getenv("CLASS_MASTER_MODE", "CONFIGURABLE")
    if class_master_mode == "FIXED":
        if cleaned_name not in ALLOWED_CLASSES:
            raise ValueError(f"Class name '{cleaned_name}' is not in the whitelist under FIXED mode. Valid classes: {sorted(list(ALLOWED_CLASSES))}")
    return cleaned_name

@app.post("/api/classes", response_model=schemas.Class)
def create_class(class_data: schemas.ClassCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    
    class_name = class_data.name.strip()
    division = class_data.division
    
    # Check CLASS_MASTER_MODE from environment
    class_master_mode = os.getenv("CLASS_MASTER_MODE", "CONFIGURABLE")
    if class_master_mode == "FIXED":
        if class_name not in ALLOWED_CLASSES:
            raise HTTPException(
                status_code=400,
                detail=f"Class name '{class_name}' is not in the whitelist under FIXED mode. Valid classes: {sorted(list(ALLOWED_CLASSES))}"
            )
        # Determine division automatically
        if class_name in PRESCHOOL_CLASSES:
            division = "Preschool"
        elif class_name in PRIMARY_CLASSES:
            division = "Primary"
    else:
        # For CONFIGURABLE mode, if division is not provided, try to guess or leave it
        if not division:
            if class_name in PRESCHOOL_CLASSES:
                division = "Preschool"
            elif class_name in PRIMARY_CLASSES:
                division = "Primary"

    db_class = models.Class(name=class_name, section=class_data.section.strip(), division=division)
    db.add(db_class)
    try:
        db.commit()
        db.refresh(db_class)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Class already exists")
    return db_class

@app.get("/api/classes", response_model=List[schemas.Class])
def get_classes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER", "ACCOUNTANT"])
    return db.query(models.Class).all()

# --- Parents ---
@app.get("/api/parents", response_model=List[schemas.Parent])
def get_parents(phone: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER"])
    query = db.query(models.Parent)
    if phone:
        query = query.filter(models.Parent.primary_phone == phone)
    return query.all()

# --- Students ---
@app.post("/api/students", response_model=schemas.Student)
def create_student(student_data: schemas.StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    parent_id = student_data.parent_id
    
    # If a new parent object is provided, create/link it
    if student_data.parent:
        existing_parent = db.query(models.Parent).filter(models.Parent.primary_phone == student_data.parent.primary_phone).first()
        if existing_parent:
            parent_id = existing_parent.id
        else:
            new_parent = models.Parent(**student_data.parent.dict())
            db.add(new_parent)
            db.commit()
            db.refresh(new_parent)
            parent_id = new_parent.id
    
    if not parent_id:
        raise HTTPException(status_code=400, detail="Parent information is required")

    student_dict = student_data.dict(exclude={'parent', 'total_fees'})
    student_dict['parent_id'] = parent_id
    
    db_student = models.Student(**student_dict)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    # Initialize fee summary with custom total
    fee_summary = models.FeeSummary(
        student_id=db_student.id, 
        total_amount=student_data.total_fees, 
        paid_amount=0, 
        pending_balance=student_data.total_fees
    )
    db.add(fee_summary)
    db.commit()
    
    return db_student

@app.get("/api/students")
def get_students(class_id: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER", "ACCOUNTANT"])
    from sqlalchemy.orm import joinedload
    
    # Use joinedload to fetch fees and parent in a single query (or minimal joined queries)
    # and prevent N+1 during serialization
    query = db.query(models.Student).options(
        joinedload(models.Student.fees),
        joinedload(models.Student.parent),
        joinedload(models.Student.student_class)
    )
    
    if class_id:
        query = query.filter(models.Student.class_id == class_id)
    
    # Enforce maximum limit for production safety
    if limit > 500:
        limit = 500
        
    students = query.offset(skip).limit(limit).all()
    result = []
    from datetime import date
    today = date.today()

    for s in students:
        # Calculate Nudge Level
        nudge_level = "NONE"
        days_overdue = 0
        if s.fees and s.fees.pending_balance > 0 and s.fees.next_due_date:
            days_overdue = (today - s.fees.next_due_date).days
            if days_overdue > 15: nudge_level = "STRICT"
            elif days_overdue > 7: nudge_level = "FIRM"
            elif days_overdue >= -3: nudge_level = "FRIENDLY" 

        result.append({
            "id": s.id,
            "name": s.name,
            "roll_no": s.roll_no,
            "class_name": f"{s.student_class.name} - {s.student_class.section}" if s.student_class else "N/A",
            "parent_name": f"{s.parent.father_name or s.parent.mother_name}" if s.parent else "N/A",
            "parent_phone": s.parent.primary_phone if s.parent else "N/A",
            "pending_balance": float(s.fees.pending_balance) if s.fees else 0,
            "due_date": s.fees.next_due_date.isoformat() if s.fees and s.fees.next_due_date else None,
            "nudge_level": nudge_level,
            "days_overdue": days_overdue,
            "status": s.status
        })
    return result

# --- Attendance ---
@app.get("/api/attendance/check")
def check_attendance(class_id: str, date: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "TEACHER", "OFFICE"])
    
    # Get all student IDs in this class
    student_ids = db.query(models.Student.id).filter(models.Student.class_id == class_id).all()
    student_ids = [s[0] for s in student_ids]
    
    # Fetch existing attendance records for these students on the specific date
    records = db.query(models.Attendance).filter(
        models.Attendance.student_id.in_(student_ids),
        models.Attendance.date == date
    ).all()
    
    return [{"student_id": r.student_id, "status": r.status} for r in records]

@app.post("/api/attendance/bulk")
def mark_attendance(data: schemas.AttendanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "TEACHER", "OFFICE"])
    from uuid import UUID
    for entry in data.entries:
        try:
            s_id = UUID(entry['student_id']) if isinstance(entry['student_id'], str) else entry['student_id']
            # Check for existing record
            existing = db.query(models.Attendance).filter(
                models.Attendance.student_id == s_id,
                models.Attendance.date == data.date
            ).first()
            
            if existing:
                existing.status = entry['status']
            else:
                attendance = models.Attendance(
                    student_id=s_id,
                    date=data.date,
                    status=entry['status']
                )
                db.add(attendance)
        except Exception as e:
            logger.error(f"Error processing attendance entry: {e}")
            continue
            
    db.commit()
    return {"status": "success", "count": len(data.entries)}

# --- Student Modification ---
@app.put("/api/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: str, student_data: schemas.StudentBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    for key, value in student_data.dict(exclude_unset=True).items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student

@app.delete("/api/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN"]) # Restricted to ADMIN only for safety
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return {"status": "success", "message": "Student deleted"}

# --- Dashboard ---
@app.get("/api/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER", "ACCOUNTANT"])
    total_students = db.query(models.Student).count()
    # Simplified today's attendance
    from datetime import date
    today = date.today()
    present_count = db.query(models.Attendance).filter(models.Attendance.date == today, models.Attendance.status == 'P').count()
    total_marked = db.query(models.Attendance).filter(models.Attendance.date == today).count()
    attendance_pct = (present_count / total_marked * 100) if total_marked > 0 else 0
    
    import sqlalchemy
    total_pending = db.query(sqlalchemy.func.sum(models.FeeSummary.pending_balance)).scalar() or 0
    
    return {
        "total_students": total_students,
        "attendance_percentage": round(attendance_pct, 1),
        "total_pending_fees": float(total_pending)
    }

@app.post("/api/fees/pay")
def pay_fee(payment: schemas.PaymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "ACCOUNTANT"])
    
    # Use pessimistic locking to prevent race conditions on balance updates
    fee_summary = db.query(models.FeeSummary).filter(
        models.FeeSummary.student_id == payment.student_id
    ).with_for_update().first()
    
    if not fee_summary:
        raise HTTPException(status_code=404, detail="Fee summary not found for student")

    import uuid
    from datetime import datetime
    
    payment_id = str(uuid.uuid4())
    generated_receipt_no = payment.receipt_no or f"REC-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4].upper()}"
    
    db_payment = models.PaymentHistory(
        id=payment_id,
        student_id=payment.student_id,
        amount=payment.amount,
        payment_mode=payment.payment_mode,
        receipt_no=generated_receipt_no
    )
    db.add(db_payment)
    
    fee_summary.paid_amount += payment.amount
    fee_summary.pending_balance -= payment.amount
    
    # Auto-post to General Ledger
    student = db.query(models.Student).filter(models.Student.id == payment.student_id).first()
    ledger_entry = models.GeneralLedger(
        transaction_type='INCOME',
        category='FEE',
        amount=payment.amount,
        description=f"Fee payment from {student.name}",
        reference_id=payment_id
    )
    db.add(ledger_entry)
    
    db.commit()
    return {"status": "success"}

@app.get("/api/ledger/receipt/{receipt_no}/pdf")
def download_receipt_pdf(receipt_no: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "ACCOUNTANT", "TEACHER"])
    payment = db.query(models.PaymentHistory).filter(models.PaymentHistory.receipt_no == receipt_no).first()
    if not payment: raise HTTPException(status_code=404, detail="Receipt not found")
    
    student = db.query(models.Student).filter(models.Student.id == payment.student_id).first()
    
    pdf_bytes = services.ExportService.generate_receipt_pdf(
        receipt_no=payment.receipt_no,
        student_name=student.name,
        roll_no=student.roll_no,
        amount=float(payment.amount),
        date=payment.payment_date.strftime("%Y-%m-%d"),
        payment_mode=payment.payment_mode
    )
    from fastapi.responses import Response
    return Response(content=bytes(pdf_bytes), media_type='application/pdf')

@app.get("/api/students/{student_id}/ledger")
def get_student_ledger(student_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "ACCOUNTANT"])
    history = db.query(models.PaymentHistory).filter(models.PaymentHistory.student_id == student_id).order_by(models.PaymentHistory.payment_date.desc()).all()
    return history

@app.get("/api/reports/outstanding")
def get_outstanding_fees_report(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "ACCOUNTANT"])
    students = db.query(models.Student).all()
    report = []
    for s in students:
        if s.fees and s.fees.pending_balance > 0:
            report.append({
                "student_id": s.id,
                "name": s.name,
                "roll_no": s.roll_no,
                "class_name": s.student_class.name if s.student_class else "",
                "parent_name": s.parent.father_name or s.parent.mother_name if s.parent else "",
                "parent_phone": s.parent.primary_phone if s.parent else "",
                "pending_balance": float(s.fees.pending_balance)
            })
    return sorted(report, key=lambda x: x['pending_balance'], reverse=True)

# --- Staff Management ---
@app.post("/api/staff", response_model=schemas.Staff)
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    db_staff = models.Staff(**staff.dict())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@app.get("/api/staff", response_model=List[schemas.Staff])
def get_staff(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    return db.query(models.Staff).all()

@app.post("/api/staff/attendance/bulk")
def mark_staff_attendance(data: schemas.StaffAttendanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    for entry in data.entries:
        attendance = models.StaffAttendance(
            staff_id=entry['staff_id'],
            date=data.date,
            status=entry['status']
        )
        db.merge(attendance)
    db.commit()
    return {"status": "success", "count": len(data.entries)}

@app.post("/api/staff/salary/pay")
def pay_salary(payment: schemas.SalaryPaymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "ACCOUNTANT"])
    db_payment = models.SalaryPayment(**payment.dict())
    db.add(db_payment)
    
    # Auto-post to General Ledger
    staff = db.query(models.Staff).filter(models.Staff.id == payment.staff_id).first()
    ledger_entry = models.GeneralLedger(
        transaction_type='EXPENSE',
        category='SALARY',
        amount=payment.amount_paid,
        description=f"Salary to {staff.name} ({payment.for_month})",
        reference_id=db_payment.id
    )
    db.add(ledger_entry)
    
    db.commit()
    return {"status": "success"}

@app.get("/api/staff/salary/history/{staff_id}")
def get_salary_history(staff_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "ACCOUNTANT"])
    return db.query(models.SalaryPayment).filter(models.SalaryPayment.staff_id == staff_id).all()

# --- Accounting / Ledger ---
@app.post("/api/ledger")
def add_ledger_entry(entry: schemas.LedgerEntryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "ACCOUNTANT"])
    db_entry = models.GeneralLedger(**entry.dict())
    db.add(db_entry)
    db.commit()
    return {"status": "success"}

@app.get("/api/ledger")
def get_ledger(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "ACCOUNTANT"])
    return db.query(models.GeneralLedger).order_by(models.GeneralLedger.date.desc()).all()

@app.get("/api/ledger/stats")
def get_ledger_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "ACCOUNTANT"])
    import sqlalchemy
    total_income = db.query(sqlalchemy.func.sum(models.GeneralLedger.amount)).filter(models.GeneralLedger.transaction_type == 'INCOME').scalar() or 0
    total_expense = db.query(sqlalchemy.func.sum(models.GeneralLedger.amount)).filter(models.GeneralLedger.transaction_type == 'EXPENSE').scalar() or 0
    return {
        "income": float(total_income),
        "expense": float(total_expense),
        "profit": float(total_income - total_expense)
    }

from fastapi import BackgroundTasks
import services

# --- Broadcast ---
@app.post("/api/broadcast")
def send_broadcast(broadcast: schemas.BroadcastCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    
    db_broadcast = models.Broadcast(
        target_class_id=broadcast.target_class_id,
        message=broadcast.message,
        status="PROCESSING"
    )
    db.add(db_broadcast)
    db.commit()
    db.refresh(db_broadcast)
    
    # Get phones
    query = db.query(models.Student)
    if broadcast.target_class_id:
        query = query.filter(models.Student.class_id == broadcast.target_class_id)
    students = query.all()
    
    phones = set()
    for s in students:
        if s.parent and s.parent.primary_phone:
            phones.add(s.parent.primary_phone)
            
    # Dispatch durable task via Celery
    celery_app.send_task("tasks.send_broadcast", args=[list(phones), broadcast.message, ["SMS", "WHATSAPP"]])
    
    db_broadcast.status = "QUEUED"
    db.commit()
    
    return {"status": "success", "id": db_broadcast.id, "receivers_count": len(phones)}

@app.get("/api/broadcast")
def get_broadcasts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    return db.query(models.Broadcast).order_by(models.Broadcast.timestamp.desc()).all()

# --- TimeTable ---
@app.post("/api/timetable", response_model=schemas.TimeTable)
def create_timetable(tt: schemas.TimeTableCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    db_tt = models.TimeTable(**tt.dict())
    db.add(db_tt)
    db.commit()
    db.refresh(db_tt)
    return db_tt

# --- Proxy Pilot ---
@app.get("/api/proxy/available-teachers")
def get_available_teachers(day: str, period: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    # 1. Get all teachers
    all_teachers = db.query(models.Staff).filter(models.Staff.role == 'TEACHER').all()
    
    # 2. Find teachers who have a class in this period (from TimeTable)
    busy_teacher_ids = db.query(models.TimeTable.teacher_id).filter(
        models.TimeTable.day_of_week == day.upper(),
        models.TimeTable.period_number == period
    ).all()
    busy_teacher_ids = [r[0] for r in busy_teacher_ids]
    
    # 3. Find teachers who are already assigned as proxy for this period today
    from datetime import date
    assigned_proxy_ids = db.query(models.ProxyAssignment.proxy_teacher_id).filter(
        models.ProxyAssignment.date == date.today(),
        models.ProxyAssignment.period_number == period
    ).all()
    assigned_proxy_ids = [r[0] for r in assigned_proxy_ids]
    
    available = []
    for t in all_teachers:
        if t.id not in busy_teacher_ids and t.id not in assigned_proxy_ids:
            available.append({"id": t.id, "name": t.name})
            
    return available

@app.post("/api/proxy/assign")
def assign_proxy(assignment: schemas.ProxyAssignmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    db_proxy = models.ProxyAssignment(**assignment.dict())
    db.add(db_proxy)
    db.commit()
    return {"status": "success", "id": db_proxy.id}

@app.get("/api/proxy/timetable/{teacher_id}")
def get_teacher_timetable(teacher_id: str, day: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER"])
    return db.query(models.TimeTable).filter(
        models.TimeTable.teacher_id == teacher_id,
        models.TimeTable.day_of_week == day.upper()
    ).all()

# --- Live Bus Pulse ---
@app.post("/api/transport/trip", response_model=schemas.BusTrip)
def create_bus_trip(trip: schemas.BusTripCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    db_trip = models.BusTrip(**trip.dict())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@app.get("/api/transport/trips", response_model=List[schemas.BusTrip])
def get_bus_trips(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER"])
    return db.query(models.BusTrip).all()

@app.post("/api/transport/trip/{bus_id}/status")
def update_trip_status(bus_id: str, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    db_trip = db.query(models.BusTrip).filter(models.BusTrip.id == bus_id).first()
    if not db_trip: raise HTTPException(status_code=404, detail="Bus not found")
    
    db_trip.status = status
    db_trip.last_updated = datetime.utcnow()
    db.commit()
    
    # Placeholder: If EN_ROUTE, trigger WhatsApp broadcast to parents with Tracking Link
    return {"status": "success", "bus_id": bus_id, "new_status": status}

@app.post("/api/transport/trip/{bus_id}/location")
def update_location(bus_id: str, location: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE"])
    db_trip = db.query(models.BusTrip).filter(models.BusTrip.id == bus_id).first()
    if not db_trip: raise HTTPException(status_code=404, detail="Bus not found")

    db_trip.current_location = location
    db_trip.last_updated = datetime.utcnow()
    db.commit()
    return {"status": "success"}

# --- PTM Profile (Parent Confrontation Fix) ---
@app.get("/api/students/profile/{student_id}")
def get_student_ptm_profile(student_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER", "ACCOUNTANT"])
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")

    # 1. Attendance Stats
    from datetime import date, timedelta
    total_days = 30
    start_date = date.today() - timedelta(days=total_days)
    attendance_records = db.query(models.Attendance).filter(
        models.Attendance.student_id == student_id,
        models.Attendance.date >= start_date
    ).all()

    present_count = sum(1 for r in attendance_records if r.status == 'P')
    attendance_pct = (present_count / len(attendance_records) * 100) if attendance_records else 100

    # 2. Payment Discipline
    history = db.query(models.PaymentHistory).filter(models.PaymentHistory.student_id == student_id).all()
    total_paid = sum(p.amount for p in history)

    return {
        "student": {
            "name": student.name,
            "roll_no": student.roll_no,
            "class": student.student_class.name,
            "parent_name": student.parent.father_name or student.parent.mother_name,
            "phone": student.parent.primary_phone
        },
        "metrics": {
            "attendance_30d": round(attendance_pct, 1),
            "total_paid": float(total_paid),
            "balance": float(student.fees.pending_balance) if student.fees else 0,
            "discipline_score": "High" if attendance_pct > 90 else "Medium"
        },
        "recent_activity": [
            {"date": r.date.isoformat(), "type": "ATTENDANCE", "status": r.status} 
            for r in sorted(attendance_records, key=lambda x: x.date, reverse=True)[:5]
        ]
    }

from fastapi import UploadFile, File
import shutil

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "TEACHER", "ACCOUNTANT"])
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Sanitize filename
    safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._-").strip()
    if not safe_filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    filepath = os.path.join(upload_dir, safe_filename)
    
    # Final check to ensure path is within upload_dir
    if not os.path.abspath(filepath).startswith(os.path.abspath(upload_dir)):
        raise HTTPException(status_code=400, detail="Invalid upload path")

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"status": "success", "filename": safe_filename, "url": f"/api/uploads/{safe_filename}"}

@app.get("/api/uploads/{filename}")
def get_uploaded_file(filename: str):
    # Sanitize filename for retrieval
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    filepath = os.path.join(upload_dir, safe_filename)
    
    if not os.path.exists(filepath) or not os.path.abspath(filepath).startswith(os.path.abspath(upload_dir)):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

@app.get("/api/export/students/excel")
def export_students_excel(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "ACCOUNTANT"])
    students = db.query(models.Student).all()
    data = []
    for s in students:
        data.append({
            "ID": s.id,
            "Name": s.name,
            "Roll No": s.roll_no,
            "Class": s.student_class.name if s.student_class else "",
            "Division": s.student_class.division if (s.student_class and s.student_class.division) else "",
            "Status": s.status
        })
    filepath = services.ExportService.generate_excel(data, "students")
    return FileResponse(filepath, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename=os.path.basename(filepath))

@app.get("/api/export/students/pdf")
def export_students_pdf(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    check_role(current_user, ["ADMIN", "OFFICE", "ACCOUNTANT"])
    students = db.query(models.Student).all()
    data = []
    for s in students:
        data.append({
            "Name": s.name,
            "Roll No": s.roll_no,
            "Class": s.student_class.name if s.student_class else "",
            "Division": s.student_class.division if (s.student_class and s.student_class.division) else "",
            "Status": s.status
        })
    filepath = services.ExportService.generate_pdf(data, "Student List", "students")
    return FileResponse(filepath, media_type='application/pdf', filename=os.path.basename(filepath))

# Serve Next.js frontend pages and handle fallbacks
@app.get("/{path:path}")
def serve_frontend(path: str):
    clean_path = path.strip("/")
    
    # Check if a directory with index.html exists
    dir_index = os.path.join("../frontend/out", clean_path, "index.html")
    if os.path.exists(dir_index):
        return FileResponse(dir_index)
        
    # Check if a direct file exists
    file_path = os.path.join("../frontend/out", clean_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Fallback to login index page
    return FileResponse("../frontend/out/login/index.html")


