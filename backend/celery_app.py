import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "crm_cocoonz",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True, # Durable tasks
    worker_prefetch_multiplier=1
)

@celery_app.task(name="tasks.send_broadcast", bind=True, max_retries=3)
def send_broadcast_task(self, phones, message, channels):
    import time
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Starting broadcast to {len(phones)} numbers via {channels}")
    
    try:
        # Simulate sending
        time.sleep(2)
        logger.info(f"Successfully broadcasted to {len(phones)} numbers.")
        return {"status": "success", "count": len(phones)}
    except Exception as exc:
        logger.error(f"Broadcast failed: {exc}")
        raise self.retry(exc=exc, countdown=5)
