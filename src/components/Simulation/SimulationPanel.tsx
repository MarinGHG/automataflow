import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Machine, DFAConfig, NFAConfig, PDAConfig, TMConfig, SimStatus } from '../../machines/types';
import { dfaInitialConfig, dfaStep, dfaIsAccepted, dfaIsRejected } from '../../machines/dfa';
import { nfaInitialConfig, nfaStep, nfaIsAccepted } from '../../machines/nfa';
import { pdaInitialConfig, pdaStep, pdaIsAccepted } from '../../machines/pda';
import { tmInitialConfig, tmStep } from '../../machines/tm';
import { TapeVisualization } from './TapeVisualization';
import { clsx } from 'clsx';

interface Props {
  machine: Machine;
  onActiveStates: (ids: Set<string>) => void;
  onAcceptStates: (ids: Set<string>) => void;
  onRejectStates: (ids: Set<string>) => void;
}

type AnyConfig = DFAConfig | NFAConfig | PDAConfig | TMConfig;

function getInputIndex(cfg: AnyConfig, type: string): number {
  if (type === 'DFA') return (cfg as DFAConfig).inputIndex;
  if (type === 'NFA') return (cfg as NFAConfig).inputIndex;
  if (type === 'PDA') return Math.min(...(cfg as PDAConfig).branches.map(b => b.inputIndex));
  return -1;
}

function getStep(cfg: AnyConfig, type: string): number {
  if (type === 'PDA') return (cfg as PDAConfig).step;
  if (type === 'TM') return (cfg as TMConfig).step;
  return (cfg as DFAConfig | NFAConfig).inputIndex;
}

function getPDAStacks(cfg: PDAConfig): { stateId: string; stack: string[] }[] {
  return cfg.branches.map(b => ({ stateId: b.stateId, stack: b.stack }));
}

