from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

class FeeHeadBase(BaseModel):
    name: str

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

