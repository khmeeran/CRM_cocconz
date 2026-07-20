
from main import get_db
from models import FeeStructure, FeeHead
import uuid
db = next(get_db())

# Ensure a branch exists
from models import Branch
branch = db.query(Branch).first()
if not branch:
    branch = Branch(id=str(uuid.uuid4()), name="Test Branch", code="TB", address="Test")
    db.add(branch)
    db.commit()

# Ensure a fee head exists
head = db.query(FeeHead).first()
if not head:
    head = FeeHead(id=str(uuid.uuid4()), name="Tuition Fee")
    db.add(head)
    db.commit()

# Create fee structure
fee = FeeStructure(id=str(uuid.uuid4()), branch_id=branch.id, class_id=f"a01591c0-9588-4bf2-a45b-329d5fbaebc1", fee_head_id=head.id, amount=55000.0)
db.add(fee)
db.commit()
