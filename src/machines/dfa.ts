import { Machine, DFATransition, DFAConfig } from './types';

export function dfaStep(machine: Machine, config: DFAConfig): DFAConfig | null {
  if (config.inputIndex >= config.input.length) return null;

  const symbol = config.input[config.inputIndex];
  const transitions = machine.transitions as DFATransition[];
  const t = transitions.find(
    tr => tr.from === config.currentStateId && tr.symbol === symbol
  );

  if (!t) return null; // no transition = reject

  return {
    currentStateId: t.to,
    inputIndex: config.inputIndex + 1,
    input: config.input,
    history: [...config.history, config],
  };
}

export function dfaIsAccepted(machine: Machine, config: DFAConfig): boolean {
  return (
    config.inputIndex >= config.input.length &&
    machine.acceptStateIds.includes(config.currentStateId)
  );
}

export function dfaIsRejected(machine: Machine, config: DFAConfig): boolean {
  if (config.inputIndex >= config.input.length) {
    return !machine.acceptStateIds.includes(config.currentStateId);
  }
  const symbol = config.input[config.inputIndex];
  const transitions = machine.transitions as DFATransition[];
  return !transitions.some(
    tr => tr.from === config.currentStateId && tr.symbol === symbol
  );
}

export function dfaInitialConfig(machine: Machine, input: string): DFAConfig | null {
  if (!machine.startStateId) return null;
  return {
    currentStateId: machine.startStateId,
    inputIndex: 0,
    input,
    history: [],
  };
}

export function dfaRunToEnd(machine: Machine, input: string): { accepted: boolean; steps: DFAConfig[] } {
  const init = dfaInitialConfig(machine, input);
  if (!init) return { accepted: false, steps: [] };

  const steps: DFAConfig[] = [init];
  let current = init;

  while (current.inputIndex < current.input.length) {
    const next = dfaStep(machine, current);
    if (!next) break;
    steps.push(next);
    current = next;
  }

  return {
    accepted: dfaIsAccepted(machine, current),
    steps,
  };
}
