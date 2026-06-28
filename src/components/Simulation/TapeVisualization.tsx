import React from 'react';
import { TMConfig } from '../../machines/types';

interface Props {
  config: TMConfig;
  blankSymbol: string;
}

export function TapeVisualization({ config, blankSymbol }: Props) {
  const { tape, head } = config;

  const keys = [...tape.keys()];
  const minKey = Math.min(head - 6, ...(keys.length > 0 ? keys : [0]), 0);
  const maxKey = Math.max(head + 6, ...(keys.length > 0 ? keys : [10]), 10);

  const cells = [];
  for (let i = minKey; i <= maxKey; i++) {
    cells.push({ pos: i, symbol: tape.get(i) ?? blankSymbol });
  }

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Tape</div>
      <div className="flex overflow-x-auto gap-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {cells.map(({ pos, symbol }) => (
          <div
            key={pos}
            className={`flex-shrink-0 w-9 h-9 border-r border-gray-200 dark:border-gray-700 last:border-r-0 flex items-center justify-center text-sm font-mono font-medium transition-all ${
              pos === head
                ? 'bg-blue-500 text-white font-bold shadow-inner'
                : symbol === blankSymbol
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {symbol}
          </div>
        ))}
      </div>
      <div className="flex gap-0">
        {cells.map(({ pos }) => (
          <div key={pos} className="flex-shrink-0 w-9 text-center text-xs text-blue-400 font-bold">
            {pos === head ? '▲' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
