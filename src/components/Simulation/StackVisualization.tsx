import React from 'react';
import { PDAConfig } from '../../machines/types';

interface Props {
  config: PDAConfig;
}

export function StackVisualization({ config }: Props) {
  const branch = config.branches[0];
  if (!branch) return null;
  const stack = [...branch.stack].reverse();

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Stack (top↑) — Branch 1/{config.branches.length}
      </div>
      <div className="flex flex-col gap-0.5 max-h-32 overflow-y-auto">
        {stack.length === 0 ? (
          <div className="text-xs text-gray-400 italic">empty</div>
        ) : (
          stack.map((sym, i) => (
            <div
              key={i}
              className={`px-2 py-0.5 border text-sm font-mono text-center ${
                i === 0
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-800 dark:text-blue-200'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {sym}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
