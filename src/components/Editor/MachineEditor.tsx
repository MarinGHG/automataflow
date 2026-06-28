import React, { useState } from 'react';
import { Machine } from '../../machines/types';
import { MachineCanvas } from './MachineCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { SimulationPanel } from '../Simulation/SimulationPanel';
import { GrammarPanel } from '../Grammar/GrammarPanel';
import { clsx } from 'clsx';

interface Props {
  machine: Machine;
}

type BottomPanel = 'simulation' | 'grammar' | 'none';

export function MachineEditor({ machine }: Props) {
  const [activeStates, setActiveStates] = useState<Set<string>>(new Set());
  const [acceptStates, setAcceptStates] = useState<Set<string>>(new Set());
  const [rejectStates, setRejectStates] = useState<Set<string>>(new Set());
  const [bottomPanel, setBottomPanel] = useState<BottomPanel>('simulation');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-1 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Use toolbar (top-left of canvas) to switch modes · Click edge label to manage transitions
        </span>
        <div className="ml-auto flex gap-1">
          {(['simulation', 'grammar', 'none'] as const).map(panel => (
            <button
              key={panel}
              onClick={() => setBottomPanel(panel)}
              className={clsx(
                'px-2 py-1 rounded capitalize text-xs',
                bottomPanel === panel
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {panel === 'none' ? 'Hide Panel' : panel}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MachineCanvas
              machine={machine}
              activeStateIds={activeStates}
              acceptStateIds={acceptStates}
              rejectStateIds={rejectStates}
            />
          </div>
          {bottomPanel === 'simulation' && (
            <SimulationPanel
              machine={machine}
              onActiveStates={setActiveStates}
              onAcceptStates={setAcceptStates}
              onRejectStates={setRejectStates}
            />
          )}
          {bottomPanel === 'grammar' && (
            <div className="h-64 border-t border-gray-200 dark:border-gray-700">
              <GrammarPanel machine={machine} />
            </div>
          )}
        </div>

        <PropertiesPanel machine={machine} />
      </div>
    </div>
  );
}
