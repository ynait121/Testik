"""
WebSocket Connection Manager
Real-time обновления для клиентов
"""

from typing import Dict
from fastapi import WebSocket
from loguru import logger
import json


class ConnectionManager:
    """Управление WebSocket соединениями"""

    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        """Подключение клиента"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total: {len(self.active_connections)}")

    def disconnect(self, client_id: str):
        """Отключение клиента"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected. Total: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, client_id: str):
        """Отправка сообщения конкретному клиенту"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message to {client_id}: {e}")
                self.disconnect(client_id)

    async def send_personal_json(self, data: dict, client_id: str):
        """Отправка JSON конкретному клиенту"""
        await self.send_personal_message(json.dumps(data), client_id)

    async def broadcast(self, message: str):
        """Рассылка всем подключенным клиентам"""
        disconnected = []
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to broadcast to {client_id}: {e}")
                disconnected.append(client_id)

        # Remove disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)

    async def broadcast_json(self, data: dict):
        """Рассылка JSON всем"""
        await self.broadcast(json.dumps(data))


# Global connection manager
connection_manager = ConnectionManager()
