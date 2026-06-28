import React, { useState } from 'react';
import { Machine, DFATransition, NFATransition, PDATransition, TMTransition } from '../../machines/types';
import { clsx } from 'clsx';

interface Props {
  machine: Machine;
}

function buildTransitionTable(machine: Machine): { headers: string[]; rows: string[][] } {
  if (machine.type === 'DFA' || machine.type === 'NFA') {
    const symbols = machine.type === 'DFA'
      ? machine.alphabet
      : [...machine.alphabet, 'ε'];
    const headers = ['State', ...symbols];
    const rows = machine.states.map(state => {
      const row: string[] = [
        `${state.isStart ? '→' : ''}${state.isFinal ? '*' : ''}${state.label}`,
      ];
      for (const sym of symbols) {
        const transitions = (machine.transitions as (DFATransition | NFATransition)[])
          .filter(t => t.from === state.id && t.symbol === sym);
        if (transitions.length === 0) {
          row.push('—');
        } else {
          const targets = transitions.map(t => machine.states.find(s => s.id === t.to)?.label ?? '?');
          row.push(machine.type === 'NFA' ? `{${targets.join(', ')}}` : targets[0]);
        }
      }
      return row;
    });
    return { headers, rows };
  } else if (machine.type === 'PDA') {
    const headers = ['State', 'Input', 'Stack', 'Next State', 'Push'];
    const rows = (machine.transitions as PDATransition[]).map(t => {
      const from = machine.states.find(s => s.id === t.from)?.label ?? '?';
      const to = machine.states.find(s => s.id === t.to)?.label ?? '?';
      return [from, t.inputSymbol, t.stackPop, to, t.stackPush];
    });
    return { headers, rows };
  } else {
    const headers = ['State', 'Read', 'Write', 'Move', 'Next State'];
    const rows = (machine.transitions as TMTransition[]).map(t => {
      const from = machine.states.find(s => s.id === t.from)?.label ?? '?';
      const to = machine.states.find(s => s.id === t.to)?.label ?? '?';
      return [from, t.readSymbol, t.writeSymbol, t.direction, to];
    });
    return { headers, rows };
  }
}

function buildFormalDefinition(machine: Machine): string {
  const Q = `Q = {${machine.states.map(s => s.label).join(', ')}}`;
  const Sigma = `Σ = {${machine.alphabet.join(', ')}}`;
  const q0 = `q₀ = ${machine.states.find(s => s.id === machine.startStateId)?.label ?? '?'}`;
  const F = `F = {${machine.acceptStateIds.map(id => machine.states.find(s => s.id === id)?.label ?? '?').join(', ')}}`;

  if (machine.type === 'DFA') {
    return `M = (Q, Σ, δ, q₀, F)\n${Q}\n${Sigma}\nδ: Q × Σ → Q (see table)\n${q0}\n${F}`;
  } else if (machine.type === 'NFA') {
    return `M = (Q, Σ, δ, q₀, F)\n${Q}\n${Sigma}\nδ: Q × (Σ ∪ {ε}) → P(Q) (see table)\n${q0}\n${F}`;
  } else if (machine.type === 'PDA') {
    const Gamma = `Γ = {${machine.stackAlphabet.join(', ')}}`;
    return `M = (Q, Σ, Γ, δ, q₀, F)\n${Q}\n${Sigma}\n${Gamma}\nδ: Q × (Σ∪{ε}) × (Γ∪{ε}) → P(Q × Γ*)\n${q0}\n${F}`;
  } else {
    const Gamma = `Γ = {${machine.tapeAlphabet.join(', ')}}`;
    const blank = `b = '${machine.blankSymbol}'`;
    const qr = `q_reject = ${machine.rejectStateId ? machine.states.find(s => s.id === machine.rejectStateId)?.label ?? '?' : 'none'}`;
    return `M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)\n${Q}\n${Sigma}\n${Gamma}\n${blank}\nδ: Q × Γ → Q × Γ × {L,R,S}\n${q0}\n${F}\n${qr}`;
  }
}

function buildGrammarRules(machine: Machine): string[] {
  if (machine.type === 'DFA' || machine.type === 'NFA') {
    const rules: string[] = [];
    const startLabel = machine.states.find(s => s.id === machine.startStateId)?.label ?? 'S';
    rules.push(`Start symbol: ${startLabel}`);
    for (const tr of machine.transitions as (DFATransition | NFATransition)[]) {
      const from = machine.states.find(s => s.id === tr.from)?.label ?? '?';
      const to = machine.states.find(s => s.id === tr.to)?.label ?? '?';
      if (tr.symbol === 'ε') {
        rules.push(`${from} → ${to}`);
      } else {
        rules.push(`${from} → ${tr.symbol}${to}`);
      }
    }
    for (const id of machine.acceptStateIds) {
      const label = machine.states.find(s => s.id === id)?.label ?? '?';
      rules.push(`${label} → ε`);
    }
    return rules;
  } else if (machine.type === 'PDA') {
    return [
      'Context-Free Grammar derivation requires specific PDA construction.',
      'This PDA recognizes a context-free language.',
      'For each transition δ(p, a, A) = (q, γ):',
      '  Production: (p,A,q) → a(p,γ₁,r₁)(r₁,γ₂,r₂)...(r_{k-1},γ_k,q)',
      'For each state q:',
      '  Production: (q,ε,q) → ε',
    ];
  } else {
    return [
      'Turing Machines recognize recursively enumerable (Type-0) languages.',
      'Corresponding unrestricted grammar has productions of the form:',
      '  α → β where α,β ∈ (V ∪ T)*  and |α| ≥ 1',
      'Each TM transition δ(q,a) = (p,b,D) maps to a grammar production.',
      'The generated language is: L(G) = L(M)',
    ];
  }
}

export function GrammarPanel({ machine }: Props) {
  const [activeTab, setActiveTab] = useState<'formal' | 'table' | 'grammar'>('formal');
  const { headers, rows } = buildTransitionTable(machine);
  const formalDef = buildFormalDefinition(machine);
  const grammarRules = buildGrammarRules(machine);

  return (
    <div className="h-full flex flex-col text-sm">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['formal', 'table', 'grammar'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {tab === 'formal' ? 'Formal Definition' : tab === 'table' ? 'Transition Table' : 'Grammar Rules'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'formal' && (
          <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {formalDef}
          </pre>
        )}

        {activeTab === 'table' && (
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="border border-gray-300 dark:border-gray-600 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {row.map((cell, j) => (
                      <td key={j} className="border border-gray-300 dark:border-gray-600 px-3 py-1.5 font-mono text-gray-600 dark:text-gray-400">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'grammar' && (
          <div className="space-y-1">
            {grammarRules.map((rule, i) => (
              <div key={i} className="font-mono text-xs text-gray-700 dark:text-gray-300">{rule}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
