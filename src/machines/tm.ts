import { Machine, TMTransition, TMConfig } from './types';

function cloneTape(tape: Map<number, string>): Map<number, string> {
  return new Map(tape);
}

function cloneConfig(c: TMConfig): TMConfig {
  return {
    ...c,
    tape: cloneTape(c.tape),
    history: [],
  };
}

export function tmStep(machine: Machine, config: TMConfig): TMConfig | null {
  if (config.halted) return null;

  const transitions = machine.transitions as TMTransition[];
  const currentSymbol = config.tape.get(config.head) ?? machine.blankSymbol;

  const t = transitions.find(
    tr => tr.from === config.stateId && tr.readSymbol === currentSymbol
  );

  if (!t) {
    // No transition: implicit reject
    return {
      ...config,
      tape: cloneTape(config.tape),
      halted: true,
      accepted: machine.acceptStateIds.includes(config.stateId),
      step: config.step + 1,
      history: [...config.history, cloneConfig(config)],
    };
  }

  const newTape = cloneTape(config.tape);
  newTape.set(config.head, t.writeSymbol);

  let newHead = config.head;
  if (t.direction === 'L') newHead--;
  else if (t.direction === 'R') newHead++;

  const newStateId = t.to;
  const isAccept = machine.acceptStateIds.includes(newStateId);
  const isReject = machine.rejectStateId === newStateId;
  const halted = isAccept || isReject;

  return {
    stateId: newStateId,
    tape: newTape,
    head: newHead,
    input: config.input,
    step: config.step + 1,
    halted,
    accepted: isAccept,
    history: [...config.history, cloneConfig(config)],
  };
}

export function tmInitialConfig(machine: Machine, input: string): TMConfig | null {
  if (!machine.startStateId) return null;

  const tape = new Map<number, string>();
  for (let i = 0; i < input.length; i++) {
    tape.set(i, input[i]);
  }

  return {
    stateId: machine.startStateId,
    tape,
    head: 0,
    input,
    step: 0,
    halted: false,
    accepted: false,
    history: [],
  };
}

export function tmRunToEnd(machine: Machine, input: string, maxSteps = 10000): { accepted: boolean; steps: TMConfig[] } {
  const init = tmInitialConfig(machine, input);
  if (!init) return { accepted: false, steps: [] };

  const steps: TMConfig[] = [init];
  let current = init;

  while (!current.halted && current.step < maxSteps) {
    const next = tmStep(machine, current);
    if (!next) break;
    steps.push(next);
    current = next;
  }

  return {
    accepted: current.accepted || machine.acceptStateIds.includes(current.stateId),
    steps,
  };
}
