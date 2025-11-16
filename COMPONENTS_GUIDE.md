# 🎨 Рабочие компоненты - Руководство по использованию

Полное руководство по всем рабочим UI компонентам AI платформы.

## 📦 Установка зависимостей

```bash
cd frontend
npm install
```

Все необходимые пакеты уже добавлены в `package.json`:
- `@monaco-editor/react` - Code Editor
- `reactflow` - Workflow Canvas
- `xterm` + `xterm-addon-fit` - Terminal
- `split-pane-react` - Resizable panels
- `next-themes` - Theme управление
- `sonner` - Toast notifications
- `axios` - HTTP client

## 🔧 API Client

### Использование

```typescript
import { apiClient } from '@/lib/api-client';

// Аутентификация
await apiClient.login('username', 'password');
await apiClient.register('email', 'username', 'password');

// Проекты
const projects = await apiClient.getProjects();
const project = await apiClient.createProject({ name: 'My Project', type: 'workflow' });

// Workflows
const workflows = await apiClient.getWorkflows();
await apiClient.executeWorkflow('workflow-id', { input: 'data' });

// DUO IDE
const files = await apiClient.getProjectFiles('project-id');
await apiClient.aiAssist({ action: 'refactor', code: 'code here', language: 'typescript' });

// DARI Builder
await apiClient.generateApp({
  description: 'E-commerce app',
  features: ['auth', 'cart'],
  framework: 'react',
  backend: 'fastapi'
});
```

### Все доступные методы

**Auth:**
- `login(username, password)`
- `register(email, username, password)`
- `getCurrentUser()`

**Projects:**
- `getProjects(params?)`
- `createProject(data)`
- `getProject(id)`
- `updateProject(id, data)`
- `deleteProject(id)`

**Workflows:**
- `getWorkflows(params?)`
- `createWorkflow(data)`
- `executeWorkflow(id, inputData, config)`
- `generateWorkflowFromPrompt(prompt)`

**DUO IDE:**
- `getProjectFiles(projectId)`
- `createFile(data)`
- `updateFile(id, content)`
- `aiAssist(data)`
- `deployProject(projectId, platform)`

**DARI Builder:**
- `generateApp(data)`
- `getGenerationStatus(id)`
- `validateCode(code, language)`
- `autoFix(code, errors, language)`
- `exportProject(generationId, format)`

## 🌐 WebSocket Client

### Подключение

```typescript
import { wsClient } from '@/lib/websocket';

// Установить user ID
wsClient.setUserId('user-123');

// Подключиться
wsClient.connect();

// Слушать события
wsClient.on('agent_start', (data) => {
  console.log('Agent started:', data);
});

wsClient.on('agent_complete', (data) => {
  console.log('Agent completed:', data);
});

wsClient.on('generation_progress', (data) => {
  console.log('Progress:', data.progress);
});

// Отключиться
wsClient.disconnect();
```

### События от backend:

- `connected` - Подключено
- `disconnected` - Отключено
- `agent_start` - Агент запущен
- `agent_complete` - Агент завершён
- `agent_error` - Ошибка агента
- `generation_progress` - Прогресс генерации
- `generation_complete` - Генерация завершена
- `generation_error` - Ошибка генерации

## 🎯 Workflow Canvas

### Использование

```typescript
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';

<WorkflowCanvas
  workflowId="workflow-123"
  onSave={(nodes, edges) => {
    // Сохранить workflow
  }}
  onExecute={(nodes, edges) => {
    // Выполнить workflow
  }}
/>
```

### Типы узлов

**AgentNode** - Узел агента
```typescript
{
  id: 'agent-1',
  type: 'agent',
  data: {
    label: 'Code Generator',
    agentType: 'code_generator',
    config: {
      framework: 'react',
      backend: 'fastapi'
    }
  }
}
```

**ConditionNode** - Условный узел
```typescript
{
  id: 'condition-1',
  type: 'condition',
  data: {
    label: 'Check Result',
    condition: 'result.status === "success"'
  }
}
```

