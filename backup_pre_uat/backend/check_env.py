import os
from dotenv import load_dotenv
from database import engine

load_dotenv()

print("--- ENVIRONMENT VARIABLES ---")
print("DATABASE_URL:", os.getenv('DATABASE_URL'))
print("REDIS_URL:", os.getenv('REDIS_URL'))
print("ENVIRONMENT:", os.getenv('ENV', 'Not Set'))

print("--- RUNTIME ENGINE ---")
print("Engine URL:", str(engine.url))
print("Engine Dialect:", engine.dialect.name)
