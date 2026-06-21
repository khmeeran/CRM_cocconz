import sys
import os
sys.path.append('E:/CRM_Cocoonz/backend')
from database import SessionLocal
import models
db = SessionLocal()
admin_user = db.query(models.User).filter(models.User.username == 'admin').first()
print('Admin Role:', admin_user.role if admin_user else 'NOT FOUND')
