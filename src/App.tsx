import React, { useEffect, useState } from 'react';
import { useMachineStore } from './store/machineStore';
import { TabBar } from './components/Tabs/TabBar';
import { MachineEditor } from './components/Editor/MachineEditor';
import { Modal } from './components/UI/Modal';
import { Moon, Sun, Info } from 'lucide-react';

const CREDITS = [
  { name: 'React Flow', url: 'https://reactflow.dev', desc: 'Interactive graph editor' },
  { name: 'React', url: 'https://react.dev', desc: 'UI framework' },
  { name: 'Zustand', url: 'https://github.com/pmndrs/zustand', desc: 'State management' },
  { name: 'Framer Motion', url: 'https://www.framer.com/motion/', desc: 'Animations' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com', desc: 'Utility-first styling' },
  { name: 'Vite', url: 'https://vitejs.dev', desc: 'Build tooling' },
  { name: 'Lucide', url: 'https://lucide.dev', desc: 'Open-source icons' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org', desc: 'Type safety' },
];

function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="About AutomataFlow">
      <div className="space-y-5 text-sm">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          AutomataFlow is a browser-based simulator for finite automata, pushdown automata, and Turing machines — designed for teaching and exploring theoretical computer science.
        </p>

        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Built with open-source software
          </div>
          <div className="space-y-1.5">
            {CREDITS.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-32 text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs flex-shrink-0"
                >
                  {c.name}
                </a>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1">
          <div>Special thanks to the React Flow team for their exceptional graph editor library.</div>
          <div>
            Built by{' '}
            <a href="https://marinbenke.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Marin Benke
            </a>
            {' '}· Licensed under{' '}
            <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              AGPL-3.0
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Sidebar() {
  const { machines, openTab, addMachine, activeTabMachineId } = useMachineStore();

  const typeBadge: Record<string, string> = {
    DFA: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20',
    NFA: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
    PDA: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20',
    TM:  'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
  };

  return (
    <div className="w-56 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
          New Machine
        </div>
        <div className="grid grid-cols-2 gap-1">
          {(['DFA', 'NFA', 'PDA', 'TM'] as const).map(type => (
            <button
              key={type}
              onClick={() => addMachine(type)}
              className={`text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${typeBadge[type]} hover:opacity-80`}
            >
              + {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 pt-1 pb-1.5">
          Machines
        </div>
        {machines.map(machine => (
          <button
            key={machine.id}
            onClick={() => openTab(machine.id)}
            className={`w-full text-left px-2 py-2 rounded-md text-xs transition-colors flex items-center gap-2 ${
              activeTabMachineId === machine.id
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${typeBadge[machine.type]}`}>
              {machine.type}
            </span>
            <span className="truncate">{machine.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-700">
      <div className="text-center space-y-3 max-w-xs">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 text-gray-300 dark:text-gray-600" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="16" r="5" />
            <circle cx="24" cy="8" r="5" />
            <circle cx="24" cy="24" r="5" />
            <path d="M13 16h6" strokeLinecap="round" />
            <path d="M13 14l6-4" strokeLinecap="round" />
            <path d="M13 18l6 4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-500">No machine open</div>
          <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">Select from the sidebar or create a new machine</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { darkMode, toggleDarkMode, machines, activeTabMachineId } = useMachineStore();
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const activeMachine = machines.find(m => m.id === activeTabMachineId);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-gray-950 text-white border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 flex-shrink-0" stroke="currentColor" strokeWidth="1.5">
            <circle cx="5" cy="12" r="3" className="text-blue-400" stroke="#60a5fa" />
            <circle cx="19" cy="5" r="3" className="text-violet-400" stroke="#a78bfa" />
            <circle cx="19" cy="19" r="3" className="text-violet-400" stroke="#a78bfa" />
            <path d="M8 12h8" stroke="#9ca3af" strokeLinecap="round" />
            <path d="M8 10.5l7-4" stroke="#9ca3af" strokeLinecap="round" />
            <path d="M8 13.5l7 4" stroke="#9ca3af" strokeLinecap="round" />
          </svg>
          <span className="text-base font-semibold tracking-tight">AutomataFlow</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAboutOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Info size={13} />
            About
          </button>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <TabBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {activeMachine ? (
            <MachineEditor key={activeMachine.id} machine={activeMachine} />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-1 py-1.5 bg-gray-950 border-t border-gray-800 text-[10px] text-gray-600 flex-shrink-0">
        <span>Made with</span>
        <span className="text-red-500">♥</span>
        <span>by</span>
        <a
          href="https://marinbenke.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors underline underline-offset-2"
        >
          Marin Benke
        </a>
        <span className="mx-1.5 text-gray-800">·</span>
        <span>Open source under</span>
        <a
          href="https://www.gnu.org/licenses/agpl-3.0.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors underline underline-offset-2 ml-0.5"
        >
          AGPL-3.0
        </a>
      </footer>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
