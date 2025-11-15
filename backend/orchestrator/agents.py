"""
AI Agents для оркестрации
Различные типы агентов для разных задач
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from loguru import logger
import json


class BaseAgent(ABC):
    """Базовый класс для всех агентов"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    async def execute(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        orchestrator: Any,
    ) -> Dict[str, Any]:
        """Выполнение агента"""
        pass

    async def call_llm(
        self,
        orchestrator: Any,
        prompt: str,
        model: str = "claude-sonnet-4-5-20250929",
        system: Optional[str] = None,
    ) -> str:
        """Вызов LLM через оркестратор"""
        return await orchestrator.call_claude(
            prompt=prompt,
            model=model,
            system=system,
        )


class CodeGeneratorAgent(BaseAgent):
    """
    Агент для генерации кода
    Генерирует fullstack приложения, компоненты, API endpoints
    """

    def __init__(self):
        super().__init__(
            name="CodeGenerator",
            description="Generates fullstack code from natural language descriptions",
        )

    async def execute(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        orchestrator: Any,
    ) -> Dict[str, Any]:
        """
        Генерация кода

        Input:
            - description: описание того, что нужно создать
            - framework: фреймворк (react, vue, svelte, etc.)
            - backend: backend framework (fastapi, express, django, etc.)
            - features: список фич

        Output:
            - frontend_code: Dict[filename, code]
            - backend_code: Dict[filename, code]
            - dependencies: List[str]
        """
        description = input_data.get("description", "")
        framework = input_data.get("framework", "react")
        backend = input_data.get("backend", "fastapi")
        features = input_data.get("features", [])

        logger.info(f"Generating code for: {description}")

        # Build prompt
        prompt = f"""You are an expert fullstack developer. Generate a complete, production-ready application based on this description:

Description: {description}
Frontend Framework: {framework}
Backend Framework: {backend}
Features: {', '.join(features)}

Generate:
1. Complete frontend code (components, pages, hooks, services)
2. Complete backend code (API, models, services)
3. Database schema
4. Configuration files
5. Dependencies list

Return the code as a JSON object with this structure:
{{
    "frontend": {{
        "filename": "code content"
    }},
    "backend": {{
        "filename": "code content"
    }},
    "database": "schema",
    "config": {{
        "filename": "config content"
    }},
    "dependencies": {{
        "frontend": ["package1", "package2"],
        "backend": ["package1", "package2"]
    }}
}}

Make sure:
- Code is production-ready and follows best practices
- Include error handling and validation
- Add comments where necessary
- Use TypeScript for frontend if React/Vue/Svelte
- Include tests
- Add proper authentication if needed
- Make it responsive and beautiful
"""

        # Call LLM
        response = await self.call_llm(
            orchestrator=orchestrator,
            prompt=prompt,
            model="claude-sonnet-4-5-20250929",
            system="You are an expert fullstack developer. Always return valid JSON.",
        )

        # Parse response
        try:
            # Extract JSON from response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            json_str = response[json_start:json_end]
            result = json.loads(json_str)

            logger.info(f"Generated {len(result.get('frontend', {}))} frontend files")
            logger.info(f"Generated {len(result.get('backend', {}))} backend files")

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            return {
                "frontend": {},
                "backend": {},
                "error": "Failed to generate code",
            }


class DebuggerAgent(BaseAgent):
    """
    Агент для отладки кода
    Находит и исправляет ошибки
    """

    def __init__(self):
        super().__init__(
            name="Debugger",
            description="Debugs code and fixes errors automatically",
        )

    async def execute(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        orchestrator: Any,
    ) -> Dict[str, Any]:
        """
        Отладка кода

        Input:
            - code: код с ошибкой
            - error: сообщение об ошибке
            - language: язык программирования

        Output:
            - fixed_code: исправленный код
            - explanation: объяснение исправления
        """
        code = input_data.get("code", "")
        error = input_data.get("error", "")
        language = input_data.get("language", "python")

        logger.info(f"Debugging {language} code")

        prompt = f"""You are an expert debugger. Fix this code:

Language: {language}

Code:
```{language}
{code}
```

Error:
{error}

Analyze the error, find the root cause, and provide:
1. Fixed code
2. Explanation of what was wrong
3. Best practices to avoid this error in the future

Return as JSON:
{{
    "fixed_code": "corrected code here",
    "explanation": "explanation of the fix",
    "best_practices": ["practice 1", "practice 2"]
}}
"""

        response = await self.call_llm(
            orchestrator=orchestrator,
            prompt=prompt,
            system="You are an expert debugger. Always return valid JSON.",
        )

        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            json_str = response[json_start:json_end]
            result = json.loads(json_str)
            return result
        except:
            return {"fixed_code": code, "explanation": "Could not fix automatically"}