**LoopNode** - Узел цикла
```typescript
{
  id: 'loop-1',
  type: 'loop',
  data: {
    label: 'For Each Item',
    loopType: 'for',
    items: ['item1', 'item2']
  }
}
```

**GroupNode** - Группа агентов
```typescript
{
  id: 'group-1',
  type: 'group',
  data: {
    label: 'Parallel Agents',
    mode: 'parallel',
    agents: [
      { type: 'analyzer', config: {} },
      { type: 'test_writer', config: {} }
    ]
  }
}
```

### Функции

- **Добавить узел**: Кнопки в toolbar (Agent, Condition, Loop, Group)
- **Соединить узлы**: Перетащите от source handle к target handle
- **Удалить**: Выберите узел/edge и нажмите Delete
- **Сохранить**: Кнопка Save или Ctrl+S
- **Выполнить**: Кнопка Execute
- **Экспорт**: Кнопка Export (JSON файл)

## 💻 Code Editor (Monaco)

### Использование

```typescript
import { CodeEditor } from '@/components/ide/CodeEditor';

<CodeEditor
  fileId="file-123"
  initialValue="const hello = 'world';"
  language="typescript"
  readOnly={false}
  onSave={(content) => {
    console.log('Saved:', content);
  }}
  onRun={(content) => {
    console.log('Running:', content);
  }}
/>
```

### AI Функции

**Explain** - Объяснение кода
```typescript
// Выделите код и нажмите "Explain"
// AI объяснит что делает код
```

**Refactor** - Рефакторинг
```typescript
// Выделите код и нажмите "Refactor"
// AI улучшит код
```

**Fix** - Исправление ошибок
```typescript
// Выделите код с ошибкой и нажмите "Fix"
// AI исправит ошибку
```

### Горячие клавиши

- `Ctrl+S` / `Cmd+S` - Сохранить
- `Ctrl+/` - Комментарий
- `Ctrl+D` - Дублировать строку
- `Alt+Up/Down` - Переместить строку
- `Ctrl+F` - Найти
- `Ctrl+H` - Заменить

### Поддерживаемые языки

- TypeScript/JavaScript
- Python
- JSON
- HTML/CSS
- Markdown
- И многие другие через Monaco Editor

## 🖥️ Terminal (xterm.js)

### Использование

```typescript
import { Terminal } from '@/components/ide/Terminal';

<Terminal
  onCommand={(command) => {
    console.log('Executed:', command);
    // Отправить команду на backend
  }}
/>
```

### Встроенные команды

- `help` - Показать помощь
- `clear` - Очистить терминал
- `echo <text>` - Вывести текст
- `date` - Показать дату
- `ls` - Список файлов (mock)

### Расширение команд

Вы можете добавить свои команды в `executeCommand` функцию:

```typescript
case 'custom':
  term.writeln('Custom command executed');
  break;
```

## 📄 Страницы

### 1. Dashboard (`/`)

```typescript
import { Dashboard } from '@/components/dashboard/Dashboard';

// Quick actions
// Statistics cards
// Recent projects
```

### 2. DARI Builder (`/dari-builder`)

```typescript
// AI-генерация fullstack приложений
// Настройка параметров (framework, backend, features)
// Live code preview
// Export в ZIP
```

**Использование:**
1. Опишите приложение
2. Добавьте features (Enter после каждой)
3. Выберите framework и backend
4. Нажмите "Generate App"
5. Просмотрите сгенерированный код
6. Export в ZIP

### 3. DUO IDE (`/duo-ide`)

```typescript
// Полноценная IDE
// File explorer + Code editor + Terminal
// Resizable panels
```

**Функции:**
- File Tree с навигацией
- Monaco Editor с AI помощником
- Terminal для команд
- Preview panel
- Resizable panels (можно изменять размеры)

### 4. Workflow Builder (`/workflows`)

```typescript
// Визуальный редактор workflow
// Drag & Drop узлов
// Соединение узлов
// Execution
```

