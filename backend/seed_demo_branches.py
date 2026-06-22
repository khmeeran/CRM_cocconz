from database import SessionLocal
from models import Branch

db = SessionLocal()

branches = [
    {'name': 'SP Kovil Branch 1', 'code': 'BR_SPK', 'address': '10 School Road, SP Kovil, Chennai', 'is_active': True},
    {'name': 'Vandalur Branch 2', 'code': 'BR_VAN', 'address': '25 G.S.T Road, Vandalur, Chennai', 'is_active': True},
    {'name': 'Adyar Branch 3', 'code': 'BR_ADY', 'address': '15 Adyar Main Road, Adyar, Chennai', 'is_active': True}
]

for b_data in branches:
    existing = db.query(Branch).filter(Branch.name == b_data['name']).first()
    if not existing:
        new_branch = Branch(**b_data)
        db.add(new_branch)
        print(f"Added {b_data['name']}")
    else:
        print(f"Already exists: {b_data['name']}")

db.commit()
db.close()
