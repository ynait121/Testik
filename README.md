# 🚀 AI Platform - Полноценная платформа для создания AI-приложений

Мощная платформа для разработки AI-приложений с оркестрацией агентов, визуальным редактором workflow, полноценной IDE и автоматической генерацией fullstack приложений.

## ✨ Основные возможности

### 1. 📁 Управление проектами (Projects)
- Создание и управление AI workflow проектами
- Гибкие настройки (модель, температура, параллельные агенты)
- Индивидуальные API ключи на проект
- Поддержка различных типов проектов: workflow, bot, api, web_app, automation

### 2. 🤖 DUO IDE - Полноценная IDE для разработки
- **Code Editor** на базе Monaco Editor с подсветкой синтаксиса
- **AI Code Assistant** - автодополнение, рефакторинг, исправление ошибок
- **Встроенный терминал** для выполнения команд
- **Файловая система** с полным управлением файлами
- **Deploy функционал** для развертывания приложений

### 3. ⚡️ DARI Builder - AI-генератор приложений
- **100% AI-generated код** без шаблонов
- Генерация **8-12 сущностей, 50+ компонентов, 30+ страниц**
- **Live Preview** с hot reload
- **Auto-Fix ошибок** с помощью AI агента
- Экспорт в ZIP с полным кодом
- Автоматическая валидация кода

### 4. 🔄 Workflow Builder - Визуальный редактор
- **Drag & Drop интерфейс** для создания workflow
- Узлы: Agents, Groups, Conditions, Loops
- **Smart Run** с гибкой конфигурацией
- **AI-генерация workflow** из текстового промпта
- **Real-time логи выполнения**
- Экспорт артефактов и результатов

### 5. 🌐 n8n Workflow Integration
- Полная интеграция с n8n
- Создание workflow с AI помощником
- Custom Node Creator
- Экспорт в n8n формат
- Синхронизация с n8n instance

### 6. 📦 Система экспорта и деплоя
- Экспорт проектов в различных форматах (ZIP, Docker, K8s)
- **Deploy на различные платформы**:
  - Telegram боты
  - Веб-приложения
  - Docker containers
  - Kubernetes clusters
- История экспортированных проектов
- Управление развернутыми приложениями

### 7. 📚 Библиотека шаблонов
- Готовые шаблоны workflow
- Категории: bot, api, web_app, automation, data_processing
- Система рейтингов и популярности
- Быстрый старт с использованием шаблонов

### 8. 🔌 Система интеграций
- Подключение внешних сервисов
- Типы: API, Database, Messaging, Storage, AI
- Безопасное хранение credentials (encrypted)
- Встроенные интеграции (Core):
  - InvokeLLM
  - SendEmail
  - UploadFile
  - GenerateImage

### 9. 📊 Мониторинг активности
- История запусков workflow
- Статус и метрики выполнения
- Детальные логи
- Анализ использования токенов и стоимости

### 10. 👥 Административная панель
- Управление пользователями
- Изменение ролей (admin/user)
- Создание/удаление пользователей
- Системная статистика
- Audit logs

## 🏗️ Архитектура

### Backend (Python/FastAPI)
- **FastAPI** - современный веб-фреймворк
- **PostgreSQL** - основная база данных
- **Redis** - кеширование и очереди задач
- **MinIO** - объектное хранилище
- **ChromaDB** - векторная БД для embeddings
- **SQLAlchemy** + **Prisma** - ORM
- **Celery** - фоновые задачи
- **WebSockets** - real-time обновления

### Frontend (Next.js/React)
- **Next.js 14** - React framework
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **React Query** - управление состоянием сервера
- **Zustand** - глобальное состояние
- **Monaco Editor** - code editor
- **React Flow** - workflow canvas
- **Framer Motion** - анимации

