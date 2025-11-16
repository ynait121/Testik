import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.client.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }

    return response.data;
  }

  async register(email: string, username: string, password: string) {
    return this.client.post('/api/auth/register', { email, username, password });
  }

  async getCurrentUser() {
    return this.client.get('/api/auth/me');
  }

  // Projects
  async getProjects(params?: { skip?: number; limit?: number; status?: string }) {
    return this.client.get('/api/projects', { params });
  }

  async createProject(data: any) {
    return this.client.post('/api/projects', data);
  }

  async getProject(id: string) {
    return this.client.get(`/api/projects/${id}`);
  }

  async updateProject(id: string, data: any) {
    return this.client.patch(`/api/projects/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.client.delete(`/api/projects/${id}`);
  }

  // Workflows
  async getWorkflows(params?: { projectId?: string; status?: string }) {
    return this.client.get('/api/workflows', { params });
  }

  async createWorkflow(data: any) {
    return this.client.post('/api/workflows', data);
  }

  async getWorkflow(id: string) {
    return this.client.get(`/api/workflows/${id}`);
  }

  async updateWorkflow(id: string, data: any) {
    return this.client.patch(`/api/workflows/${id}`, data);
  }

  async deleteWorkflow(id: string) {
    return this.client.delete(`/api/workflows/${id}`);
  }

  async executeWorkflow(id: string, inputData: any = {}, config: any = {}) {
    return this.client.post(`/api/workflows/${id}/execute`, { inputData, config });
  }

  async generateWorkflowFromPrompt(prompt: string) {
    return this.client.post('/api/workflows/generate-from-prompt', null, { params: { prompt } });
  }

  // Executions
  async getExecutions(params?: { workflowId?: string; status?: string; limit?: number }) {
    return this.client.get('/api/executions', { params });
  }

  async getExecution(id: string) {
    return this.client.get(`/api/executions/${id}`);
  }

  async getExecutionSteps(id: string) {
    return this.client.get(`/api/executions/${id}/steps`);
  }

  async cancelExecution(id: string) {
    return this.client.post(`/api/executions/${id}/cancel`);
  }

  // DUO IDE
  async getProjectFiles(projectId: string) {
    return this.client.get(`/api/duo-ide/projects/${projectId}/files`);
  }

  async createFile(data: { projectId: string; path: string; content: string; language?: string }) {
    return this.client.post('/api/duo-ide/files', data);
  }

  async getFile(id: string) {
    return this.client.get(`/api/duo-ide/files/${id}`);
  }

  async updateFile(id: string, content: string) {
    return this.client.patch(`/api/duo-ide/files/${id}`, { content });
  }

  async deleteFile(id: string) {
    return this.client.delete(`/api/duo-ide/files/${id}`);
  }

  async aiAssist(data: { action: string; code: string; language: string; context?: any }) {
    return this.client.post('/api/duo-ide/ai-assist', data);
  }

  async deployProject(projectId: string, platform: string = 'docker') {
    return this.client.post(`/api/duo-ide/projects/${projectId}/deploy`, null, {
      params: { platform },
    });
  }

  // DARI Builder
  async generateApp(data: {
    description: string;
    features: string[];
    framework?: string;
    backend?: string;
    database?: string;
    styling?: string;
    authentication?: boolean;
    deployment?: string;
  }) {
    return this.client.post('/api/dari-builder/generate', data);
  }

  async getGenerationStatus(id: string) {
    return this.client.get(`/api/dari-builder/generations/${id}`);
  }

  async validateCode(code: Record<string, string>, language: string) {
    return this.client.post('/api/dari-builder/validate', { code, language });
  }

  async autoFix(code: string, errors: string[], language: string) {
    return this.client.post('/api/dari-builder/auto-fix', { code, errors, language });
  }

  async exportProject(generationId: string, format: string = 'zip') {
    return this.client.post('/api/dari-builder/export', null, {
      params: { generation_id: generationId, format },
    });
  }

  // Templates
  async getTemplates(params?: { category?: string; search?: string }) {
    return this.client.get('/api/templates', { params });
  }

  async getTemplate(id: string) {
    return this.client.get(`/api/templates/${id}`);
  }

  async useTemplate(id: string, projectId: string) {
    return this.client.post(`/api/templates/${id}/use`, null, { params: { projectId } });
  }

  // Integrations
  async getIntegrations(type?: string) {
    return this.client.get('/api/integrations', { params: { type } });
  }

  async createIntegration(data: any) {
    return this.client.post('/api/integrations', data);
  }

  async getIntegration(id: string) {
    return this.client.get(`/api/integrations/${id}`);
  }

  async deleteIntegration(id: string) {
    return this.client.delete(`/api/integrations/${id}`);
  }

  async testIntegration(id: string) {
    return this.client.post(`/api/integrations/${id}/test`);
  }

  // Exports
  async getExports(projectId?: string) {
    return this.client.get('/api/exports', { params: { projectId } });
  }

  async createExport(data: { projectId: string; format: string; config?: any }) {
    return this.client.post('/api/exports', data);
  }

  async getExport(id: string) {
    return this.client.get(`/api/exports/${id}`);
  }

  async downloadExport(id: string) {
    return this.client.get(`/api/exports/${id}/download`, { responseType: 'blob' });
  }

  async deployExport(id: string, platform: string) {
    return this.client.post(`/api/exports/${id}/deploy`, null, { params: { platform } });
  }

  // n8n Integration
  async getN8nWorkflows() {
    return this.client.get('/api/n8n/workflows');
  }

  async createN8nWorkflow(data: any) {
    return this.client.post('/api/n8n/workflows', data);
  }

  async executeN8nWorkflow(id: string, inputData: any) {
    return this.client.post(`/api/n8n/workflows/${id}/execute`, inputData);
  }

  async generateN8nWorkflow(prompt: string) {
    return this.client.post('/api/n8n/ai-generate', null, { params: { prompt } });
  }

  // Activity
  async getActivity(params?: { entityType?: string; entityId?: string; limit?: number }) {
    return this.client.get('/api/activity', { params });
  }

  async getActivityStats() {
    return this.client.get('/api/activity/stats');
  }

  // Admin
  async getUsers(params?: { skip?: number; limit?: number; role?: string }) {
    return this.client.get('/api/admin/users', { params });
  }

  async createUser(data: any) {
    return this.client.post('/api/admin/users', data);
  }

  async updateUser(id: string, data: { role?: string; isActive?: boolean }) {
    return this.client.patch(`/api/admin/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.client.delete(`/api/admin/users/${id}`);
  }

  async getSystemStats() {
    return this.client.get('/api/admin/stats');
  }

  async getSystemLogs(params?: { level?: string; limit?: number }) {
    return this.client.get('/api/admin/logs', { params });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
