import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Machine, MachineType, State, Transition, DFATransition, NFATransition, PDATransition, TMTransition } from '../machines/types';

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createExampleDFA(): Machine {
  const q0 = generateId();
  const q1 = generateId();
  const q2 = generateId();
  return {
    id: generateId(),
    name: 'DFA: ends with ab',
    type: 'DFA',
    alphabet: ['a', 'b'],
    stackAlphabet: [],
    tapeAlphabet: [],
    blankSymbol: '_',
    startStateId: q0,
    acceptStateIds: [q2],
    rejectStateId: null,
    states: [
      { id: q0, label: 'q0', isStart: true,  isFinal: false, position: { x: 100, y: 220 } },
      { id: q1, label: 'q1', isStart: false, isFinal: false, position: { x: 320, y: 100 } },
      { id: q2, label: 'q2', isStart: false, isFinal: true,  position: { x: 320, y: 340 } },
    ],
    transitions: [
      { id: generateId(), from: q0, to: q1, symbol: 'a' } as DFATransition,
      { id: generateId(), from: q0, to: q0, symbol: 'b' } as DFATransition,
      { id: generateId(), from: q1, to: q1, symbol: 'a' } as DFATransition,
      { id: generateId(), from: q1, to: q2, symbol: 'b' } as DFATransition,
      { id: generateId(), from: q2, to: q1, symbol: 'a' } as DFATransition,
      { id: generateId(), from: q2, to: q0, symbol: 'b' } as DFATransition,
    ],
  };
}

function createExampleNFA(): Machine {
  const q0 = generateId();
  const q1 = generateId();
  const q2 = generateId();
  return {
    id: generateId(),
    name: 'NFA: contains ab',
    type: 'NFA',
    alphabet: ['a', 'b'],
    stackAlphabet: [],
    tapeAlphabet: [],
    blankSymbol: '_',
    startStateId: q0,
    acceptStateIds: [q2],
    rejectStateId: null,
    states: [
      { id: q0, label: 'q0', isStart: true, isFinal: false, position: { x: 100, y: 200 } },
      { id: q1, label: 'q1', isStart: false, isFinal: false, position: { x: 300, y: 200 } },
      { id: q2, label: 'q2', isStart: false, isFinal: true, position: { x: 500, y: 200 } },
    ],
    transitions: [
      { id: generateId(), from: q0, to: q0, symbol: 'a' } as NFATransition,
      { id: generateId(), from: q0, to: q0, symbol: 'b' } as NFATransition,
      { id: generateId(), from: q0, to: q1, symbol: 'a' } as NFATransition,
      { id: generateId(), from: q1, to: q2, symbol: 'b' } as NFATransition,
      { id: generateId(), from: q2, to: q2, symbol: 'a' } as NFATransition,
      { id: generateId(), from: q2, to: q2, symbol: 'b' } as NFATransition,
    ],
  };
}

function createExamplePDA(): Machine {
  // Accepts { aⁿbⁿ | n ≥ 1 }
  // Initial stack: [Z]  (seeded automatically by pdaInitialConfig)
  // q0: push one 'a' per 'a' read (on top of Z)
  // q1: pop one 'a' per 'b' read
  // q2: accept once stack has only Z and input is consumed
  const q0 = generateId();
  const q1 = generateId();
  const q2 = generateId();
  return {
    id: generateId(),
    name: 'PDA: aⁿbⁿ  (n ≥ 1)',
    type: 'PDA',
    alphabet: ['a', 'b'],
    stackAlphabet: ['a', 'Z'],
    tapeAlphabet: [],
    blankSymbol: '_',
    startStateId: q0,
    acceptStateIds: [q2],
    rejectStateId: null,
    states: [
      { id: q0, label: 'q0', isStart: true,  isFinal: false, position: { x: 100, y: 220 } },
      { id: q1, label: 'q1', isStart: false, isFinal: false, position: { x: 340, y: 220 } },
      { id: q2, label: 'q2', isStart: false, isFinal: true,  position: { x: 580, y: 220 } },
    ],
    transitions: [
      // q0: read 'a', push 'a' (stack top = Z → push aZ; top = a → push aa)
      { id: generateId(), from: q0, to: q0, inputSymbol: 'a', stackPop: 'Z', stackPush: 'aZ' } as PDATransition,
      { id: generateId(), from: q0, to: q0, inputSymbol: 'a', stackPop: 'a', stackPush: 'aa' } as PDATransition,
      // q0→q1: switch when first 'b' seen, pop matching 'a'
      { id: generateId(), from: q0, to: q1, inputSymbol: 'b', stackPop: 'a', stackPush: 'ε'  } as PDATransition,
      // q1: continue popping 'a' per 'b'
      { id: generateId(), from: q1, to: q1, inputSymbol: 'b', stackPop: 'a', stackPush: 'ε'  } as PDATransition,
      // q1→q2: input consumed and only Z remains on stack
      { id: generateId(), from: q1, to: q2, inputSymbol: 'ε', stackPop: 'Z', stackPush: 'ε'  } as PDATransition,
    ],
  };
}

