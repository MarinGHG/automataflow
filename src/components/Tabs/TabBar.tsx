import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useMachineStore } from '../../store/machineStore';
import { clsx } from 'clsx';

export function TabBar() {
  const { machines, tabs, activeTabMachineId, setActiveTab, closeTab, addMachine, renameMachine } = useMachineStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleDoubleClick = (machineId: string, currentName: string) => {
    setRenamingId(machineId);
    setRenameValue(currentName);
  };

  const handleRenameSubmit = (machineId: string) => {
    if (renameValue.trim()) {
      renameMachine(machineId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {tabs.map(tab => {
        const machine = machines.find(m => m.id === tab.machineId);
        if (!machine) return null;
        const isActive = activeTabMachineId === tab.machineId;
        return (
          <div
            key={tab.machineId}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-0 max-w-[200px] group',
              isActive
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-b-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
            onClick={() => setActiveTab(tab.machineId)}
          >
            <span className={clsx('text-xs font-medium rounded px-1', {
              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300': machine.type === 'DFA',
              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': machine.type === 'NFA',
              'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300': machine.type === 'PDA',
              'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300': machine.type === 'TM',
            })}>
              {machine.type}
            </span>
            {renamingId === tab.machineId ? (
              <input
                className="text-sm bg-transparent border-b border-blue-500 outline-none w-24"
                value={renameValue}
                autoFocus
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(tab.machineId)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameSubmit(tab.machineId);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-sm truncate"
                onDoubleClick={e => { e.stopPropagation(); handleDoubleClick(tab.machineId, machine.name); }}
              >
                {machine.name}
              </span>
            )}
            <button
              className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
              onClick={e => { e.stopPropagation(); closeTab(tab.machineId); }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
      <button
        className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
        onClick={() => addMachine('DFA')}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
