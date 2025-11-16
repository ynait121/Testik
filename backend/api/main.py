"""
AI Platform API - Main FastAPI Application
Полноценная платформа для оркестрации AI агентов
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
from loguru import logger
import sys

from api.routes import (
    auth,
    projects,
    workflows,
    executions,
    templates,
    integrations,
    exports,
    admin,
    duo_ide,
    dari_builder,
    n8n_integration,
    activity,
)
from api.websocket import connection_manager
from orchestrator.engine import OrchestratorEngine
from services.database import init_db, close_db
from services.redis_service import init_redis, close_redis
from services.storage import init_storage

# Logging setup
logger.remove()
logger.add(sys.stderr, level="INFO")
logger.add("logs/app.log", rotation="500 MB", retention="10 days", level="DEBUG")

# Initialize orchestrator
orchestrator = OrchestratorEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management"""
    # Startup
    logger.info("🚀 Starting AI Platform...")
    await init_db()
    await init_redis()
    await init_storage()
    await orchestrator.start()
    logger.info("✅ AI Platform started successfully")

    yield

    # Shutdown
    logger.info("🛑 Shutting down AI Platform...")
    await orchestrator.stop()
    await close_redis()
    await close_db()
    logger.info("✅ AI Platform shut down successfully")


# Create FastAPI app
app = FastAPI(
    title="AI Platform API",
    description="Полноценная платформа для создания AI-приложений с оркестрацией агентов",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(executions.router, prefix="/api/executions", tags=["Executions"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(exports.router, prefix="/api/exports", tags=["Exports"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administration"])
app.include_router(duo_ide.router, prefix="/api/duo-ide", tags=["DUO IDE"])
app.include_router(dari_builder.router, prefix="/api/dari-builder", tags=["DARI Builder"])
app.include_router(n8n_integration.router, prefix="/api/n8n", tags=["n8n Integration"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])


# WebSocket endpoint for real-time updates
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket connection for real-time updates"""
    await connection_manager.connect(client_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            logger.debug(f"Received from {client_id}: {data}")
    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
        logger.info(f"Client {client_id} disconnected")


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "redis": "connected",
            "orchestrator": orchestrator.status,
        }
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
