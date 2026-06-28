import { Machine, NFATransition, NFAConfig } from './types';

export function epsilonClosure(machine: Machine, stateIds: Set<string>): Set<string> {
  const transitions = machine.transitions as NFATransition[];
  const closure = new Set(stateIds);
  const queue = [...stateIds];

  while (queue.length > 0) {
    const stateId = queue.shift()!;
    const epsTrans = transitions.filter(t => t.from === stateId && t.symbol === 'ε');
    for (const t of epsTrans) {
      if (!closure.has(t.to)) {
        closure.add(t.to);
        queue.push(t.to);
      }
    }
  }

  return closure;
}

export function nfaMove(machine: Machine, stateIds: Set<string>, symbol: string): Set<string> {
  const transitions = machine.transitions as NFATransition[];
  const result = new Set<string>();

  for (const stateId of stateIds) {
    const matching = transitions.filter(t => t.from === stateId && t.symbol === symbol);
    for (const t of matching) {
      result.add(t.to);
    }
  }

  return result;
}

export function nfaStep(machine: Machine, config: NFAConfig): NFAConfig | null {
  if (config.inputIndex >= config.input.length) return null;

  const symbol = config.input[config.inputIndex];
  const moved = nfaMove(machine, config.activeStateIds, symbol);
  const closed = epsilonClosure(machine, moved);

  return {
    activeStateIds: closed,
    inputIndex: config.inputIndex + 1,
    input: config.input,
    history: [...config.history, { activeStateIds: new Set(config.activeStateIds), inputIndex: config.inputIndex }],
  };
}

export function nfaIsAccepted(machine: Machine, config: NFAConfig): boolean {
  if (config.inputIndex < config.input.length) return false;
  return [...config.activeStateIds].some(id => machine.acceptStateIds.includes(id));
}

export function nfaInitialConfig(machine: Machine, input: string): NFAConfig | null {
  if (!machine.startStateId) return null;
  const initial = new Set([machine.startStateId]);
  const closed = epsilonClosure(machine, initial);
  return {
    activeStateIds: closed,
    inputIndex: 0,
    input,
    history: [],
  };
}

export function nfaRunToEnd(machine: Machine, input: string): { accepted: boolean; steps: NFAConfig[] } {
  const init = nfaInitialConfig(machine, input);
  if (!init) return { accepted: false, steps: [] };

  const steps: NFAConfig[] = [init];
  let current = init;

  while (current.inputIndex < current.input.length) {
    const next = nfaStep(machine, current);
    if (!next || next.activeStateIds.size === 0) break;
    steps.push(next);
    current = next;
  }

  return {
    accepted: nfaIsAccepted(machine, current),
    steps,
  };
}