export function SimulationPanel({ machine, onActiveStates, onAcceptStates, onRejectStates }: Props) {
  const [input, setInput] = useState('');
  const [config, setConfig] = useState<AnyConfig | null>(null);
  const [status, setStatus] = useState<SimStatus>('idle');
  const [speed, setSpeed] = useState(600);
  const [playing, setPlaying] = useState(false);
  const [branchIdx, setBranchIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef<AnyConfig | null>(null);

  useEffect(() => { configRef.current = config; }, [config]);

  const reset = () => {
    setConfig(null);
    setStatus('idle');
    setPlaying(false);
    setBranchIdx(0);
    onActiveStates(new Set());
    onAcceptStates(new Set());
    onRejectStates(new Set());
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const initConfig = (): AnyConfig | null => {
    if (machine.type === 'DFA') return dfaInitialConfig(machine, input);
    if (machine.type === 'NFA') return nfaInitialConfig(machine, input);
    if (machine.type === 'PDA') return pdaInitialConfig(machine, input);
    if (machine.type === 'TM') return tmInitialConfig(machine, input);
    return null;
  };

  const updateHighlights = (cfg: AnyConfig) => {
    if (machine.type === 'DFA') onActiveStates(new Set([(cfg as DFAConfig).currentStateId]));
    else if (machine.type === 'NFA') onActiveStates(new Set((cfg as NFAConfig).activeStateIds));
    else if (machine.type === 'PDA') onActiveStates(new Set((cfg as PDAConfig).branches.map(b => b.stateId)));
    else if (machine.type === 'TM') onActiveStates(new Set([(cfg as TMConfig).stateId]));
  };

  const checkTermination = (cfg: AnyConfig): SimStatus => {
    if (machine.type === 'DFA') {
      if (dfaIsAccepted(machine, cfg as DFAConfig)) return 'accepted';
      if (dfaIsRejected(machine, cfg as DFAConfig)) return 'rejected';
    } else if (machine.type === 'NFA') {
      const c = cfg as NFAConfig;
      if (c.inputIndex >= c.input.length) return nfaIsAccepted(machine, c) ? 'accepted' : 'rejected';
    } else if (machine.type === 'PDA') {
      if (pdaIsAccepted(machine, cfg as PDAConfig)) return 'accepted';
    } else if (machine.type === 'TM') {
      const c = cfg as TMConfig;
      if (c.halted) return c.accepted ? 'accepted' : 'rejected';
    }
    return 'stepping';
  };

  const getActiveIds = (cfg: AnyConfig): Set<string> => {
    if (machine.type === 'DFA') return new Set([(cfg as DFAConfig).currentStateId]);
    if (machine.type === 'NFA') return new Set((cfg as NFAConfig).activeStateIds);
    if (machine.type === 'PDA') return new Set((cfg as PDAConfig).branches.map(b => b.stateId));
    if (machine.type === 'TM') return new Set([(cfg as TMConfig).stateId]);
    return new Set();
  };

  const doStep = (cfg: AnyConfig) => {
    let next: AnyConfig | null = null;
    if (machine.type === 'DFA') next = dfaStep(machine, cfg as DFAConfig);
    else if (machine.type === 'NFA') next = nfaStep(machine, cfg as NFAConfig);
    else if (machine.type === 'PDA') next = pdaStep(machine, cfg as PDAConfig);
    else if (machine.type === 'TM') next = tmStep(machine, cfg as TMConfig);

    if (!next) {
      const s = checkTermination(cfg);
      const final = s === 'stepping' ? 'rejected' : s;
      setStatus(final);
      if (final === 'accepted') onAcceptStates(getActiveIds(cfg));
      else onRejectStates(getActiveIds(cfg));
      setPlaying(false);
      return;
    }
    setConfig(next);
    updateHighlights(next);
    const s = checkTermination(next);
    setStatus(s);
    if (s === 'accepted') { onAcceptStates(getActiveIds(next)); onActiveStates(new Set()); setPlaying(false); }
    else if (s === 'rejected') { onRejectStates(getActiveIds(next)); onActiveStates(new Set()); setPlaying(false); }
  };

  const stepForward = () => { const cfg = configRef.current; if (cfg) doStep(cfg); };

  const stepBack = () => {
    if (!config) return;
    const h = (config as AnyConfig & { history: AnyConfig[] }).history;
    if (Array.isArray(h) && h.length > 0) {
      const prev = { ...h[h.length - 1], history: h.slice(0, -1) } as AnyConfig;
      setConfig(prev);
      updateHighlights(prev);
      setStatus('stepping');
      onAcceptStates(new Set());
      onRejectStates(new Set());
    }
  };

  const handleRun = () => {
    reset();
    const init = initConfig();
    if (!init) return;
    setConfig(init);
    setStatus('stepping');
    updateHighlights(init);
    const s = checkTermination(init);
    if (s !== 'stepping') {
      setStatus(s);
      if (s === 'accepted') onAcceptStates(getActiveIds(init));
      else onRejectStates(getActiveIds(init));
    }
  };

  useEffect(() => {
    if (playing && status === 'stepping') {
      intervalRef.current = setInterval(stepForward, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, status, speed]);

  const done = status === 'accepted' || status === 'rejected';
  const hasHistory = config && Array.isArray((config as AnyConfig & { history: AnyConfig[] }).history) && (config as AnyConfig & { history: AnyConfig[] }).history.length > 0;
  const currentInputIdx = config ? getInputIndex(config, machine.type) : -1;
  const currentStep = config ? getStep(config, machine.type) : 0;

  // Active NFA states
  const nfaActiveLabels: string[] = config && machine.type === 'NFA'
    ? [...(config as NFAConfig).activeStateIds].map(id => machine.states.find(s => s.id === id)?.label ?? id)
    : [];

  // PDA branches
  const pdaBranches = config && machine.type === 'PDA' ? getPDAStacks(config as PDAConfig) : [];
  const currentBranch = pdaBranches[branchIdx] ?? null;
  const currentBranchState = currentBranch
    ? machine.states.find(s => s.id === currentBranch.stateId)?.label ?? '?'
    : null;

  // TM state label
  const tmStateLabel = config && machine.type === 'TM'
    ? machine.states.find(s => s.id === (config as TMConfig).stateId)?.label ?? '?'
    : null;

  // DFA current state
  const dfaStateLabel = config && machine.type === 'DFA'
    ? machine.states.find(s => s.id === (config as DFAConfig).currentStateId)?.label ?? '?'
    : null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Input row */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <div className="flex-1 relative">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 pr-20"
            placeholder={`Input string (Σ = {${machine.alphabet.join(', ') || '...'}})`}
            value={input}
            onChange={e => { setInput(e.target.value); reset(); }}
            onKeyDown={e => e.key === 'Enter' && handleRun()}
          />
          {input && (
            <button
              onClick={() => { setInput(''); reset(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              clear
            </button>
          )}
        </div>
        <button
          onClick={handleRun}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <ChevronRight size={15} /> Run
        </button>
        <button
          onClick={reset}
          title="Reset"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Input tape visualization */}
      {config && machine.type !== 'TM' && input.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {input.split('').map((ch, i) => (
              <div
                key={i}
                className={clsx(
                  'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border font-mono text-sm font-medium transition-all',
                  i === currentInputIdx
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md scale-110'
                    : i < currentInputIdx
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                )}
              >
                {ch}
              </div>
            ))}
            <div
              className={clsx(
                'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border-2 border-dashed font-mono text-xs transition-all',
                currentInputIdx >= input.length
                  ? 'border-blue-400 text-blue-400 scale-110'
                  : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
              )}
              title="End of input"
            >
              ⊣
            </div>
          </div>
        </div>
      )}

      {/* Controls row */}
      {config && (
        <div className="flex items-center gap-2 px-4 pb-2">
          <button
            onClick={stepBack}
            disabled={!hasHistory}
            title="Step back"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={stepForward}
            disabled={done}
            title="Step forward"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward size={15} />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            disabled={done}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30',
              playing
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
          </button>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-xs text-gray-400 dark:text-gray-500">Slow</span>
            <input
              type="range" min="100" max="2000" step="100"
              value={2100 - speed}
              onChange={e => setSpeed(2100 - Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">Fast</span>
          </div>

          {/* Step/state info */}
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {machine.type === 'DFA' && dfaStateLabel && (
              <span className="font-mono">
                state: <span className="text-blue-600 dark:text-blue-400 font-bold">{dfaStateLabel}</span>
                {' '}pos: {currentInputIdx}/{input.length}
              </span>
            )}
            {machine.type === 'NFA' && nfaActiveLabels.length > 0 && (
              <div className="flex items-center gap-1">
                <span>active:</span>
                {nfaActiveLabels.map(l => (
                  <span key={l} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 px-1.5 py-0.5 rounded font-mono font-bold">
                    {l}
                  </span>
                ))}
              </div>
            )}
            {machine.type === 'TM' && tmStateLabel && (
              <span className="font-mono">
                state: <span className="text-blue-600 dark:text-blue-400 font-bold">{tmStateLabel}</span>
                {' '}head: {(config as TMConfig).head}
                {' '}step: {currentStep}
              </span>
            )}
            {machine.type === 'PDA' && (
              <span className="font-mono">step: {currentStep} branches: {pdaBranches.length}</span>
            )}
          </div>
        </div>
      )}

      {/* TM tape */}
      {machine.type === 'TM' && config && (
        <div className="px-4 pb-2">
          <TapeVisualization config={config as TMConfig} blankSymbol={machine.blankSymbol} />
        </div>
      )}

      {/* PDA stack */}
      {machine.type === 'PDA' && config && pdaBranches.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Stack — Branch {branchIdx + 1}/{pdaBranches.length}
              {currentBranchState && <> · state <span className="text-blue-600 dark:text-blue-400 font-bold">{currentBranchState}</span></>}
            </span>
            {pdaBranches.length > 1 && (
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setBranchIdx(i => Math.max(0, i - 1))}
                  disabled={branchIdx === 0}
                  className="p-0.5 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() => setBranchIdx(i => Math.min(pdaBranches.length - 1, i + 1))}
                  disabled={branchIdx >= pdaBranches.length - 1}
                  className="p-0.5 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronRightIcon size={13} />
                </button>
              </div>
            )}
          </div>
          {currentBranch && (
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-xs text-gray-400 mr-1">top→</span>
              {currentBranch.stack.length === 0 ? (
                <span className="text-xs text-gray-400 italic">empty</span>
              ) : (
                [...currentBranch.stack].reverse().map((sym, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border font-mono text-sm font-medium',
                      i === 0
                        ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {sym}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Result banner */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={clsx(
              'mx-4 mb-3 rounded-xl px-4 py-3 text-center font-bold text-sm flex items-center justify-center gap-2',
              status === 'accepted'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
            )}
          >
            <span className="text-lg">{status === 'accepted' ? '✓' : '✗'}</span>
            <span>
              {status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
              {machine.type === 'TM' && config && ` — ${(config as TMConfig).step} steps`}
              {machine.type === 'PDA' && config && ` — ${(config as PDAConfig).step} steps`}
              {(machine.type === 'DFA' || machine.type === 'NFA') && input && ` — "${input}"`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
