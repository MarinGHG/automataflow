import { Machine, PDATransition, PDAConfig, PDABranch } from './types';

function cloneBranch(b: PDABranch): PDABranch {
  return { stateId: b.stateId, stack: [...b.stack], inputIndex: b.inputIndex };
}

export function pdaStep(machine: Machine, config: PDAConfig): PDAConfig | null {
  const transitions = machine.transitions as PDATransition[];
  const newBranches: PDABranch[] = [];

  for (const branch of config.branches) {
    const inputSymbol = branch.inputIndex < config.input.length
      ? config.input[branch.inputIndex]
      : null;
    const stackTop = branch.stack.length > 0 ? branch.stack[branch.stack.length - 1] : null;

    // Find applicable transitions
    const applicable = transitions.filter(t => {
      if (t.from !== branch.stateId) return false;
      // input check
      if (t.inputSymbol !== 'ε' && t.inputSymbol !== inputSymbol) return false;
      // stack check
      if (t.stackPop !== 'ε' && t.stackPop !== stackTop) return false;
      return true;
    });

    for (const t of applicable) {
      const newBranch = cloneBranch(branch);
      // consume input if not epsilon
      if (t.inputSymbol !== 'ε') newBranch.inputIndex++;
      // pop if not epsilon
      if (t.stackPop !== 'ε') newBranch.stack.pop();
      // push if not epsilon (push in reverse order so first char is on top)
      if (t.stackPush !== 'ε') {
        const pushSymbols = t.stackPush.split('').reverse();
        for (const s of pushSymbols) {
          newBranch.stack.push(s);
        }
      }
      newBranch.stateId = t.to;
      newBranches.push(newBranch);
    }
  }

  if (newBranches.length === 0) return null;

  // Deduplicate branches
  const seen = new Set<string>();
  const dedupedBranches = newBranches.filter(b => {
    const key = `${b.stateId}:${b.inputIndex}:${b.stack.join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    branches: dedupedBranches,
    input: config.input,
    step: config.step + 1,
    history: [...config.history, { ...config, history: [] }],
  };
}

export function pdaIsAccepted(machine: Machine, config: PDAConfig): boolean {
  return config.branches.some(
    b => b.inputIndex >= config.input.length && machine.acceptStateIds.includes(b.stateId)
  );
}

export function pdaInitialConfig(machine: Machine, input: string): PDAConfig | null {
  if (!machine.startStateId) return null;
  // Always seed the stack with Z (bottom-of-stack marker)
  return {
    branches: [{ stateId: machine.startStateId, stack: ['Z'], inputIndex: 0 }],
    input,
    step: 0,
    history: [],
  };
}

export function pdaRunToEnd(machine: Machine, input: string, maxSteps = 1000): { accepted: boolean; steps: PDAConfig[] } {
  const init = pdaInitialConfig(machine, input);
  if (!init) return { accepted: false, steps: [] };

  const steps: PDAConfig[] = [init];
  let current = init;

  for (let i = 0; i < maxSteps; i++) {
    if (pdaIsAccepted(machine, current)) break;
    const next = pdaStep(machine, current);
    if (!next) break;
    steps.push(next);
    current = next;
  }

  return {
    accepted: pdaIsAccepted(machine, current),
    steps,
  };
}
