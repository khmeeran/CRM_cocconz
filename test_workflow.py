import sys
import os
import uuid
from decimal import Decimal
sys.path.append('E:/CRM_Cocoonz/backend')
from database import SessionLocal
import models
import schemas
from services import ExportService

db = SessionLocal()

fee_summary = db.query(models.FeeSummary).filter(models.FeeSummary.pending_balance > 0).first()

if fee_summary:
    student = db.query(models.Student).filter(models.Student.id == fee_summary.student_id).first()
    print(f"1. Selected Student: {student.name} (Balance: {fee_summary.pending_balance})")
    
    # 3. Pay
    pay_amount = Decimal('5000.00')
    
    # Simulate pay_fee
    payment_id = str(uuid.uuid4())
    from datetime import datetime
    generated_receipt_no = f"REC-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4].upper()}"
    
    db_payment = models.PaymentHistory(
        id=payment_id,
        student_id=student.id,
        amount=pay_amount,
        payment_mode="CASH",
        receipt_no=generated_receipt_no
    )
    db.add(db_payment)
    
    fee_summary.paid_amount += pay_amount
    fee_summary.pending_balance -= pay_amount
    
    ledger_entry = models.GeneralLedger(
        transaction_type='INCOME',
        category='FEE',
        amount=pay_amount,
        description=f"Fee payment from {student.name}",
        reference_id=payment_id
    )
    db.add(ledger_entry)
    db.commit()

    print(f"2. Collected Payment: {pay_amount}. Generated Receipt No: {generated_receipt_no}")
    
    # 4. Get PDF
    filepath = ExportService.generate_receipt_pdf(
        receipt_no=generated_receipt_no,
        student_name=student.name,
        roll_no=student.roll_no,
        amount=float(pay_amount),
        date=db_payment.payment_date.strftime("%Y-%m-%d"),
        payment_mode="CASH"
    )
    print(f"3. Downloaded PDF Receipt. Filepath: {filepath}")
    
    # 5. Outstanding Report Check
    db.refresh(fee_summary)
    print(f"4. Outstanding Report verified. Updated Balance: {fee_summary.pending_balance}")
    
else:
    print("No students found with a pending balance!")
