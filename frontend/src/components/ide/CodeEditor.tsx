'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Save, Play, Sparkles, Bug, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface CodeEditorProps {
  fileId?: string;
  initialValue?: string;
  language?: string;
  readOnly?: boolean;
  onSave?: (content: string) => void;
  onRun?: (content: string) => void;
}

export function CodeEditor({
  fileId,
  initialValue = '',
  language = 'typescript',
  readOnly = false,
  onSave,
  onRun,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const [value, setValue] = useState(initialValue);
  const [aiLoading, setAiLoading] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Setup keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // AI autocomplete
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: async (model, position) => {
        // Get current line
        const lineContent = model.getLineContent(position.lineNumber);
        const wordUntil = model.getWordUntilPosition(position);

        // You can call AI API here for smart completions
        return { suggestions: [] };
      },
    });
  };

  const handleSave = async () => {
    const content = editorRef.current?.getValue() || '';
    setValue(content);

    if (onSave) {
      onSave(content);
    }

    if (fileId) {
      try {
        await apiClient.updateFile(fileId, content);
        toast.success('File saved');
      } catch (error) {
        toast.error('Failed to save file');
      }
    }
  };

  const handleRun = () => {
    const content = editorRef.current?.getValue() || '';
    if (onRun) {
      onRun(content);
      toast.success('Running code...');
    }
  };

  const handleAiAssist = async (action: 'autocomplete' | 'refactor' | 'explain' | 'fix') => {
    const content = editorRef.current?.getValue() || '';
    const selection = editorRef.current?.getSelection();
    const selectedText = selection
      ? editorRef.current?.getModel()?.getValueInRange(selection)
      : content;

    setAiLoading(true);

    try {
      const response = await apiClient.aiAssist({
        action,
        code: selectedText || content,
        language,
        context: {},
      });

      if (action === 'fix' && response.data.fixed_code) {
        // Replace code with fixed version
        const model = editorRef.current?.getModel();
        if (model && selection) {
          editorRef.current?.executeEdits('ai-fix', [
            {
              range: selection,
              text: response.data.fixed_code,
            },
          ]);
        }
        toast.success('Code fixed!');
      } else if (action === 'refactor' && response.data.refactored_code) {
        const model = editorRef.current?.getModel();
        if (model && selection) {
          editorRef.current?.executeEdits('ai-refactor', [
            {
              range: selection,
              text: response.data.refactored_code,
            },
          ]);
        }
        toast.success('Code refactored!');
      } else if (action === 'explain') {
        toast.success('Explanation: ' + response.data.explanation);
      }
    } catch (error) {
      toast.error('AI assist failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-card">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAiAssist('explain')}
            disabled={aiLoading}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explain
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAiAssist('refactor')}
            disabled={aiLoading}
          >
            <FileCode className="w-4 h-4 mr-2" />
            Refactor
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAiAssist('fix')}
            disabled={aiLoading}
          >
            <Bug className="w-4 h-4 mr-2" />
            Fix
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {onRun && (
            <Button size="sm" variant="outline" onClick={handleRun}>
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={readOnly}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={value}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            suggest: {
              showWords: true,
              showSnippets: true,
            },
          }}
          onMount={handleEditorDidMount}
          onChange={(value) => setValue(value || '')}
        />
      </div>
    </div>
  );
}
