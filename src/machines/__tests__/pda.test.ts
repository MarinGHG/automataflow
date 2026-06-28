import { describe, it, expect } from 'vitest';
import { pdaRunToEnd, pdaInitialConfig } from '../pda';
import type { Machine } from '../types';

// PDA for a^n b^n (n>=1) using Z as bottom-of-stack marker
function makeAnBn(): Machine {
  return {
    id: 'm4', name: 'anbn', type: 'PDA',
    alphabet: ['a', 'b'],
    stackAlphabet: ['a', 'Z'],
    tapeAlphabet: [], blankSymbol: '_',
    startStateId: 'q0', acceptStateIds: ['q3'], rejectStateId: null,
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false, position: { x: 0, y: 0 } },
      { id: 'q1', label: 'q1', isStart: false, isFinal: false, position: { x: 100, y: 0 } },
      { id: 'q2', label: 'q2', isStart: false, isFinal: false, position: { x: 200, y: 0 } },
      { id: 'q3', label: 'q3', isStart: false, isFinal: true, position: { x: 300, y: 0 } },
    ],
    transitions: [
      // q0 --a, Z/aZ--> q1  (first 'a': push a on Z)
      { id: 't1', from: 'q0', to: 'q1', inputSymbol: 'a', stackPop: 'Z', stackPush: 'aZ' },
      // q1 --a, a/aa--> q1  (more a's: push another a)
      { id: 't2', from: 'q1', to: 'q1', inputSymbol: 'a', stackPop: 'a', stackPush: 'aa' },
      // q1 --b, a/ε--> q2  (first 'b': pop one a)
      { id: 't3', from: 'q1', to: 'q2', inputSymbol: 'b', stackPop: 'a', stackPush: 'ε' },
      // q2 --b, a/ε--> q2  (more b's: keep popping a)
      { id: 't4', from: 'q2', to: 'q2', inputSymbol: 'b', stackPop: 'a', stackPush: 'ε' },
      // q2 --ε, Z/ε--> q3  (stack bottom Z seen: accept)
      { id: 't5', from: 'q2', to: 'q3', inputSymbol: 'ε', stackPop: 'Z', stackPush: 'ε' },
    ],
  };
}

describe('PDA — aⁿbⁿ', () => {
  const m = makeAnBn();

  it('accepts "ab"', () => expect(pdaRunToEnd(m, 'ab').accepted).toBe(true));
  it('accepts "aabb"', () => expect(pdaRunToEnd(m, 'aabb').accepted).toBe(true));
  it('accepts "aaabbb"', () => expect(pdaRunToEnd(m, 'aaabbb').accepted).toBe(true));
  it('rejects ""', () => expect(pdaRunToEnd(m, '').accepted).toBe(false));
  it('rejects "a"', () => expect(pdaRunToEnd(m, 'a').accepted).toBe(false));
  it('rejects "b"', () => expect(pdaRunToEnd(m, 'b').accepted).toBe(false));
  it('rejects "aab"', () => expect(pdaRunToEnd(m, 'aab').accepted).toBe(false));
  it('rejects "abb"', () => expect(pdaRunToEnd(m, 'abb').accepted).toBe(false));
  it('rejects "ba"', () => expect(pdaRunToEnd(m, 'ba').accepted).toBe(false));

  it('initial stack contains Z', () => {
    const cfg = pdaInitialConfig(m, 'ab')!;
    expect(cfg.branches[0].stack).toEqual(['Z']);
  });

  it('no start state → null', () => {
    expect(pdaInitialConfig({ ...m, startStateId: null }, 'ab')).toBeNull();
  });
});
