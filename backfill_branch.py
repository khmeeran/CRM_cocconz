from sqlalchemy.orm import Session
from backend.main import engine
from backend.models import Branch, User, Parent, Student, PaymentHistory, Staff, GeneralLedger, Broadcast
import uuid

def backfill_branches():
    with Session(engine) as session:
        # Find or create a default branch
        branch = session.query(Branch).first()
        if not branch:
            branch = Branch(id=str(uuid.uuid4()), name="Cocoonz Main", code="MAIN")
            session.add(branch)
            session.commit()
            session.refresh(branch)
        
        branch_id = branch.id
        
        models_to_backfill = [User, Parent, Student, PaymentHistory, Staff, GeneralLedger, Broadcast]
        
        for model in models_to_backfill:
            # We skip ADMIN users for now so they remain omnipotent
            query = session.query(model).filter(model.branch_id == None)
            if model == User:
                query = query.filter(User.role != 'ADMIN')
                
            records = query.all()
            for record in records:
                record.branch_id = branch_id
                
            session.commit()
            print(f"Backfilled {len(records)} records for {model.__name__}")

if __name__ == "__main__":
    backfill_branches()
