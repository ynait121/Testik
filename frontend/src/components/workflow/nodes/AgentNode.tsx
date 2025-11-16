'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot } from 'lucide-react';

export const AgentNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 border-primary bg-card min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center space-x-2">
        <Bot className="w-5 h-5 text-primary" />
        <div>
          <div className="font-bold text-sm">{data.label || 'Agent'}</div>
          <div className="text-xs text-muted-foreground">
            {data.agentType || 'Select agent type'}
          </div>
        </div>
      </div>

      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground">Config:</div>
          <div className="bg-muted/50 rounded p-1 mt-1 max-h-20 overflow-auto">
            {JSON.stringify(data.config, null, 2)}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
