import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { clsx } from 'clsx';

export interface StateNodeData {
  label: string;
  isStart: boolean;
  isFinal: boolean;
  isActive?: boolean;
  isAccept?: boolean;
  isReject?: boolean;
  editorMode?: string;
}

export const StateNode = memo(({ data, selected }: NodeProps<StateNodeData>) => {
  const isDeleteMode = data.editorMode === 'delete';

  return (
    <div className={clsx('relative flex items-center justify-center group', isDeleteMode && 'cursor-not-allowed')}>
      {data.isStart && (
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="28" height="20" viewBox="0 0 28 20">
            <polygon points="0,0 20,10 0,20" fill="currentColor" className="text-gray-500 dark:text-gray-400" />
          </svg>
        </div>
      )}

      <div
        className={clsx(
          'w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all select-none',
          {
            'border-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-900': selected && !isDeleteMode,
            'border-red-400 shadow-lg shadow-red-200 dark:shadow-red-900 ring-2 ring-red-300': isDeleteMode,
            'border-gray-400 dark:border-gray-500': !selected && !data.isActive && !isDeleteMode,
            'border-yellow-400 shadow-lg shadow-yellow-200 dark:shadow-yellow-900 bg-yellow-50 dark:bg-yellow-900/30': data.isActive && !data.isAccept && !data.isReject,
            'border-green-500 shadow-lg shadow-green-200 dark:shadow-green-900 bg-green-50 dark:bg-green-900/30': data.isAccept,
            'border-red-500 shadow-lg shadow-red-200 dark:shadow-red-900 bg-red-50 dark:bg-red-900/30': data.isReject,
            'bg-white dark:bg-gray-800': !data.isActive && !data.isAccept && !data.isReject && !isDeleteMode,
            'text-gray-800 dark:text-gray-200': !data.isAccept && !data.isReject,
          }
        )}
      >
        {data.isFinal && (
          <div className={clsx(
            'absolute inset-0 rounded-full border-2 m-1.5 pointer-events-none',
            {
              'border-gray-400 dark:border-gray-500': !selected && !data.isActive,
              'border-blue-400': selected && !isDeleteMode,
              'border-red-400': isDeleteMode || data.isReject,
              'border-yellow-400': data.isActive && !data.isAccept && !data.isReject,
              'border-green-400': data.isAccept,
            }
          )} />
        )}
        <span className="z-10 text-xs">{data.label}</span>
      </div>

      {/* Source handle - visible dot on hover when not in delete mode */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          background: '#3b82f6',
          border: '2px solid white',
          borderRadius: '50%',
          right: -5,
          opacity: isDeleteMode ? 0 : undefined,
          transition: 'opacity 0.15s',
        }}
        className="!opacity-0 group-hover:!opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: '#3b82f6',
          border: '2px solid white',
          borderRadius: '50%',
          left: -5,
          opacity: isDeleteMode ? 0 : undefined,
          transition: 'opacity 0.15s',
        }}
        className="!opacity-0 group-hover:!opacity-100"
      />
    </div>
  );
});

StateNode.displayName = 'StateNode';
