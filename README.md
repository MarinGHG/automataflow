# AutomataFlow

**Free, browser-based simulator for DFA, NFA, PDA, and Turing Machines.**

AutomataFlow is a visual tool for building and simulating finite automata, pushdown automata, and Turing machines — no installation, no Java, just a browser. It's built for students and instructors working through theoretical computer science / formal languages courses, as a lightweight alternative to desktop tools like JFLAP.

**Live app:** [automataflow.marinbenke.dev](https://automataflow.marinbenke.dev)

## Features

- **Visual state-machine editor** — drag states onto a canvas, connect them with transitions, built on [React Flow](https://reactflow.dev)
- **Four machine types** — Deterministic Finite Automata (DFA), Nondeterministic Finite Automata (NFA, with ε-transitions), Pushdown Automata (PDA), and Turing Machines (TM)
- **Step-by-step simulation** — run an input string and watch the active state(s), stack, or tape update at each step; step forward, step back, or auto-play at adjustable speed
- **NFA branching** and **PDA nondeterminism** are both visualized — all active states / stack branches are shown simultaneously
- **Formal definitions & transition tables** — every machine can show its formal 5/6/7-tuple definition and a generated transition table
- **Multiple machines, tabbed** — work on several automata side by side, each with its own undo/redo history
- **Autosaved locally** — your machines persist in the browser (`localStorage`), no account or backend required
- **Light/dark mode**, keyboard shortcuts (Ctrl/Cmd+Z / Ctrl/Cmd+Y for undo/redo)

## Getting started

Requires [Node.js](https://nodejs.org) 20+.

```bash
git clone https://github.com/MarinGHG/automataflow.git
cd automataflow
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

### Other scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build a production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Using it

1. Pick a machine type from the sidebar (**+ DFA / NFA / PDA / TM**) to create one.
2. Use the canvas toolbar (top-left) to switch between **Select**, **Add State**, and **Delete** modes.
3. Drag from one state's edge handle to another to create a transition — a dialog lets you set the symbol (or, for PDA/TM, the stack/tape behavior).
4. Set a machine's alphabet, start state, and accepting state(s) in the right-hand properties panel.
5. Type an input string in the simulation bar at the bottom and hit **Run**, or step through it manually.

Each new machine type starts with a worked example already loaded (e.g. a DFA that accepts strings ending in `ab`, a PDA for `aⁿbⁿ`) so you can see a working machine immediately.

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [React Flow](https://reactflow.dev) for the graph editor
- [Zustand](https://github.com/pmndrs/zustand) for state management (with `persist` for local autosave)
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Framer Motion](https://www.framer.com/motion/) for animation
- [Vite](https://vitejs.dev) for tooling, [Vitest](https://vitest.dev) for tests

The simulation engines (`src/machines/*.ts`) are plain, dependency-free TypeScript — no UI code — so they're straightforward to read, test, and reuse independently of the editor. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for an overview of how the pieces fit together.

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to get set up and what to expect from a pull request.

## License

AutomataFlow is licensed under the [GNU AGPL-3.0](LICENSE). If you run a modified version of this app as a network service, the AGPL requires you to make your modified source available to its users.

Built by [Marin Benke](https://marinbenke.dev).