function createExampleTM(): Machine {
  const q0 = generateId();
  const q1 = generateId();
  const q2 = generateId();
  const q3 = generateId();
  const qacc = generateId();
  const qrej = generateId();
  return {
    id: generateId(),
    name: 'TM: add 1 to binary',
    type: 'TM',
    alphabet: ['0', '1'],
    stackAlphabet: [],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    startStateId: q0,
    acceptStateIds: [qacc],
    rejectStateId: qrej,
    states: [
      { id: q0, label: 'q0', isStart: true, isFinal: false, position: { x: 100, y: 200 } },
      { id: q1, label: 'q1', isStart: false, isFinal: false, position: { x: 250, y: 200 } },
      { id: q2, label: 'q2', isStart: false, isFinal: false, position: { x: 400, y: 200 } },
      { id: q3, label: 'q3', isStart: false, isFinal: false, position: { x: 550, y: 200 } },
      { id: qacc, label: 'qaccept', isStart: false, isFinal: true, position: { x: 700, y: 200 } },
      { id: qrej, label: 'qreject', isStart: false, isFinal: false, position: { x: 700, y: 350 } },
    ],
    transitions: [
      { id: generateId(), from: q0, to: q0, readSymbol: '0', writeSymbol: '0', direction: 'R' } as TMTransition,
      { id: generateId(), from: q0, to: q0, readSymbol: '1', writeSymbol: '1', direction: 'R' } as TMTransition,
      { id: generateId(), from: q0, to: q1, readSymbol: '_', writeSymbol: '_', direction: 'L' } as TMTransition,
      { id: generateId(), from: q1, to: q1, readSymbol: '1', writeSymbol: '0', direction: 'L' } as TMTransition,
      { id: generateId(), from: q1, to: q2, readSymbol: '0', writeSymbol: '1', direction: 'R' } as TMTransition,
      { id: generateId(), from: q1, to: q3, readSymbol: '_', writeSymbol: '1', direction: 'R' } as TMTransition,
      { id: generateId(), from: q2, to: q2, readSymbol: '0', writeSymbol: '0', direction: 'R' } as TMTransition,
      { id: generateId(), from: q2, to: q2, readSymbol: '1', writeSymbol: '1', direction: 'R' } as TMTransition,
      { id: generateId(), from: q2, to: qacc, readSymbol: '_', writeSymbol: '_', direction: 'R' } as TMTransition,
      { id: generateId(), from: q3, to: q3, readSymbol: '0', writeSymbol: '0', direction: 'R' } as TMTransition,
      { id: generateId(), from: q3, to: q3, readSymbol: '1', writeSymbol: '1', direction: 'R' } as TMTransition,
      { id: generateId(), from: q3, to: qacc, readSymbol: '_', writeSymbol: '_', direction: 'R' } as TMTransition,
    ],
  };
}

interface Tab {
  machineId: string;
  active: boolean;
}

interface MachineStore {
  machines: Machine[];
  tabs: Tab[];
  activeTabMachineId: string | null;
  darkMode: boolean;
  undoStack: Machine[][];
  redoStack: Machine[][];

  addMachine: (type: MachineType) => string;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  renameMachine: (id: string, name: string) => void;

  addState: (machineId: string, state: Omit<State, 'id'>) => string;
  updateState: (machineId: string, stateId: string, updates: Partial<State>) => void;
  deleteState: (machineId: string, stateId: string) => void;

  addTransition: (machineId: string, transition: Omit<Transition, 'id'>) => string;
  updateTransition: (machineId: string, transitionId: string, updates: Partial<Transition>) => void;
  deleteTransition: (machineId: string, transitionId: string) => void;

  openTab: (machineId: string) => void;
  closeTab: (machineId: string) => void;
  setActiveTab: (machineId: string) => void;

  toggleDarkMode: () => void;
  undo: () => void;
  redo: () => void;
}

