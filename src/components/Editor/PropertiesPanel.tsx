import React, { useState } from 'react';
import { Machine, MachineType } from '../../machines/types';
import { useMachineStore } from '../../store/machineStore';
import { Trash2, Check, Star, PlusCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  machine: Machine;
}

export function PropertiesPanel({ machine }: Props) {
  const { updateMachine, deleteMachine, deleteState, updateState, addState } = useMachineStore();
  const [renamingStateId, setRenamingStateId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateAlphabet = (value: string) => {
    updateMachine(machine.id, { alphabet: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const startRename = (stateId: string, currentLabel: string) => {
    setRenamingStateId(stateId);
    setRenameValue(currentLabel);
  };

  const commitRename = () => {
    if (renamingStateId && renameValue.trim()) {
      updateState(machine.id, renamingStateId, { label: renameValue.trim() });
    }
    setRenamingStateId(null);
  };

  const toggleStart = (stateId: string) => {
    const isAlreadyStart = machine.startStateId === stateId;
    if (isAlreadyStart) return;
    machine.states.forEach(s => updateState(machine.id, s.id, { isStart: s.id === stateId }));
    updateMachine(machine.id, { startStateId: stateId });
  };

  const toggleFinal = (stateId: string, isFinal: boolean) => {
    updateState(machine.id, stateId, { isFinal: !isFinal });
    const newAcceptIds = !isFinal
      ? [...machine.acceptStateIds, stateId]
      : machine.acceptStateIds.filter(id => id !== stateId);
    updateMachine(machine.id, { acceptStateIds: newAcceptIds });
  };

  const handleAddState = () => {
    const label = `q${machine.states.length}`;
    const newId = addState(machine.id, {
      label,
      isStart: machine.states.length === 0,
      isFinal: false,
      position: { x: 200 + machine.states.length * 160, y: 200 },
    });
    if (machine.states.length === 0) {
      updateMachine(machine.id, { startStateId: newId });
    }
  };

  const typeColor: Record<MachineType, string> = {
    DFA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    NFA: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    PDA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    TM: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  };

  return (
    <div className="w-60 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto text-sm">
      {/* Machine header */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
        <input
          className="w-full border-0 bg-transparent font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 -mx-1"
          value={machine.name}
          onChange={e => updateMachine(machine.id, { name: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <span className={clsx('text-xs font-bold px-2 py-0.5 rounded', typeColor[machine.type])}>
            {machine.type}
          </span>
          <select
            className="flex-1 text-xs border rounded px-1 py-0.5 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={machine.type}
            onChange={e => {
              const nextType = e.target.value as MachineType;
              if (nextType === machine.type) return;
              if (
                machine.transitions.length > 0 &&
                !window.confirm(
                  `Changing the machine type to ${nextType} is incompatible with the existing transitions and will delete all ${machine.transitions.length} of them. Continue?`
                )
              ) {
                return;
              }
              updateMachine(machine.id, { type: nextType, transitions: [], rejectStateId: null });
            }}
          >
            {(['DFA', 'NFA', 'PDA', 'TM'] as const).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Alphabets */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Alphabet</div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Σ (comma-separated)</label>
          <input
            className="w-full border rounded px-2 py-1.5 text-xs font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={machine.alphabet.join(', ')}
            onChange={e => updateAlphabet(e.target.value)}
            placeholder="a, b, 0, 1"
          />
        </div>
        {machine.type === 'PDA' && (
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Γ stack alphabet</label>
            <input
              className="w-full border rounded px-2 py-1.5 text-xs font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={machine.stackAlphabet.join(', ')}
              onChange={e => updateMachine(machine.id, { stackAlphabet: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="a, Z"
            />
            <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
              Z = bottom-of-stack marker (auto-seeded)
            </div>
          </div>
        )}
        {machine.type === 'TM' && (
          <>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Γ tape alphabet</label>
              <input
                className="w-full border rounded px-2 py-1.5 text-xs font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={machine.tapeAlphabet.join(', ')}
                onChange={e => updateMachine(machine.id, { tapeAlphabet: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="0, 1, _"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Blank symbol</label>
              <input
                className="w-full border rounded px-2 py-1.5 text-xs font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={machine.blankSymbol}
                onChange={e => updateMachine(machine.id, { blankSymbol: e.target.value })}
                placeholder="_"
              />
            </div>
          </>
        )}
      </div>

      {/* States */}
      <div className="flex-1 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            States ({machine.states.length})
          </div>
          <button
            onClick={handleAddState}
            title="Add state"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
          </button>
        </div>

        <div className="space-y-1">
          {machine.states.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors"
            >
              {renamingStateId === s.id ? (
                <input
                  autoFocus
                  className="flex-1 min-w-0 text-xs font-mono border rounded px-1 py-0.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingStateId(null); }}
                />
              ) : (
                <span
                  className="flex-1 min-w-0 text-xs font-mono text-gray-700 dark:text-gray-300 cursor-text truncate"
                  onDoubleClick={() => startRename(s.id, s.label)}
                  title="Double-click to rename"
                >
                  {s.label}
                </span>
              )}

              {/* Start toggle */}
              <button
                onClick={() => toggleStart(s.id)}
                title={s.isStart ? 'Start state' : 'Set as start'}
                className={clsx(
                  'w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0',
                  s.isStart
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 dark:text-gray-600 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                )}
              >
                S
              </button>

              {/* Final toggle */}
              <button
                onClick={() => toggleFinal(s.id, s.isFinal)}
                title={s.isFinal ? 'Final state (click to remove)' : 'Set as final'}
                className={clsx(
                  'w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0',
                  s.isFinal
                    ? 'bg-green-500 text-white'
                    : 'text-gray-300 dark:text-gray-600 hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                )}
              >
                <Check size={11} />
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteState(machine.id, s.id)}
                title="Delete state"
                className="w-5 h-5 rounded flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-600 mt-2 space-y-0.5">
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-500 text-white text-center text-xs font-bold leading-4">S</span>= start</span>
            <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-500 text-white flex items-center justify-center"><Check size={9} /></span>= final</span>
          </div>
          <div>Double-click label to rename</div>
        </div>
      </div>

      {/* Delete machine */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        {confirmDelete ? (
          <div className="space-y-2">
            <div className="text-xs text-red-600 dark:text-red-400 text-center">Delete this machine?</div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 text-xs py-1.5 rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMachine(machine.id)}
                className="flex-1 text-xs py-1.5 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={12} /> Delete Machine
          </button>
        )}
      </div>
    </div>
  );
}