**Функции:**
- Добавить узлы (Agent, Condition, Loop, Group)
- Соединить узлы линиями
- Сохранить workflow
- Выполнить workflow
- Export workflow в JSON

### 5. Projects (`/projects`)

```typescript
// Список проектов
// Поиск
// CRUD операции
```

## 🎨 UI Components

### Button

```typescript
import { Button } from '@/components/ui/button';

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Input

```typescript
import { Input } from '@/components/ui/input';

<Input placeholder="Enter text..." />
<Input type="password" />
```

### Card

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## 🔔 Notifications (Sonner)

```typescript
import { toast } from 'sonner';

// Success
toast.success('Saved successfully');

// Error
toast.error('Failed to save');

// Info
toast.info('Processing...');

// Loading
toast.loading('Loading...');

// Custom
toast('Custom message', {
  description: 'With description',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

## 🎯 Примеры использования

### Создание workflow

```typescript
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { apiClient } from '@/lib/api-client';

const MyWorkflowPage = () => {
  const handleSave = async (nodes, edges) => {
    await apiClient.createWorkflow({
      name: 'My Workflow',
      projectId: 'proj-123',
      definition: { nodes, edges }
    });
  };

  return <WorkflowCanvas onSave={handleSave} />;
};
```

### Редактирование кода с AI

```typescript
import { CodeEditor } from '@/components/ide/CodeEditor';

const MyEditor = () => {
  const handleSave = async (content) => {
    await apiClient.updateFile('file-123', content);
  };

  return (
    <CodeEditor
      initialValue="console.log('hello');"
      language="javascript"
      onSave={handleSave}
    />
  );
};
```

### Генерация приложения

```typescript
import { apiClient } from '@/lib/api-client';
import { wsClient } from '@/lib/websocket';

const generateApp = async () => {
  const response = await apiClient.generateApp({
    description: 'E-commerce app with cart and checkout',
    features: ['authentication', 'shopping cart', 'payment'],
    framework: 'react',
    backend: 'fastapi'
  });

  // Listen for progress
  wsClient.on('generation_progress', (data) => {
    console.log(`Progress: ${data.progress}%`);
  });

  wsClient.on('generation_complete', (data) => {
    console.log('Code:', data.result);
  });
};
```

## 🚀 Запуск

1. **Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:app --reload
```

2. **Frontend**:
```bash
cd frontend
npm install
npm run dev
```

3. **Или с Docker**:
```bash
docker-compose up -d
```

## 🔗 Интеграция компонентов

### Полная IDE страница

```typescript
import { CodeEditor } from '@/components/ide/CodeEditor';
import { Terminal } from '@/components/ide/Terminal';
import SplitPane from 'split-pane-react';

export default function IDEPage() {
  return (
    <SplitPane split="horizontal">
      <CodeEditor />
      <Terminal />
    </SplitPane>
  );
}
```

### Workflow с real-time обновлениями

```typescript
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { wsClient } from '@/lib/websocket';
import { useEffect } from 'react';

export default function WorkflowPage() {
  useEffect(() => {
    wsClient.connect();

    wsClient.on('agent_start', (data) => {
      toast.info(`Agent ${data.agent_type} started`);
    });

    return () => wsClient.disconnect();
  }, []);

  return <WorkflowCanvas />;
}
```

## 📚 Дополнительные ресурсы

- **React Flow Docs**: https://reactflow.dev/
- **Monaco Editor**: https://microsoft.github.io/monaco-editor/
- **xterm.js**: https://xtermjs.org/
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🎓 Советы

1. **WebSocket**: Всегда подключайтесь в `useEffect` и отключайтесь при unmount
2. **API**: Используйте React Query для кеширования
3. **Theme**: Используйте `useTheme` hook для dark/light mode
4. **Toast**: Всегда показывайте feedback пользователю
5. **Errors**: Используйте try-catch и показывайте ошибки через toast

---

**Все компоненты готовы к использованию!** 🚀
