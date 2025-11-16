'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { RotateCw } from 'lucide-react';

export const LoopNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 border-green-500 bg-card min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center space-x-2">
        <RotateCw className="w-5 h-5 text-green-500" />
        <div>
          <div className="font-bold text-sm">{data.label || 'Loop'}</div>
          <div className="text-xs text-muted-foreground">
            {data.loopType || 'for'} loop
          </div>
        </div>
      </div>

      {data.items && (
        <div className="mt-2 text-xs text-muted-foreground">
          Items: {Array.isArray(data.items) ? data.items.length : 'variable'}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

LoopNode.displayName = 'LoopNode';
