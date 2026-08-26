# Contributing to AutomataFlow

Thanks for considering a contribution! This is a small project, so the process is kept simple.

## Setup

```bash
git clone https://github.com/MarinGHG/automataflow.git
cd automataflow
npm install
npm run dev
```

## Before opening a PR

Run the checks CI will run:

```bash
npx tsc --noEmit   # typecheck
npm test           # unit tests (Vitest)
npm run build      # production build
```

## Guidelines

- Keep pull requests focused — one fix or feature per PR is easier to review than several bundled together.
- If you change or add behavior in `src/machines/*.ts` (the DFA/NFA/PDA/TM simulation engines), add or update tests in `src/machines/__tests__/`. These engines are pure functions with no UI dependency, so they're the easiest and most valuable part of the codebase to test.
- Match the existing code style (see `src/` for examples) — no linter is configured yet, so please keep formatting consistent by eye.
- For UI changes, run `npm run dev` and click through the affected flow before submitting; there's no visual regression testing in CI.

## Reporting bugs / suggesting features

Open a [GitHub issue](https://github.com/MarinGHG/automataflow/issues) with:
- What you did
- What you expected to happen
- What happened instead (screenshots help for UI issues)

## License

By contributing, you agree that your contributions will be licensed under the project's [AGPL-3.0 license](LICENSE).