class TestWriterAgent(BaseAgent):
    """
    Агент для написания тестов
    Генерирует unit и integration тесты
    """

    def __init__(self):
        super().__init__(
            name="TestWriter",
            description="Writes comprehensive tests for code",
        )

    async def execute(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        orchestrator: Any,
    ) -> Dict[str, Any]:
        """
        Написание тестов

        Input:
            - code: код для тестирования
            - language: язык
            - test_framework: фреймворк для тестов

        Output:
            - test_code: код тестов
            - coverage: покрытие тестами
        """
        code = input_data.get("code", "")
        language = input_data.get("language", "python")
        framework = input_data.get("test_framework", "pytest")

        prompt = f"""Write comprehensive tests for this code:

Language: {language}
Test Framework: {framework}

Code to test:
```{language}
{code}
```

Generate:
1. Unit tests for all functions
2. Integration tests
3. Edge cases
4. Error handling tests

Return as JSON:
{{
    "test_files": {{
        "filename": "test code"
    }},
    "coverage_estimate": "percentage"
}}
"""

        response = await self.call_llm(orchestrator, prompt)

        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            result = json.loads(response[json_start:json_end])
            return result
        except:
            return {"test_files": {}, "coverage_estimate": "0%"}


class RefactorAgent(BaseAgent):
    """
    Агент для рефакторинга кода
    Улучшает качество и читаемость кода
    """

    def __init__(self):
        super().__init__(
            name="Refactor",
            description="Refactors code for better quality and maintainability",
        )

    async def execute(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        orchestrator: Any,
    ) -> Dict[str, Any]:
        """Рефакторинг кода"""
        code = input_data.get("code", "")
        language = input_data.get("language", "python")
        goals = input_data.get("goals", ["readability", "performance"])

        prompt = f"""Refactor this code focusing on: {', '.join(goals)}

Language: {language}

Original code:
```{language}
{code}
```

Provide:
1. Refactored code
2. List of improvements made
3. Performance impact analysis

Return as JSON:
{{
    "refactored_code": "improved code",
    "improvements": ["improvement 1", "improvement 2"],
    "performance_impact": "description"
}}
"""

        response = await self.call_llm(orchestrator, prompt)

        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            result = json.loads(response[json_start:json_end])
            return result
        except:
            return {"refactored_code": code, "improvements": []}


class AnalyzerAgent(BaseAgent):
    """
    Агент для анализа кода
    Проверяет качество, безопасность, производительность
    """

    def __init__(self):
        super().__init__(
            name="Analyzer",
            description="Analyzes code for quality, security, and performance issues",
        )

    async def execute(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        orchestrator: Any,
    ) -> Dict[str, Any]:
        """Анализ кода"""
        code = input_data.get("code", "")
        language = input_data.get("language", "python")
        focus = input_data.get("focus", ["security", "performance", "quality"])

        prompt = f"""Analyze this code for: {', '.join(focus)}

Language: {language}

Code:
```{language}
{code}
```

Provide detailed analysis:
1. Security vulnerabilities
2. Performance issues
3. Code quality issues
4. Best practices violations
5. Recommendations

Return as JSON:
{{
    "security": [{{"severity": "high/medium/low", "issue": "description", "fix": "recommendation"}}],
    "performance": [{{"issue": "description", "impact": "description", "fix": "recommendation"}}],
    "quality": [{{"issue": "description", "fix": "recommendation"}}],
    "score": "overall score 0-100"
}}
"""

        response = await self.call_llm(orchestrator, prompt)

        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            result = json.loads(response[json_start:json_end])
            return result
        except:
            return {"security": [], "performance": [], "quality": [], "score": "N/A"}


class DeployerAgent(BaseAgent):
    """
    Агент для деплоя приложений
    Генерирует конфигурации для различных платформ
    """

    def __init__(self):
        super().__init__(
            name="Deployer",
            description="Generates deployment configurations and deploys applications",
        )

    async def execute(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        orchestrator: Any,
    ) -> Dict[str, Any]:
        """Генерация конфигураций для деплоя"""
        platform = input_data.get("platform", "docker")  # docker, k8s, vercel, etc.
        project_type = input_data.get("project_type", "web")
        env_vars = input_data.get("env_vars", {})

        prompt = f"""Generate deployment configuration for:

Platform: {platform}
Project Type: {project_type}
Environment Variables: {json.dumps(env_vars)}

Generate complete deployment configuration including:
1. Dockerfile (if applicable)
2. docker-compose.yml (if applicable)
3. Kubernetes manifests (if applicable)
4. CI/CD pipeline configuration
5. Environment setup instructions

Return as JSON:
{{
    "files": {{
        "filename": "content"
    }},
    "instructions": ["step 1", "step 2"],
    "estimated_cost": "cost estimate"
}}
"""

        response = await self.call_llm(orchestrator, prompt)

        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            result = json.loads(response[json_start:json_end])
            return result
        except:
            return {"files": {}, "instructions": [], "estimated_cost": "N/A"}
