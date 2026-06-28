import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { Machine, MachineType } from '../../machines/types';
import { useMachineStore } from '../../store/machineStore';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';

interface TransitionManagerModalProps {
  open: boolean;
  onClose: () => void;
  machine: Machine;
  fromId: string;
  toId: string;
}

function getTransitionLabel(machineType: MachineType, t: Record<string, string>): string {
  if (machineType === 'DFA' || machineType === 'NFA') return t.symbol || 'ε';
  if (machineType === 'PDA') return `${t.inputSymbol}, ${t.stackPop} / ${t.stackPush}`;
  return `${t.readSymbol} → ${t.writeSymbol}, ${t.direction}`;
}

interface TransitionFormState {
  symbol: string;
  stackPop: string;
  stackPush: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S';
}

function emptyForm(): TransitionFormState {
  return { symbol: '', stackPop: 'ε', stackPush: 'ε', writeSymbol: '', direction: 'R' };
}

export function TransitionManagerModal({ open, onClose, machine, fromId, toId }: TransitionManagerModalProps) {
  const { addTransition, deleteTransition, updateTransition } = useMachineStore();
  const [form, setForm] = useState<TransitionFormState>(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fromState = machine.states.find(s => s.id === fromId);
  const toState = machine.states.find(s => s.id === toId);

  const pairTransitions = machine.transitions.filter(tr => {
    const t = tr as unknown as Record<string, string>;
    return t.from === fromId && t.to === toId;
  });

  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setEditId(null);
      setShowAdd(pairTransitions.length === 0);
    }
  }, [open, fromId, toId]);

  const handleAdd = () => {
    if (editId) {
      let updates: Record<string, string> = {};
      if (machine.type === 'DFA' || machine.type === 'NFA') {
        updates = { symbol: form.symbol || 'ε' };
      } else if (machine.type === 'PDA') {
        updates = { inputSymbol: form.symbol || 'ε', stackPop: form.stackPop || 'ε', stackPush: form.stackPush || 'ε' };
      } else {
        updates = { readSymbol: form.symbol, writeSymbol: form.writeSymbol, direction: form.direction };
      }
      updateTransition(machine.id, editId, updates as never);
      setEditId(null);
    } else {
      let data: Record<string, string> = {};
      if (machine.type === 'DFA' || machine.type === 'NFA') {
        data = { symbol: form.symbol || 'ε' };
      } else if (machine.type === 'PDA') {
        data = { inputSymbol: form.symbol || 'ε', stackPop: form.stackPop || 'ε', stackPush: form.stackPush || 'ε' };
      } else {
        data = { readSymbol: form.symbol, writeSymbol: form.writeSymbol, direction: form.direction };
      }
      addTransition(machine.id, { from: fromId, to: toId, ...data } as never);
    }
    setForm(emptyForm());
    setShowAdd(false);
  };

  const handleEdit = (tr: Record<string, string>, id: string) => {
    setEditId(id);
    setShowAdd(true);
    setForm({
      symbol: tr.symbol || tr.inputSymbol || tr.readSymbol || '',
      stackPop: tr.stackPop || 'ε',
      stackPush: tr.stackPush || 'ε',
      writeSymbol: tr.writeSymbol || '',
      direction: (tr.direction as 'L' | 'R' | 'S') || 'R',
    });
  };

  const handleDelete = (id: string) => {
    deleteTransition(machine.id, id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowAdd(false);
    setForm(emptyForm());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${fromState?.label ?? '?'} → ${toState?.label ?? '?'}`}
    >
      <div className="space-y-3 min-w-[320px]">
        {/* Existing transitions */}
        {pairTransitions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Transitions ({pairTransitions.length})
            </div>
            {pairTransitions.map(tr => {
              const t = tr as unknown as Record<string, string>;
              const label = getTransitionLabel(machine.type, t);
              return (
                <div
                  key={tr.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                    editId === tr.id
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300'
                  }`}
                >
                  <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{label}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(t, tr.id)}
                      className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tr.id)}
                      className="text-red-400 hover:text-red-600 p-0.5 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pairTransitions.length === 0 && !showAdd && (
          <div className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-2">
            No transitions yet
          </div>
        )}

        {/* Add/Edit form */}
        {showAdd && (
          <div className="space-y-3 border border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-3 bg-blue-50/50 dark:bg-blue-900/10">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {editId ? 'Edit Transition' : 'Add Transition'}
            </div>

            {(machine.type === 'DFA' || machine.type === 'NFA') && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Input symbol{machine.type === 'NFA' && ' — leave blank for ε (lambda)'}
                </label>
                <input
                  autoFocus
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.symbol}
                  onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                  placeholder={machine.type === 'NFA' ? 'blank = ε' : 'a'}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
              </div>
            )}

            {machine.type === 'PDA' && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1.5">
                  Leave any field blank to use <span className="font-mono text-gray-600 dark:text-gray-300">ε</span> (lambda/epsilon).
                  Stack starts with <span className="font-mono text-gray-600 dark:text-gray-300">Z</span> (bottom-of-stack).
                  Multi-char push: <span className="font-mono text-gray-600 dark:text-gray-300">aZ</span> pushes <span className="font-mono text-gray-600 dark:text-gray-300">a</span> on top of <span className="font-mono text-gray-600 dark:text-gray-300">Z</span>.
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Input (blank=ε)</label>
                    <input
                      autoFocus
                      className="w-full border rounded-lg px-2 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.symbol}
                      onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                      placeholder="a  Z  ε"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Pop (blank=ε)</label>
                    <input
                      className="w-full border rounded-lg px-2 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.stackPop}
                      onChange={e => setForm(f => ({ ...f, stackPop: e.target.value }))}
                      placeholder="a  Z  ε"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Push (blank=ε)</label>
                    <input
                      className="w-full border rounded-lg px-2 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.stackPush}
                      onChange={e => setForm(f => ({ ...f, stackPush: e.target.value }))}
                      placeholder="aZ  a  ε"
                    />
                  </div>
                </div>
              </div>
            )}

            {machine.type === 'TM' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Read</label>
                    <input
                      autoFocus
                      className="w-full border rounded-lg px-2 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.symbol}
                      onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                      placeholder="0, 1, _"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Write</label>
                    <input
                      className="w-full border rounded-lg px-2 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.writeSymbol}
                      onChange={e => setForm(f => ({ ...f, writeSymbol: e.target.value }))}
                      placeholder="0, 1, _"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Direction</label>
                  <div className="flex gap-2">
                    {(['L', 'R', 'S'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setForm(f => ({ ...f, direction: d }))}
                        className={`flex-1 py-1.5 rounded-lg border text-sm font-bold transition-colors ${
                          form.direction === d
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={cancelEdit}>
                <X size={13} /> Cancel
              </Button>
              <Button size="sm" onClick={handleAdd}>
                <Plus size={13} /> {editId ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
          {!showAdd && (
            <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); setForm(emptyForm()); }}>
              <Plus size={13} /> Add Transition
            </Button>
          )}
          <div className={showAdd ? 'ml-auto' : ''}>
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
