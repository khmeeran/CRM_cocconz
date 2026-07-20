
from main import get_db
from models import Parent, Student, FeeSummary
db = next(get_db())

parent = db.query(Parent).filter(Parent.primary_phone == "9993c0141d").first()
if parent:
    print("ERROR: Orphaned Parent found in database! (ID: " + str(parent.id) + ")")
else:
    print("SUCCESS: Parent was correctly rolled back.")

student = db.query(Student).filter(Student.name == "FAIL_TRANSACTION").first()
if student:
    print("ERROR: Orphaned Student found in database! (ID: " + str(student.id) + ")")
else:
    print("SUCCESS: Student was correctly rolled back.")
