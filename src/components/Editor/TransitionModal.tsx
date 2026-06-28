import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { MachineType } from '../../machines/types';

interface TransitionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  machineType: MachineType;
  existingData?: Record<string, string>;
  fromLabel: string;
  toLabel: string;
}

export function TransitionModal({ open, onClose, onSubmit, machineType, existingData, fromLabel, toLabel }: TransitionModalProps) {
  const [symbol, setSymbol] = useState('');
  const [stackPop, setStackPop] = useState('');
  const [stackPush, setStackPush] = useState('');
  const [writeSymbol, setWriteSymbol] = useState('');
  const [direction, setDirection] = useState<'L' | 'R' | 'S'>('R');

  useEffect(() => {
    if (existingData) {
      setSymbol(existingData.symbol || existingData.inputSymbol || existingData.readSymbol || '');
      setStackPop(existingData.stackPop || '');
      setStackPush(existingData.stackPush || '');
      setWriteSymbol(existingData.writeSymbol || '');
      setDirection((existingData.direction as 'L' | 'R' | 'S') || 'R');
    } else {
      setSymbol('');
      setStackPop('');
      setStackPush('');
      setWriteSymbol('');
      setDirection('R');
    }
  }, [existingData, open]);

  const handleSubmit = () => {
    if (machineType === 'DFA' || machineType === 'NFA') {
      onSubmit({ symbol: symbol || 'ε' });
    } else if (machineType === 'PDA') {
      onSubmit({ inputSymbol: symbol || 'ε', stackPop: stackPop || 'ε', stackPush: stackPush || 'ε' });
    } else {
      onSubmit({ readSymbol: symbol, writeSymbol, direction });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Transition: ${fromLabel} → ${toLabel}`}>
      <div className="space-y-3">
        {(machineType === 'DFA' || machineType === 'NFA') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Input Symbol {machineType === 'NFA' && '(ε for epsilon)'}
            </label>
            <input
              className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              placeholder={machineType === 'NFA' ? 'a, b, ε ...' : 'a, b ...'}
            />
          </div>
        )}
        {machineType === 'PDA' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input Symbol (ε for epsilon)</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="a, b, ε" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stack Pop (ε to not pop)</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={stackPop} onChange={e => setStackPop(e.target.value)} placeholder="A, Z, ε" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stack Push (ε to not push)</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={stackPush} onChange={e => setStackPush(e.target.value)} placeholder="AB, Z, ε" />
            </div>
          </>
        )}
        {machineType === 'TM' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Read Symbol</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="0, 1, _" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Write Symbol</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={writeSymbol} onChange={e => setWriteSymbol(e.target.value)} placeholder="0, 1, _" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
              <div className="flex gap-2">
                {(['L', 'R', 'S'] as const).map(d => (
                  <button key={d} onClick={() => setDirection(d)} className={`px-4 py-1.5 rounded border text-sm font-medium ${direction === d ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>{d}</button>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {existingData ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
