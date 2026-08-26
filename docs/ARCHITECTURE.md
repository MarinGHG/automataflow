# Architecture

A quick orientation for anyone reading or modifying the codebase.

## Layout

```
src/
  machines/          Simulation engines — pure TypeScript, no React
    types.ts         Shared types: Machine, State, Transition variants, per-type SimConfig
    dfa.ts / nfa.ts / pda.ts / tm.ts
    __tests__/       Vitest unit tests for the engines
  store/
    machineStore.ts  Zustand store: all machines, tabs, undo/redo, dark mode (persisted to localStorage)
  components/
    Editor/          Canvas (React Flow), properties panel, transition editing modals
    Simulation/       Step-through simulation controls, tape/stack visualizations
    Grammar/          Formal definition / transition table / grammar-rule views
    Tabs/             Multi-machine tab bar
    UI/               Small shared primitives (Button, Modal)
  App.tsx             Top-level layout: header, sidebar, tabs, editor, footer
  analytics.ts        Thin OpenPanel wrapper for anonymous usage analytics
```

## Data model

A `Machine` (`src/machines/types.ts`) holds states, transitions, its alphabet(s), and its start/accept/reject state ids. Every machine type shares this one `Machine` shape — the `type` field (`'DFA' | 'NFA' | 'PDA' | 'TM'`) determines how `transitions` is interpreted:

- **DFA/NFA** transitions carry a single `symbol` (NFA also allows `'ε'`)
- **PDA** transitions carry `inputSymbol` / `stackPop` / `stackPush`
- **TM** transitions carry `readSymbol` / `writeSymbol` / `direction`

Because the transition shape is type-specific, a machine's `transitions` are only meaningful for its current `type` — switching a machine's type (via the properties panel) clears its transitions rather than trying to reinterpret them.

## Simulation engines

Each of `dfa.ts`, `nfa.ts`, `pda.ts`, `tm.ts` exposes the same small interface:

- `xInitialConfig(machine, input)` — build the starting configuration for a given input string
- `xStep(machine, config)` — advance one step, or return `null` when no transition applies
- `xIsAccepted(machine, config)` — whether the current configuration is accepting
- `xRunToEnd(machine, input, maxSteps?)` — run to completion (or a step cap, for PDA/TM which can loop)

NFA and PDA simulation track *all* simultaneously-active states/branches (via epsilon-closure and branch-forking respectively) rather than picking one nondeterministic path, so the UI can show the full set of possibilities at each step.

`SimulationPanel` (in `components/Simulation/`) is the only place that calls into these engines from the UI — it owns the current run's config, drives play/pause/step, and reports the active/accept/reject state ids back up to `MachineCanvas` for highlighting.

## State management

`useMachineStore` (Zustand) is the single source of truth for all machines and UI-adjacent state (open tabs, dark mode). Structural edits (add/delete/update state or transition, add/delete machine) push the previous `machines` array onto an undo stack; `undo`/`redo` pop between stacks. The store is persisted to `localStorage` under the key `automata-studio-storage`, minus transient simulation state (which lives locally in `SimulationPanel`, not the store).
