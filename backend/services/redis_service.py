"""
Redis Service
Кеширование и очереди задач
"""

import redis.asyncio as redis
from api.config import get_settings
from loguru import logger
from typing import Optional

redis_client: Optional[redis.Redis] = None


async def init_redis():
    """Initialize Redis connection"""
    global redis_client

    settings = get_settings()

    redis_client = redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )

    # Test connection
    await redis_client.ping()

    logger.info("✅ Redis connection initialized")


async def close_redis():
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("✅ Redis connection closed")


async def get_redis() -> redis.Redis:
    """Get Redis client"""
    return redis_client
