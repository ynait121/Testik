'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

export const ConditionNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 border-yellow-500 bg-card min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center space-x-2">
        <GitBranch className="w-5 h-5 text-yellow-500" />
        <div>
          <div className="font-bold text-sm">{data.label || 'Condition'}</div>
          <div className="text-xs text-muted-foreground">
            {data.condition || 'Set condition'}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3"
        style={{ left: '70%' }}
      />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