### AI Orchestration
- **Anthropic Claude** (Sonnet 4.5) - основная модель
- **OpenAI GPT-4** - альтернативная модель
- **Custom Agents**:
  - CodeGeneratorAgent - генерация кода
  - DebuggerAgent - исправление ошибок
  - TestWriterAgent - написание тестов
  - RefactorAgent - рефакторинг
  - AnalyzerAgent - анализ кода
  - DeployerAgent - деплой конфигурации

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- API ключи (Anthropic и/или OpenAI)

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/ynait121/Testik.git
cd Testik
```

2. **Настройте environment variables**
```bash
cp .env.example .env
# Отредактируйте .env и добавьте ваши API ключи
```

3. **Запустите платформу**
```bash
docker-compose up -d
```

4. **Инициализируйте базу данных**
```bash
docker-compose exec backend python -m prisma migrate dev
```

5. **Откройте в браузере**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- n8n: http://localhost:5678
- MinIO Console: http://localhost:9001

### Разработка без Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📖 Использование

### Создание проекта
1. Перейдите в раздел "Projects"
2. Нажмите "New Project"
3. Выберите тип проекта (Workflow, Fullstack App, Bot, etc.)
4. Настройте параметры (модель, температура)

### Генерация fullstack приложения (DARI Builder)
1. Перейдите в "DARI Builder"
2. Опишите желаемое приложение
3. Выберите технологии (React, Vue, Svelte + FastAPI, Express, Django)
4. Нажмите "Generate"
5. Получите полный код и экспортируйте

### Создание Workflow
1. Перейдите в "Workflow Builder"
2. Добавьте агентов drag & drop
3. Соедините узлы
4. Настройте каждый узел
5. Запустите workflow

### Использование DUO IDE
1. Откройте проект в DUO IDE
2. Редактируйте код с AI подсказками
3. Используйте терминал для команд
4. Deploy приложение одной кнопкой

## 🔧 Конфигурация

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ai_platform
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
MINIO_ENDPOINT=localhost:9000
```

### Frontend (next.config.js)
```javascript
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 🤝 AI Agents

### CodeGeneratorAgent
Генерирует fullstack код из описания:
- Frontend (React/Vue/Svelte)
- Backend (FastAPI/Express/Django)
- Database schema
- Конфигурации

### DebuggerAgent
Автоматически находит и исправляет ошибки:
- Анализ stack trace
- Исправление кода
- Объяснение проблемы

### TestWriterAgent
Генерирует тесты:
- Unit tests
- Integration tests
- Edge cases

### RefactorAgent
Улучшает код:
- Читаемость
- Производительность
- Следование best practices

### AnalyzerAgent
Анализирует код на:
- Security vulnerabilities
- Performance issues
- Code quality

### DeployerAgent
Генерирует deployment конфигурации:
- Dockerfile
- docker-compose.yml
- Kubernetes manifests
- CI/CD pipelines

## 📊 API Endpoints

### Projects
- `GET /api/projects` - список проектов
- `POST /api/projects` - создать проект
- `GET /api/projects/{id}` - получить проект
- `PATCH /api/projects/{id}` - обновить проект
- `DELETE /api/projects/{id}` - удалить проект

### Workflows
- `GET /api/workflows` - список workflow
- `POST /api/workflows` - создать workflow
- `POST /api/workflows/{id}/execute` - запустить workflow
- `POST /api/workflows/generate-from-prompt` - генерация из промпта

### DARI Builder
- `POST /api/dari-builder/generate` - генерация приложения
- `GET /api/dari-builder/generations/{id}` - статус генерации
- `POST /api/dari-builder/auto-fix` - автоисправление ошибок
- `POST /api/dari-builder/export` - экспорт проекта

### DUO IDE
- `GET /api/duo-ide/projects/{id}/files` - файлы проекта
- `POST /api/duo-ide/files` - создать файл
- `POST /api/duo-ide/ai-assist` - AI помощник
- `POST /api/duo-ide/projects/{id}/deploy` - деплой

Полная документация API: http://localhost:8000/docs

## 🔐 Безопасность

- JWT authentication
- Encrypted credentials
- Role-based access control (RBAC)
- API rate limiting
- SQL injection protection
- XSS protection

## 🎯 Roadmap

- [ ] Поддержка больше AI моделей (Gemini, Llama)
- [ ] Collaborative editing
- [ ] Marketplace для шаблонов
- [ ] Mobile приложение
- [ ] VS Code extension
- [ ] Больше интеграций

## 📝 Лицензия

MIT License

## 🤝 Контрибьюция

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Поддержка

Если у вас возникли вопросы или проблемы, создайте Issue в GitHub.

---

**Создано с ❤️ для AI-разработчиков**