export const useMachineStore = create<MachineStore>()(
  persist(
    (set, get) => {
      const examples = [createExampleDFA(), createExampleNFA(), createExamplePDA(), createExampleTM()];
      const initialTabs: Tab[] = examples.map((m, i) => ({ machineId: m.id, active: i === 0 }));

      function pushUndo(currentMachines: Machine[]) {
        return (s: MachineStore) => ({
          undoStack: [...s.undoStack.slice(-49), currentMachines],
          redoStack: [] as Machine[][],
        });
      }

      return {
        machines: examples,
        tabs: initialTabs,
        activeTabMachineId: examples[0].id,
        darkMode: false,
        undoStack: [],
        redoStack: [],

        addMachine: (type) => {
          const id = generateId();
          const startId = generateId();
          const machine: Machine = {
            id,
            name: `New ${type}`,
            type,
            states: [{ id: startId, label: 'q0', isStart: true, isFinal: false, position: { x: 200, y: 200 } }],
            transitions: [],
            alphabet: [],
            stackAlphabet: [],
            tapeAlphabet: [],
            blankSymbol: '_',
            startStateId: startId,
            acceptStateIds: [],
            rejectStateId: null,
          };
          set(s => ({
            ...pushUndo(s.machines)(s),
            machines: [...s.machines, machine],
            tabs: [...s.tabs, { machineId: id, active: false }],
            activeTabMachineId: id,
          }));
          return id;
        },

        updateMachine: (id, updates) => {
          set(s => ({
            machines: s.machines.map(m => m.id === id ? { ...m, ...updates } : m),
          }));
        },

        deleteMachine: (id) => {
          const { tabs, activeTabMachineId } = get();
          const newTabs = tabs.filter(t => t.machineId !== id);
          let newActive = activeTabMachineId;
          if (activeTabMachineId === id) {
            newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1].machineId : null;
          }
          set(s => ({
            ...pushUndo(s.machines)(s),
            machines: s.machines.filter(m => m.id !== id),
            tabs: newTabs,
            activeTabMachineId: newActive,
          }));
        },

        renameMachine: (id, name) => {
          set(s => ({
            machines: s.machines.map(m => m.id === id ? { ...m, name } : m),
          }));
        },

        addState: (machineId, state) => {
          const id = generateId();
          set(s => ({
            ...pushUndo(s.machines)(s),
            machines: s.machines.map(m => m.id === machineId
              ? { ...m, states: [...m.states, { ...state, id }] }
              : m),
          }));
          return id;
        },

        updateState: (machineId, stateId, updates) => {
          set(s => ({
            machines: s.machines.map(m => m.id === machineId
              ? { ...m, states: m.states.map(st => st.id === stateId ? { ...st, ...updates } : st) }
              : m),
          }));
        },

        deleteState: (machineId, stateId) => {
          set(s => ({
            ...pushUndo(s.machines)(s),
            machines: s.machines.map(m => m.id === machineId
              ? {
                  ...m,
                  states: m.states.filter(st => st.id !== stateId),
                  transitions: m.transitions.filter(tr => {
                    const t = tr as unknown as { from: string; to: string };
                    return t.from !== stateId && t.to !== stateId;
                  }),
                  startStateId: m.startStateId === stateId ? null : m.startStateId,
                  acceptStateIds: m.acceptStateIds.filter(id => id !== stateId),
                }
              : m),
          }));
        },

        addTransition: (machineId, transition) => {
          const id = generateId();
          set(s => ({
            ...pushUndo(s.machines)(s),
            machines: s.machines.map(m => m.id === machineId
              ? { ...m, transitions: [...m.transitions, { ...transition, id } as Transition] }
              : m),
          }));
          return id;
        },

        updateTransition: (machineId, transitionId, updates) => {
          set(s => ({
            ...pushUndo(s.machines)(s),
            machines: s.machines.map(m => m.id === machineId
              ? {
                  ...m,
                  transitions: m.transitions.map(tr =>
                    tr.id === transitionId ? { ...tr, ...updates } : tr
                  ),
                }
              : m),
          }));
        },

        deleteTransition: (machineId, transitionId) => {
          set(s => ({
            ...pushUndo(s.machines)(s),
            machines: s.machines.map(m => m.id === machineId
              ? { ...m, transitions: m.transitions.filter(tr => tr.id !== transitionId) }
              : m),
          }));
        },

        openTab: (machineId) => {
          const { tabs } = get();
          if (!tabs.find(t => t.machineId === machineId)) {
            set(s => ({ tabs: [...s.tabs, { machineId, active: false }] }));
          }
          set({ activeTabMachineId: machineId });
        },

        closeTab: (machineId) => {
          const { tabs, activeTabMachineId } = get();
          const newTabs = tabs.filter(t => t.machineId !== machineId);
          let newActive = activeTabMachineId;
          if (activeTabMachineId === machineId) {
            const idx = tabs.findIndex(t => t.machineId === machineId);
            const next = newTabs[idx] ?? newTabs[idx - 1] ?? null;
            newActive = next?.machineId ?? null;
          }
          set({ tabs: newTabs, activeTabMachineId: newActive });
        },

        setActiveTab: (machineId) => {
          set({ activeTabMachineId: machineId });
        },

        toggleDarkMode: () => {
          set(s => ({ darkMode: !s.darkMode }));
        },

        undo: () => {
          const { undoStack, machines } = get();
          if (undoStack.length === 0) return;
          const prev = undoStack[undoStack.length - 1];
          set(s => ({
            undoStack: s.undoStack.slice(0, -1),
            redoStack: [...s.redoStack.slice(-49), machines],
            machines: prev,
          }));
        },

        redo: () => {
          const { redoStack, machines } = get();
          if (redoStack.length === 0) return;
          const next = redoStack[redoStack.length - 1];
          set(s => ({
            redoStack: s.redoStack.slice(0, -1),
            undoStack: [...s.undoStack.slice(-49), machines],
            machines: next,
          }));
        },
      };
    },
    {
      name: 'automata-studio-storage',
      partialize: (state) => ({
        machines: state.machines,
        tabs: state.tabs,
        activeTabMachineId: state.activeTabMachineId,
        darkMode: state.darkMode,
      }),
    }
  )
);
