from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    class Config:
        from_attributes = True

class BranchBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = True

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None

class Branch(BranchBase):
    id: str
    class Config:
        from_attributes = True



class FeeHeadBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    is_discountable: bool = False

class FeeHeadCreate(FeeHeadBase):
    pass

class FeeHead(FeeHeadBase):
    id: str
    class Config:
        from_attributes = True

class FeeStructureBase(BaseModel):
    branch_id: str
    class_id: str
    fee_head_id: str
    term: Optional[str] = None
    amount: float
    is_active: Optional[bool] = True

class FeeStructureCreate(FeeStructureBase):
    pass

class FeeStructureUpdate(BaseModel):
    branch_id: Optional[str] = None
    class_id: Optional[str] = None
    fee_head_id: Optional[str] = None
    term: Optional[str] = None
    amount: Optional[float] = None
    is_active: Optional[bool] = None

class FeeStructure(FeeStructureBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class StudentFeeAssignmentBase(BaseModel):
    student_id: str
    fee_head_id: str
    term: Optional[str] = None
    original_amount: float
    discount_percentage: float = 0.0
    discount_amount: float = 0.0
    final_amount: float
    amount_paid: float = 0.0
    due_date: Optional[date] = None

class StudentFeeAssignmentCreate(StudentFeeAssignmentBase):
    pass

class StudentFeeAssignment(StudentFeeAssignmentBase):
    id: str
    class Config:
        from_attributes = True

class ClassBase(BaseModel):
    name: str
    section: str
    division: Optional[str] = None
    branch_id: Optional[str] = None

class ClassCreate(ClassBase):
    pass

class Class(ClassBase):
    id: str
    class Config:
        from_attributes = True

class ParentBase(BaseModel):
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    primary_phone: str
    secondary_phone: Optional[str] = None
    address: Optional[str] = None

class ParentCreate(ParentBase):
    pass

class Parent(ParentBase):
    id: str
    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    name: str
    roll_no: str
    class_id: str
    parent_id: Optional[str] = None
    dob: Optional[date] = None
    blood_group: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class StudentCreate(StudentBase):
    parent: Optional[ParentCreate] = None

class Student(StudentBase):
    id: str
    class Config:
        from_attributes = True

class AdmissionCreate(BaseModel):
    name: str
    class_id: str
    parent_name: str
    primary_phone: str
    dob: Optional[date] = None
    status: Optional[str] = "ENQUIRY" # ENQUIRY, FOLLOW_UP, ADMITTED
    payment_preference: Optional[str] = "Term Wise"
    notes: Optional[str] = None # We can store notes in blood_group temporarily or just ignore, wait we shouldn't hack the DB. Let's just map it to student.

class AdmissionUpdate(BaseModel):
    name: Optional[str] = None
    class_id: Optional[str] = None
    status: Optional[str] = None
    payment_preference: Optional[str] = None

class AttendanceBase(BaseModel):
    student_id: str
    date: date
    status: str
    remark: Optional[str] = None

class AttendanceCreate(BaseModel):
    date: date
    entries: List[dict] # [{student_id, status}]

class Attendance(AttendanceBase):
    id: str
    class Config:
        from_attributes = True

class FeeSummary(BaseModel):
    total_amount: Decimal
    paid_amount: Decimal
    pending_balance: Decimal
    next_due_date: Optional[date] = None
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    student_id: str
    assignment_id: str
    fee_head_id: str
    amount: Decimal = Field(..., gt=0, description="Amount must be strictly positive")
    payment_mode: str # 'CASH', 'UPI', 'BANK'
    receipt_no: Optional[str] = None

class PaymentHistory(BaseModel):
    id: str
    student_id: str
    assignment_id: Optional[str]
    fee_head_id: Optional[str]
    amount: Decimal
    payment_date: datetime
    payment_mode: str
    receipt_no: Optional[str]
    recorded_by: str
    balance_due: Decimal
    receipt_status: str
    remarks: Optional[str]
    class Config:
        from_attributes = True

class BroadcastCreate(BaseModel):
    target_class_id: Optional[str] = None
    message: str

class StaffBase(BaseModel):
    name: str
    role: str
    phone: str
    email: Optional[str] = None
    qualification: Optional[str] = None
    address: Optional[str] = None
    monthly_salary: Decimal

class StaffCreate(StaffBase):
    pass

class Staff(StaffBase):
    id: str
    joining_date: date
    class Config:
        from_attributes = True

class StaffAttendanceCreate(BaseModel):
    date: date
    entries: List[dict] # [{staff_id, status}]

class SalaryPaymentCreate(BaseModel):
    staff_id: str
    amount_paid: Decimal
    bonus: Optional[Decimal] = 0.0
    advance: Optional[Decimal] = 0.0
    deductions: Optional[Decimal] = 0.0
    for_month: str
    for_year: str

class LedgerEntryCreate(BaseModel):
    transaction_type: str # 'INCOME', 'EXPENSE'
    category: str
    amount: Decimal
    description: str
    date: Optional[date] = None
    bill_image_url: Optional[str] = None

class LedgerEntry(LedgerEntryCreate):
    id: str
    class Config:
        from_attributes = True

class TimeTableBase(BaseModel):
    class_id: str
    teacher_id: str
    day_of_week: str
    period_number: int
    subject: str

class TimeTableCreate(TimeTableBase):
    pass

class TimeTable(TimeTableBase):
    id: str
    class Config:
        from_attributes = True

class ProxyAssignmentCreate(BaseModel):
    original_teacher_id: str
    proxy_teacher_id: str
    period_number: int
    class_id: str

class ProxyAssignment(ProxyAssignmentCreate):
    id: str
    date: date
    status: str
    class Config:
        from_attributes = True

class BusTripBase(BaseModel):
    bus_no: str
    driver_name: str
    status: Optional[str] = "IDLE"
    current_location: Optional[str] = None

class BusTripCreate(BusTripBase):
    pass

class BusTrip(BusTripBase):
    id: str
    last_updated: datetime
    class Config:
        from_attributes = True
