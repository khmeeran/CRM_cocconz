from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import redis

load_dotenv()

# PostgreSQL for Production
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL, 
    pool_size=10, 
    max_overflow=20 
) if DATABASE_URL and "postgresql" in DATABASE_URL else create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
) if DATABASE_URL else None

if "sqlite" in DATABASE_URL:
    # Enable WAL mode for local dev/testing
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
else:
    redis_client = None

