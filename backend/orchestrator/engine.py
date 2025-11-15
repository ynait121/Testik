"""
AI Agent Orchestration Engine
Оркестрация AI агентов с поддержкой параллельного выполнения
"""

import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import anthropic
import openai
from loguru import logger
import json
from datetime import datetime

from orchestrator.agents import (
    BaseAgent,
    CodeGeneratorAgent,
    DebuggerAgent,
    TestWriterAgent,
    RefactorAgent,
    AnalyzerAgent,
    DeployerAgent,
)
from orchestrator.workflow_executor import WorkflowExecutor
from services.redis_service import get_redis
from api.websocket import connection_manager


class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AgentTask:
    """Задача для агента"""
    id: str
    agent_type: str
    input_data: Dict[str, Any]
    context: Dict[str, Any]
    priority: int = 0
    user_id: Optional[str] = None


class OrchestratorEngine:
    """
    Главный движок оркестрации агентов

    Возможности:
    - Параллельное выполнение агентов
    - Управление контекстом между агентами
    - Очереди задач с приоритетами
    - Real-time обновления через WebSocket
    - Мониторинг и логирование
    """

    def __init__(self):
        self.status = "initializing"
        self.agents: Dict[str, BaseAgent] = {}
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.task_queue = asyncio.Queue()
        self.executor = WorkflowExecutor(self)

        # AI Clients
        self.anthropic_client = None
        self.openai_client = None

        # Initialize agents
        self._init_agents()

    def _init_agents(self):
        """Инициализация агентов"""
        self.agents = {
            "code_generator": CodeGeneratorAgent(),
            "debugger": DebuggerAgent(),
            "test_writer": TestWriterAgent(),
            "refactor": RefactorAgent(),
            "analyzer": AnalyzerAgent(),
            "deployer": DeployerAgent(),
        }
        logger.info(f"Initialized {len(self.agents)} agents")

    async def start(self):
        """Запуск оркестратора"""
        try:
            # Initialize AI clients
            from api.config import get_settings
            settings = get_settings()

            self.anthropic_client = anthropic.AsyncAnthropic(
                api_key=settings.ANTHROPIC_API_KEY
            )
            self.openai_client = openai.AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY
            )

            # Start task processor
            asyncio.create_task(self._process_tasks())

            self.status = "running"
            logger.info("✅ Orchestrator started")

        except Exception as e:
            logger.error(f"Failed to start orchestrator: {e}")
            self.status = "failed"
            raise

    async def stop(self):
        """Остановка оркестратора"""
        self.status = "stopping"

        # Cancel all running tasks
        for task_id, task in self.running_tasks.items():
            task.cancel()
            logger.info(f"Cancelled task: {task_id}")

        # Wait for all tasks to complete
        if self.running_tasks:
            await asyncio.gather(*self.running_tasks.values(), return_exceptions=True)

        self.status = "stopped"
        logger.info("✅ Orchestrator stopped")

    async def execute_agent(
        self,
        agent_type: str,
        input_data: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Выполнение одного агента

        Args:
            agent_type: Тип агента
            input_data: Входные данные
            context: Контекст выполнения
            user_id: ID пользователя для WebSocket обновлений

        Returns:
            Результат выполнения агента
        """
        if agent_type not in self.agents:
            raise ValueError(f"Unknown agent type: {agent_type}")

        agent = self.agents[agent_type]
        task_id = f"{agent_type}_{datetime.utcnow().timestamp()}"

        try:
            # Send start notification
            await self._send_update(user_id, {
                "type": "agent_start",
                "task_id": task_id,
                "agent_type": agent_type,
            })

            # Execute agent
            result = await agent.execute(
                input_data=input_data,
                context=context or {},
                orchestrator=self,
            )

            # Send completion notification
            await self._send_update(user_id, {
                "type": "agent_complete",
                "task_id": task_id,
                "agent_type": agent_type,
                "result": result,
            })

            return result

        except Exception as e:
            logger.error(f"Agent {agent_type} failed: {e}")

            await self._send_update(user_id, {
                "type": "agent_error",
                "task_id": task_id,
                "agent_type": agent_type,
                "error": str(e),
            })

            raise

    async def execute_parallel(
        self,
        tasks: List[AgentTask],
    ) -> List[Dict[str, Any]]:
        """
        Параллельное выполнение нескольких агентов

        Args:
            tasks: Список задач для выполнения

        Returns:
            Список результатов
        """
        logger.info(f"Executing {len(tasks)} tasks in parallel")

        # Create tasks
        async_tasks = [
            self.execute_agent(
                agent_type=task.agent_type,
                input_data=task.input_data,
                context=task.context,
                user_id=task.user_id,
            )
            for task in tasks
        ]

        # Execute in parallel
        results = await asyncio.gather(*async_tasks, return_exceptions=True)

        # Process results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Task {tasks[i].id} failed: {result}")
                processed_results.append({
                    "status": "failed",
                    "error": str(result),
                })
            else:
                processed_results.append({
                    "status": "success",
                    "data": result,
                })

        return processed_results

    async def execute_workflow(
        self,
        workflow_definition: Dict[str, Any],
        input_data: Dict[str, Any],
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Выполнение workflow с графом агентов

        Args:
            workflow_definition: Определение workflow
            input_data: Входные данные
            user_id: ID пользователя

        Returns:
            Результат выполнения workflow
        """
        return await self.executor.execute(
            workflow_definition=workflow_definition,
            input_data=input_data,
            user_id=user_id,
        )

    async def call_claude(
        self,
        prompt: str,
        model: str = "claude-sonnet-4-5-20250929",
        max_tokens: int = 4096,
        temperature: float = 0.7,
        system: Optional[str] = None,
    ) -> str:
        """Вызов Claude API"""
        try:
            messages = [{"role": "user", "content": prompt}]

            kwargs = {
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": messages,
            }

            if system:
                kwargs["system"] = system

            response = await self.anthropic_client.messages.create(**kwargs)

            return response.content[0].text

        except Exception as e:
            logger.error(f"Claude API error: {e}")
            raise

    async def call_openai(
        self,
        prompt: str,
        model: str = "gpt-4-turbo-preview",
        max_tokens: int = 4096,
        temperature: float = 0.7,
        system: Optional[str] = None,
    ) -> str:
        """Вызов OpenAI API"""
        try:
            messages = []

            if system:
                messages.append({"role": "system", "content": system})

            messages.append({"role": "user", "content": prompt})

            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    async def _process_tasks(self):
        """Background task processor"""
        while self.status == "running":
            try:
                # Get task from queue
                task = await asyncio.wait_for(self.task_queue.get(), timeout=1.0)

                # Execute task
                asyncio.create_task(self._execute_queued_task(task))

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Task processor error: {e}")

    async def _execute_queued_task(self, task: AgentTask):
        """Execute a queued task"""
        try:
            result = await self.execute_agent(
                agent_type=task.agent_type,
                input_data=task.input_data,
                context=task.context,
                user_id=task.user_id,
            )

            # Store result in Redis
            redis = await get_redis()
            await redis.setex(
                f"task_result:{task.id}",
                3600,  # 1 hour TTL
                json.dumps(result),
            )

        except Exception as e:
            logger.error(f"Queued task {task.id} failed: {e}")

    async def _send_update(self, user_id: Optional[str], data: Dict[str, Any]):
        """Send WebSocket update to user"""
        if user_id:
            await connection_manager.send_personal_message(
                json.dumps(data),
                user_id,
            )

    def add_custom_agent(self, name: str, agent: BaseAgent):
        """Добавление кастомного агента"""
        self.agents[name] = agent
        logger.info(f"Added custom agent: {name}")
