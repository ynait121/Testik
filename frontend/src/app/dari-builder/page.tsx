'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Download, Play, Code, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { CodeEditor } from '@/components/ide/CodeEditor';

export default function DariBuilderPage() {
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [framework, setFramework] = useState('react');
  const [backend, setBackend] = useState('fastapi');
  const [generating, setGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setGenerating(true);

    try {
      const response = await apiClient.generateApp({
        description,
        features,
        framework,
        backend,
        database: 'postgresql',
        styling: 'tailwind',
        authentication: true,
        deployment: 'docker',
      });

      setGenerationId(response.data.generationId);
      toast.success('Generation started! Please wait...');

      // Poll for status (in a real app, use WebSocket)
      const checkStatus = setInterval(async () => {
        try {
          const statusResponse = await apiClient.getGenerationStatus(
            response.data.generationId
          );

          if (statusResponse.data.status === 'completed') {
            clearInterval(checkStatus);
            setGenerating(false);
            setGeneratedCode(statusResponse.data.result);
            toast.success('App generated successfully!');

            // Select first file
            if (statusResponse.data.result?.frontend) {
              const firstFile = Object.keys(statusResponse.data.result.frontend)[0];
              setSelectedFile(firstFile);
            }
          } else if (statusResponse.data.status === 'failed') {
            clearInterval(checkStatus);
            setGenerating(false);
            toast.error('Generation failed: ' + statusResponse.data.error);
          }
        } catch (error) {
          clearInterval(checkStatus);
          setGenerating(false);
          toast.error('Failed to check generation status');
        }
      }, 2000);

      // Stop after 2 minutes
      setTimeout(() => {
        clearInterval(checkStatus);
        if (generating) {
          setGenerating(false);
          toast.error('Generation timeout');
        }
      }, 120000);
    } catch (error) {
      setGenerating(false);
      toast.error('Failed to start generation');
    }
  };

  const handleExport = async () => {
    if (!generationId) return;

    try {
      const response = await apiClient.exportProject(generationId, 'zip');
      toast.success('Export started');

      // Download file
      const blob = await apiClient.downloadExport(response.data.downloadUrl);
      const url = window.URL.createObjectURL(blob.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-app-${generationId}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export project');
    }
  };

  const addFeature = (feature: string) => {
    if (feature && !features.includes(feature)) {
      setFeatures([...features, feature]);
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  return (
    <MainLayout>
      <div className="h-full flex">
        {/* Left Panel - Configuration */}
        <div className="w-96 border-r bg-card overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">DARI Builder</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered fullstack app generator
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">App Description</label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border bg-background"
                placeholder="Describe your application... (e.g., A task management app with user authentication, real-time updates, and drag-and-drop interface)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Features</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add feature..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addFeature((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Add feature..."]'
                    ) as HTMLInputElement;
                    if (input) {
                      addFeature(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{feature}</span>
                    <button onClick={() => removeFeature(feature)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Frontend Framework</label>
              <select
                className="w-full p-2 rounded-lg border bg-background"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
              >
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="svelte">Svelte</option>
              </select>
            </div>

            {/* Backend */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Backend Framework</label>
              <select
                className="w-full p-2 rounded-lg border bg-background"
                value={backend}
                onChange={(e) => setBackend(e.target.value)}
              >
                <option value="fastapi">FastAPI</option>
                <option value="express">Express</option>
                <option value="django">Django</option>
              </select>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate App
                </>
              )}
            </Button>

            {/* Export Button */}
            {generatedCode && (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleExport}
              >
                <Download className="w-5 h-5 mr-2" />
                Export as ZIP
              </Button>
            )}
          </div>
        </div>

        {/* Right Panel - Code Preview */}
        <div className="flex-1 flex flex-col">
          {generatedCode ? (
            <>
              {/* File Tabs */}
              <div className="flex items-center space-x-2 p-2 border-b bg-card overflow-x-auto">
                {generatedCode.frontend &&
                  Object.keys(generatedCode.frontend).map((file) => (
                    <button
                      key={file}
                      className={`px-4 py-2 text-sm rounded-t-lg whitespace-nowrap ${
                        selectedFile === file
                          ? 'bg-background border-t border-x'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      {file}
                    </button>
                  ))}
                {generatedCode.backend &&
                  Object.keys(generatedCode.backend).map((file) => (
                    <button
                      key={file}
                      className={`px-4 py-2 text-sm rounded-t-lg whitespace-nowrap ${
                        selectedFile === file
                          ? 'bg-background border-t border-x'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      {file}
                    </button>
                  ))}
              </div>

              {/* Code Editor */}
              <div className="flex-1">
                <CodeEditor
                  initialValue={
                    generatedCode.frontend?.[selectedFile] ||
                    generatedCode.backend?.[selectedFile] ||
                    ''
                  }
                  language={
                    selectedFile.endsWith('.tsx') || selectedFile.endsWith('.ts')
                      ? 'typescript'
                      : selectedFile.endsWith('.py')
                      ? 'python'
                      : 'javascript'
                  }
                  readOnly
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Code Generated Yet</h3>
                <p className="text-muted-foreground">
                  Describe your app and click "Generate" to start
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
