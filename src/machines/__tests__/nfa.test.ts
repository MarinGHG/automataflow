import { describe, it, expect } from 'vitest';
import { nfaRunToEnd, epsilonClosure, nfaInitialConfig } from '../nfa';
import type { Machine } from '../types';

// NFA accepting strings containing "ab" as a substring
function makeContainsAB(): Machine {
  return {
    id: 'm2', name: 'contains-ab', type: 'NFA',
    alphabet: ['a', 'b'],
    stackAlphabet: [], tapeAlphabet: [], blankSymbol: '_',
    startStateId: 'q0', acceptStateIds: ['q2'], rejectStateId: null,
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false, position: { x: 0, y: 0 } },
      { id: 'q1', label: 'q1', isStart: false, isFinal: false, position: { x: 100, y: 0 } },
      { id: 'q2', label: 'q2', isStart: false, isFinal: true, position: { x: 200, y: 0 } },
    ],
    transitions: [
      { id: 't1', from: 'q0', to: 'q0', symbol: 'a' },
      { id: 't2', from: 'q0', to: 'q0', symbol: 'b' },
      { id: 't3', from: 'q0', to: 'q1', symbol: 'a' },
      { id: 't4', from: 'q1', to: 'q2', symbol: 'b' },
      { id: 't5', from: 'q2', to: 'q2', symbol: 'a' },
      { id: 't6', from: 'q2', to: 'q2', symbol: 'b' },
    ],
  };
}

// NFA with ε-transition: accepts "a" or "b" via epsilon split
function makeEpsilonNFA(): Machine {
  return {
    id: 'm3', name: 'eps-nfa', type: 'NFA',
    alphabet: ['a', 'b'],
    stackAlphabet: [], tapeAlphabet: [], blankSymbol: '_',
    startStateId: 'q0', acceptStateIds: ['q1', 'q2'], rejectStateId: null,
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false, position: { x: 0, y: 0 } },
      { id: 'q1', label: 'q1', isStart: false, isFinal: true, position: { x: 100, y: 0 } },
      { id: 'q2', label: 'q2', isStart: false, isFinal: true, position: { x: 100, y: 100 } },
    ],
    transitions: [
      { id: 't1', from: 'q0', to: 'q1', symbol: 'ε' },
      { id: 't2', from: 'q0', to: 'q2', symbol: 'ε' },
      { id: 't3', from: 'q1', to: 'q1', symbol: 'a' },
      { id: 't4', from: 'q2', to: 'q2', symbol: 'b' },
    ],
  };
}

describe('NFA — contains ab', () => {
  const m = makeContainsAB();
  it('accepts "ab"', () => expect(nfaRunToEnd(m, 'ab').accepted).toBe(true));
  it('accepts "aab"', () => expect(nfaRunToEnd(m, 'aab').accepted).toBe(true));
  it('accepts "abb"', () => expect(nfaRunToEnd(m, 'abb').accepted).toBe(true));
  it('rejects "a"', () => expect(nfaRunToEnd(m, 'a').accepted).toBe(false));
  it('rejects "ba"', () => expect(nfaRunToEnd(m, 'ba').accepted).toBe(false));
  it('rejects ""', () => expect(nfaRunToEnd(m, '').accepted).toBe(false));
});

describe('NFA — epsilon closure', () => {
  const m = makeEpsilonNFA();

  it('closure of {q0} = {q0,q1,q2}', () => {
    const c = epsilonClosure(m, new Set(['q0']));
    expect(c.has('q0')).toBe(true);
    expect(c.has('q1')).toBe(true);
    expect(c.has('q2')).toBe(true);
  });

  it('accepts "" (start state in closure of accept states)', () => {
    expect(nfaRunToEnd(m, '').accepted).toBe(true);
  });

  it('accepts "aaa"', () => expect(nfaRunToEnd(m, 'aaa').accepted).toBe(true));
  it('accepts "bbb"', () => expect(nfaRunToEnd(m, 'bbb').accepted).toBe(true));
});
