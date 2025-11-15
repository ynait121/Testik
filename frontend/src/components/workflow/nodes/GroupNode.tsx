'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Layers } from 'lucide-react';

export const GroupNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 border-purple-500 bg-card min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center space-x-2">
        <Layers className="w-5 h-5 text-purple-500" />
        <div>
          <div className="font-bold text-sm">{data.label || 'Group'}</div>
          <div className="text-xs text-muted-foreground">
            {data.mode || 'parallel'} execution
          </div>
        </div>
      </div>

      {data.agents && (
        <div className="mt-2 text-xs text-muted-foreground">
          Agents: {data.agents.length}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';
