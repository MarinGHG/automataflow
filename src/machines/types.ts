export type MachineType = 'DFA' | 'NFA' | 'PDA' | 'TM';

export interface State {
  id: string;
  label: string;
  isStart: boolean;
  isFinal: boolean;
  position: { x: number; y: number };
}

export interface DFATransition {
  id: string;
  from: string;
  to: string;
  symbol: string; // single symbol from Sigma
}

export interface NFATransition {
  id: string;
  from: string;
  to: string;
  symbol: string; // symbol or 'ε'
}

export interface PDATransition {
  id: string;
  from: string;
  to: string;
  inputSymbol: string;  // symbol or 'ε'
  stackPop: string;     // symbol or 'ε'
  stackPush: string;    // symbol(s) or 'ε'
}

export interface TMTransition {
  id: string;
  from: string;
  to: string;
  readSymbol: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S';
}

export type Transition = DFATransition | NFATransition | PDATransition | TMTransition;

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  states: State[];
  transitions: Transition[];
  alphabet: string[];      // Sigma
  stackAlphabet: string[]; // Gamma (PDA only)
  tapeAlphabet: string[];  // Tape alphabet (TM only)
  blankSymbol: string;     // TM blank symbol
  startStateId: string | null;
  acceptStateIds: string[];
  rejectStateId: string | null; // TM explicit reject state
}

// Simulation types
export interface DFAConfig {
  currentStateId: string;
  inputIndex: number;
  input: string;
  history: DFAConfig[];
}

export interface NFAConfig {
  activeStateIds: Set<string>;
  inputIndex: number;
  input: string;
  history: Array<{ activeStateIds: Set<string>; inputIndex: number }>;
}

export interface PDABranch {
  stateId: string;
  stack: string[];
  inputIndex: number;
}

export interface PDAConfig {
  branches: PDABranch[];
  input: string;
  step: number;
  history: PDAConfig[];
}

export interface TMConfig {
  stateId: string;
  tape: Map<number, string>;
  head: number;
  input: string;
  step: number;
  halted: boolean;
  accepted: boolean;
  history: TMConfig[];
}

export type SimConfig = DFAConfig | NFAConfig | PDAConfig | TMConfig;

export type SimStatus = 'idle' | 'running' | 'accepted' | 'rejected' | 'stepping';
