import { describe, it, expect } from 'vitest';
import { dfaRunToEnd, dfaInitialConfig, dfaIsAccepted, dfaIsRejected } from '../dfa';
import type { Machine } from '../types';

// DFA accepting strings over {a,b} that end in 'a'
function makeEndInA(): Machine {
  return {
    id: 'm1', name: 'end-in-a', type: 'DFA',
    alphabet: ['a', 'b'],
    stackAlphabet: [], tapeAlphabet: [], blankSymbol: '_',
    startStateId: 'q0', acceptStateIds: ['q1'], rejectStateId: null,
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false, position: { x: 0, y: 0 } },
      { id: 'q1', label: 'q1', isStart: false, isFinal: true, position: { x: 100, y: 0 } },
    ],
    transitions: [
      { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
      { id: 't2', from: 'q0', to: 'q0', symbol: 'b' },
      { id: 't3', from: 'q1', to: 'q1', symbol: 'a' },
      { id: 't4', from: 'q1', to: 'q0', symbol: 'b' },
    ],
  };
}

describe('DFA — ends in a', () => {
  const m = makeEndInA();

  it('accepts "a"', () => expect(dfaRunToEnd(m, 'a').accepted).toBe(true));
  it('accepts "ba"', () => expect(dfaRunToEnd(m, 'ba').accepted).toBe(true));
  it('accepts "bba"', () => expect(dfaRunToEnd(m, 'bba').accepted).toBe(true));
  it('rejects ""', () => expect(dfaRunToEnd(m, '').accepted).toBe(false));
  it('rejects "b"', () => expect(dfaRunToEnd(m, 'b').accepted).toBe(false));
  it('rejects "ab"', () => expect(dfaRunToEnd(m, 'ab').accepted).toBe(false));

  it('no start state → no config', () => {
    const bad = { ...m, startStateId: null };
    expect(dfaInitialConfig(bad, 'a')).toBeNull();
  });

  it('dfaIsRejected on dead end', () => {
    const cfg = dfaInitialConfig(m, 'c')!;
    expect(dfaIsRejected(m, cfg)).toBe(true);
  });
});
