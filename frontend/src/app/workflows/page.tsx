'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { Node, Edge } from 'reactflow';

export default function WorkflowsPage() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    try {
      const workflowData = {
        name: 'My Workflow',
        description: 'AI Agent Workflow',
        projectId: 'proj_123', // Replace with actual project ID
        definition: {
          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
          })),
          edges: edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            condition: edge.data?.condition,
          })),
          variables: {},
        },
      };

      if (currentWorkflowId) {
        await apiClient.updateWorkflow(currentWorkflowId, workflowData);
      } else {
        const response = await apiClient.createWorkflow(workflowData);
        setCurrentWorkflowId(response.data.id);
      }

      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };

  const handleExecute = async (nodes: Node[], edges: Edge[]) => {
    if (!currentWorkflowId) {
      toast.error('Please save workflow first');
      return;
    }

    try {
      const response = await apiClient.executeWorkflow(currentWorkflowId, {}, {});
      toast.success(`Workflow execution started: ${response.data.executionId}`);
    } catch (error) {
      toast.error('Failed to execute workflow');
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-card flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workflow Builder</h1>
            <p className="text-muted-foreground text-sm">
              Create AI agent workflows with drag & drop
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <div className="flex-1">
          <WorkflowCanvas
            workflowId={currentWorkflowId || undefined}
            onSave={handleSave}
            onExecute={handleExecute}
          />
        </div>
      </div>
    </MainLayout>
  );
}
