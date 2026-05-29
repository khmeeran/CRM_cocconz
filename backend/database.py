from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import redis

load_dotenv()

# PostgreSQL for Production
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/school_db")

engine = create_engine(
    DATABASE_URL, 
    pool_size=10, 
    max_overflow=20 
) if "postgresql" in DATABASE_URL else create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

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
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

