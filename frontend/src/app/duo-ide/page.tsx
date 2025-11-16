'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { Terminal } from '@/components/ide/Terminal';
import { Button } from '@/components/ui/button';
import { Folder, File, ChevronRight, ChevronDown, Plus, Save, Play } from 'lucide-react';
import { toast } from 'sonner';
import SplitPane from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

const mockFileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          {
            name: 'Button.tsx',
            type: 'file',
            content: `export function Button({ children, onClick }) {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n}`,
            language: 'typescript',
          },
        ],
      },
      {
        name: 'App.tsx',
        type: 'file',
        content: `import { Button } from './components/Button';\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n      <Button>Click me</Button>\n    </div>\n  );\n}\n\nexport default App;`,
        language: 'typescript',
      },
    ],
  },
  {
    name: 'package.json',
    type: 'file',
    content: `{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}`,
    language: 'json',
  },
];

function FileTree({ tree, onFileSelect }: { tree: FileNode[]; onFileSelect: (file: FileNode) => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['src']));

  const toggleExpand = (name: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpanded(newExpanded);
  };

  const renderNode = (node: FileNode, path: string = '') => {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expanded.has(fullPath);

    return (
      <div key={fullPath}>
        <div
          className="flex items-center space-x-2 px-2 py-1 hover:bg-accent cursor-pointer rounded"
          onClick={() => {
            if (node.type === 'folder') {
              toggleExpand(fullPath);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'folder' && (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Folder className="w-4 h-4 text-blue-500" />
            </>
          )}
          {node.type === 'file' && <File className="w-4 h-4 text-gray-500 ml-4" />}
          <span className="text-sm">{node.name}</span>
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map((child) => renderNode(child, fullPath))}
          </div>
        )}
      </div>
    );
  };

  return <div className="py-2">{tree.map((node) => renderNode(node))}</div>;
}

export default function DuoIDEPage() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [sizes, setSizes] = useState<(string | number)[]>(['20%', '50%', '30%']);
  const [verticalSizes, setVerticalSizes] = useState<(string | number)[]>(['70%', '30%']);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    toast.success(`Opened ${file.name}`);
  };

  const handleSave = (content: string) => {
    if (selectedFile) {
      toast.success(`Saved ${selectedFile.name}`);
    }
  };

  const handleRun = (content: string) => {
    toast.success('Running code...');
  };

  return (
    <MainLayout>
      <div className="h-full">
        <SplitPane
          split="vertical"
          sizes={sizes}
          onChange={setSizes}
        >
          {/* File Explorer */}
          <div className="h-full border-r bg-card overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Explorer</h3>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <FileTree tree={mockFileTree} onFileSelect={handleFileSelect} />
            </div>
          </div>

          {/* Editor + Terminal */}
          <SplitPane
            split="horizontal"
            sizes={verticalSizes}
            onChange={setVerticalSizes}
          >
            {/* Code Editor */}
            <div className="h-full">
              {selectedFile ? (
                <CodeEditor
                  initialValue={selectedFile.content || ''}
                  language={selectedFile.language || 'typescript'}
                  onSave={handleSave}
                  onRun={handleRun}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a file to start editing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal */}
            <div className="h-full border-t">
              <Terminal />
            </div>
          </SplitPane>

          {/* Preview/Output */}
          <div className="h-full border-l bg-card">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Preview</h3>
              <div className="border rounded-lg bg-background p-4 h-[calc(100%-4rem)]">
                <p className="text-muted-foreground text-sm">
                  Live preview will appear here
                </p>
              </div>
            </div>
          </div>
        </SplitPane>
      </div>
    </MainLayout>
  );
}
