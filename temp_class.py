
from main import get_db
from models import Class
import uuid
db = next(get_db())
if not db.query(Class).first():
    db.add(Class(id=str(uuid.uuid4()), name="Test Class", section="A", division="Primary"))
    db.commit()
