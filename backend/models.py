from sqlalchemy import Column, String, ForeignKey, Date, DateTime, Numeric, Boolean, UniqueConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

class Branch(Base):
    __tablename__ = "branches"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    address = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

class FeeHead(Base):
    __tablename__ = "fee_heads"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)

class FeeStructure(Base):
    __tablename__ = "fee_structures"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id = Column(String, ForeignKey("branches.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    fee_head_id = Column(String, ForeignKey("fee_heads.id"), nullable=False)
    term = Column(String, nullable=True) # Term 1, Term 2, Term 3
    amount = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)  # 'ADMIN', 'TEACHER'

class Class(Base):
    __tablename__ = "classes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    section = Column(String)
    division = Column(String, nullable=True)
    __table_args__ = (UniqueConstraint('name', 'section', name='_class_section_uc'),)
    students = relationship("Student", back_populates="student_class")

class Parent(Base):
    __tablename__ = "parents"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    father_name = Column(String, nullable=True)
    mother_name = Column(String, nullable=True)
    primary_phone = Column(String, unique=True, index=True)
    secondary_phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    students = relationship("Student", back_populates="parent")

class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    roll_no = Column(String, unique=True)
    class_id = Column(String, ForeignKey("classes.id"))
    parent_id = Column(String, ForeignKey("parents.id"))
    dob = Column(Date, nullable=True)
    blood_group = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    payment_preference = Column(String, default="Term Wise") # 'Full Fee' or 'Term Wise'
    
    parent = relationship("Parent", back_populates="students")
    student_class = relationship("Class", back_populates="students")
    attendance = relationship("Attendance", back_populates="student")
    fees = relationship("FeeSummary", back_populates="student", uselist=False)

class StudentFeeAssignment(Base):
    __tablename__ = "student_fee_assignments"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    fee_head_id = Column(String, ForeignKey("fee_heads.id"), nullable=False)
    term = Column(String, nullable=True)
    original_amount = Column(Numeric(10, 2), nullable=False)
    discount_percentage = Column(Numeric(5, 2), default=0.0)
    discount_amount = Column(Numeric(10, 2), default=0.0)
    final_amount = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0.0)
    due_date = Column(Date, nullable=True)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"))
    date = Column(Date, index=True)
    status = Column(String)  # 'P', 'A'
    remark = Column(String, nullable=True)
    
    student = relationship("Student", back_populates="attendance")
    __table_args__ = (UniqueConstraint('student_id', 'date', name='_student_date_attendance_uc'),)

class FeeSummary(Base):
    __tablename__ = "fees_summary"
    student_id = Column(String, ForeignKey("students.id"), primary_key=True)
    total_amount = Column(Numeric(10, 2), default=0.0)
    paid_amount = Column(Numeric(10, 2), default=0.0)
    pending_balance = Column(Numeric(10, 2), default=0.0)
    next_due_date = Column(Date, nullable=True) # Deadline for reminders
    
    student = relationship("Student", back_populates="fees")

class PaymentHistory(Base):
    __tablename__ = "payment_history"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"))
    assignment_id = Column(String, ForeignKey("student_fee_assignments.id"), nullable=True)
    fee_head_id = Column(String, ForeignKey("fee_heads.id"), nullable=True)
    amount = Column(Numeric(10, 2))
    payment_date = Column(DateTime, default=datetime.utcnow)
    payment_mode = Column(String)  # 'CASH', 'UPI', 'BANK'
    receipt_no = Column(String, nullable=True)
    recorded_by = Column(String, ForeignKey("users.id"))

class Broadcast(Base):
    __tablename__ = "broadcasts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    target_class_id = Column(String, ForeignKey("classes.id"), nullable=True)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="SENT")

class Staff(Base):
    __tablename__ = "staff"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    role = Column(String)  # 'TEACHER', 'OFFICE', 'DRIVER', etc.
    phone = Column(String)
    monthly_salary = Column(Numeric(10, 2))
    joining_date = Column(Date, default=datetime.utcnow().date())

    attendance = relationship("StaffAttendance", back_populates="staff_member")
    payments = relationship("SalaryPayment", back_populates="staff_member")

class StaffAttendance(Base):
    __tablename__ = "staff_attendance"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id = Column(String, ForeignKey("staff.id"))
    date = Column(Date, index=True)
    status = Column(String)  # 'P', 'A', 'L' (Leave)

    staff_member = relationship("Staff", back_populates="attendance")
    __table_args__ = (UniqueConstraint('staff_id', 'date', name='_staff_date_attendance_uc'),)

class SalaryPayment(Base):
    __tablename__ = "salary_payments"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id = Column(String, ForeignKey("staff.id"))
    amount_paid = Column(Numeric(10, 2))
    payment_date = Column(Date, default=datetime.utcnow().date())
    for_month = Column(String) # 'January', 'February', etc.
    for_year = Column(String)

    staff_member = relationship("Staff", back_populates="payments")

class GeneralLedger(Base):
    __tablename__ = "general_ledger"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_type = Column(String) # 'INCOME' or 'EXPENSE'
    category = Column(String) # 'FEE', 'SALARY', 'UTILITY', 'SUPPLIES', 'OTHER'
    amount = Column(Numeric(10, 2))
    description = Column(String)
    date = Column(Date, default=datetime.utcnow().date())
    reference_id = Column(String, nullable=True)
    bill_image_url = Column(String, nullable=True) # Photo proof for petty cash

class TimeTable(Base):
    __tablename__ = "time_table"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = Column(String, ForeignKey("classes.id"))
    teacher_id = Column(String, ForeignKey("staff.id"))
    day_of_week = Column(String) # 'MONDAY', etc.
    period_number = Column(Integer) # 1, 2, 3...
    subject = Column(String)

class ProxyAssignment(Base):
    __tablename__ = "proxy_assignments"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    original_teacher_id = Column(String, ForeignKey("staff.id"))
    proxy_teacher_id = Column(String, ForeignKey("staff.id"))
    date = Column(Date, default=datetime.utcnow().date())
    period_number = Column(Integer)
    class_id = Column(String, ForeignKey("classes.id"))
    status = Column(String, default="ASSIGNED") # 'ASSIGNED', 'COMPLETED'

class BusTrip(Base):
    __tablename__ = "bus_trips"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bus_no = Column(String)
    driver_name = Column(String)
    status = Column(String, default="IDLE") # 'IDLE', 'EN_ROUTE', 'COMPLETED'
    current_location = Column(String, nullable=True) # "Lat,Long" or Area Name
    last_updated = Column(DateTime, default=datetime.utcnow)

