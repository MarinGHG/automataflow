import React, { useEffect, useRef } from 'react';
import { Machine } from '../../machines/types';
import { useMachineStore } from '../../store/machineStore';

interface Props {
  x: number;
  y: number;
  machine: Machine;
  stateId: string;
  onClose: () => void;
}

export function StateContextMenu({ x, y, machine, stateId, onClose }: Props) {
  const { updateState, deleteState, updateMachine } = useMachineStore();
  const ref = useRef<HTMLDivElement>(null);
  const state = machine.states.find(s => s.id === stateId);
  if (!state) return null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const menuItems = [
    {
      label: state.isStart ? '✓ Start State' : 'Set as Start State',
      action: () => {
        machine.states.forEach(s => {
          if (s.isStart && s.id !== stateId) updateState(machine.id, s.id, { isStart: false });
        });
        updateState(machine.id, stateId, { isStart: true });
        updateMachine(machine.id, { startStateId: stateId });
        onClose();
      },
    },
    {
      label: state.isFinal ? 'Unset Final State' : 'Set as Final State',
      action: () => {
        updateState(machine.id, stateId, { isFinal: !state.isFinal });
        const newAccept = state.isFinal
          ? machine.acceptStateIds.filter(id => id !== stateId)
          : [...machine.acceptStateIds, stateId];
        updateMachine(machine.id, { acceptStateIds: newAccept });
        onClose();
      },
    },
    {
      label: 'Rename State',
      action: () => {
        const newName = window.prompt('State name:', state.label);
        if (newName) updateState(machine.id, stateId, { label: newName });
        onClose();
      },
    },
    {
      label: 'Delete State',
      action: () => {
        deleteState(machine.id, stateId);
        onClose();
      },
      danger: true,
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, i) => (
        <button
          key={i}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
          onClick={item.action}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
