import os
from jose import jwt
SECRET_KEY = os.getenv('SECRET_KEY', 'default_if_none')
print(f'SECRET_KEY is: {SECRET_KEY}')
try:
    token = jwt.encode({'sub': 'test'}, SECRET_KEY, algorithm='HS256')
    print(f'ENCODED: {token}')
    decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    print(f'DECODED: {decoded}')
except Exception as e:
    print(f"ERROR: {e}")
