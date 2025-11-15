'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from './nodes/AgentNode';
import { ConditionNode } from './nodes/ConditionNode';
import { LoopNode } from './nodes/LoopNode';
import { GroupNode } from './nodes/GroupNode';
import { Button } from '@/components/ui/button';
import { Play, Save, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  condition: ConditionNode,
  loop: LoopNode,
  group: GroupNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface WorkflowCanvasProps {
  workflowId?: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onExecute?: (nodes: Node[], edges: Edge[]) => void;
}

export function WorkflowCanvas({ workflowId, onSave, onExecute }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('agent');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        config: {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
    toast.success(`Added ${type} node`);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
      toast.success('Workflow saved');
    }
  };

  const handleExecute = () => {
    if (nodes.length === 0) {
      toast.error('Add nodes to execute workflow');
      return;
    }

    if (onExecute) {
      onExecute(nodes, edges);
      toast.success('Workflow execution started');
    }
  };

  const handleExport = () => {
    const workflowData = {
      nodes,
      edges,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
      },
    };

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflowId || 'new'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Workflow exported');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => addNode('agent')}>
            <Plus className="w-4 h-4 mr-2" />
            Agent
          </Button>
          <Button size="sm" variant="outline" onClick={() => addNode('condition')}>
            <Plus className="w-4 h-4 mr-2" />
            Condition
          </Button>
          <Button size="sm" variant="outline" onClick={() => addNode('loop')}>
            <Plus className="w-4 h-4 mr-2" />
            Loop
          </Button>
          <Button size="sm" variant="outline" onClick={() => addNode('group')}>
            <Plus className="w-4 h-4 mr-2" />
            Group
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={handleExecute}>
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Info Panel */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Nodes: {nodes.length} | Edges: {edges.length}
          </div>
          <div>Drag nodes to position, connect them, and click Execute</div>
        </div>
      </div>
    </div>
  );
}
