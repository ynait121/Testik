"""
Storage Service
MinIO для хранения файлов
"""

from minio import Minio
from api.config import get_settings
from loguru import logger
from typing import Optional
import io

minio_client: Optional[Minio] = None


async def init_storage():
    """Initialize MinIO storage"""
    global minio_client

    settings = get_settings()

    minio_client = Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,  # Set to True in production with HTTPS
    )

    # Create bucket if not exists
    try:
        if not minio_client.bucket_exists(settings.MINIO_BUCKET):
            minio_client.make_bucket(settings.MINIO_BUCKET)
            logger.info(f"Created bucket: {settings.MINIO_BUCKET}")
    except Exception as e:
        logger.warning(f"Could not create/check bucket: {e}")

    logger.info("✅ Storage service initialized")


def get_storage() -> Minio:
    """Get MinIO client"""
    return minio_client


async def upload_file(
    file_data: bytes,
    file_name: str,
    content_type: str = "application/octet-stream",
) -> str:
    """Upload file to MinIO"""
    settings = get_settings()

    file_stream = io.BytesIO(file_data)
    file_size = len(file_data)

    minio_client.put_object(
        settings.MINIO_BUCKET,
        file_name,
        file_stream,
        file_size,
        content_type=content_type,
    )

    # Return URL
    url = f"http://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/{file_name}"
    return url


async def download_file(file_name: str) -> bytes:
    """Download file from MinIO"""
    settings = get_settings()

    response = minio_client.get_object(
        settings.MINIO_BUCKET,
        file_name,
    )

    return response.read()


async def delete_file(file_name: str):
    """Delete file from MinIO"""
    settings = get_settings()

    minio_client.remove_object(
        settings.MINIO_BUCKET,
        file_name,
    )
