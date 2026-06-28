import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MousePointer2, PlusCircle, Trash2, Undo2, Redo2 } from 'lucide-react';
import { Machine } from '../../machines/types';
import { useMachineStore } from '../../store/machineStore';
import { StateNode, StateNodeData } from './StateNode';
import { TransitionEdge, TransitionEdgeData } from './TransitionEdge';
import { TransitionManagerModal } from './TransitionManagerModal';
import { StateContextMenu } from './StateContextMenu';
import { clsx } from 'clsx';

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { transitionEdge: TransitionEdge };

type EditorMode = 'select' | 'addState' | 'delete';

function getEdgeLabel(machine: Machine, transition: Record<string, string>): string {
  if (machine.type === 'DFA' || machine.type === 'NFA') {
    return transition.symbol ?? '';
  } else if (machine.type === 'PDA') {
    return `${transition.inputSymbol},${transition.stackPop}/${transition.stackPush}`;
  } else {
    return `${transition.readSymbol}→${transition.writeSymbol},${transition.direction}`;
  }
}

interface Props {
  machine: Machine;
  activeStateIds?: Set<string>;
  acceptStateIds?: Set<string>;
  rejectStateIds?: Set<string>;
}

function MachineCanvasInner({ machine, activeStateIds, acceptStateIds, rejectStateIds }: Props) {
  const { addState, updateState, deleteState, deleteTransition, undo, redo, undoStack, redoStack } = useMachineStore();
  const { screenToFlowPosition } = useReactFlow();
  const [editorMode, setEditorMode] = useState<EditorMode>('select');

  const [transitionManager, setTransitionManager] = useState<{
    open: boolean;
    fromId: string;
    toId: string;
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    stateId: string;
  } | null>(null);

  const buildNodes = (mode: EditorMode): Node<StateNodeData>[] =>
    machine.states.map(s => ({
      id: s.id,
      type: 'stateNode',
      position: s.position,
      data: {
        label: s.label,
        isStart: s.isStart,
        isFinal: s.isFinal,
        isActive: activeStateIds?.has(s.id),
        isAccept: acceptStateIds?.has(s.id),
        isReject: rejectStateIds?.has(s.id),
        editorMode: mode,
      },
    }));

  const buildEdges = (mode: EditorMode): Edge<TransitionEdgeData>[] => {
    const groups = new Map<string, { transitions: Record<string, string>[]; ids: string[]; from: string; to: string }>();
    for (const tr of machine.transitions) {
      const t = tr as unknown as Record<string, string>;
      const key = `${t.from}||${t.to}`;
      if (!groups.has(key)) groups.set(key, { transitions: [], ids: [], from: t.from, to: t.to });
      groups.get(key)!.transitions.push(t);
      groups.get(key)!.ids.push(tr.id);
    }
    const edgeKeys = new Set(groups.keys());
    return [...groups.entries()].map(([key, g]) => {
      const reverseKey = `${g.to}||${g.from}`;
      const hasReverse = g.from !== g.to && edgeKeys.has(reverseKey);
      // Deterministic sign: lexicographic comparison gives consistent offsets
      const pathOffset = hasReverse ? (g.from < g.to ? 40 : -40) : 0;
      return {
        id: `edge-${key}`,
        source: g.from,
        target: g.to,
        type: 'transitionEdge',
        data: {
          label: g.transitions.map(t => getEdgeLabel(machine, t)).join('\n'),
          from: g.from,
          to: g.to,
          transitionIds: g.ids,
          machineId: machine.id,
          pathOffset,
          onOpenManager: (fromId: string, toId: string) => {
            if (mode !== 'delete') {
              setTransitionManager({ open: true, fromId, toId });
            }
          },
          onDeleteEdge: (machineId: string, ids: string[]) => {
            ids.forEach(id => deleteTransition(machineId, id));
          },
        },
      };
    });
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(editorMode));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(editorMode));

  useEffect(() => {
    setNodes(buildNodes(editorMode));
    setEdges(buildEdges(editorMode));
  }, [machine, activeStateIds, acceptStateIds, rejectStateIds, editorMode]);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    updateState(machine.id, node.id, { position: node.position });
  }, [machine.id, updateState]);

  const onPaneClick = useCallback((e: React.MouseEvent) => {
    setContextMenu(null);
    if (editorMode !== 'addState') return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const stateCount = machine.states.length;
    const newId = addState(machine.id, {
      label: `q${stateCount}`,
      isStart: stateCount === 0,
      isFinal: false,
      position: pos,
    });
    if (stateCount === 0) {
      useMachineStore.getState().updateMachine(machine.id, { startStateId: newId });
    }
  }, [editorMode, machine.id, machine.states.length, addState, screenToFlowPosition]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (editorMode === 'delete') {
      deleteState(machine.id, node.id);
    }
  }, [editorMode, machine.id, deleteState]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (editorMode === 'delete') return;
    setTransitionManager({
      open: true,
      fromId: connection.source,
      toId: connection.target,
    });
  }, [editorMode]);

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    if (editorMode !== 'delete') {
      setContextMenu({ x: e.clientX, y: e.clientY, stateId: node.id });
    }
  }, [editorMode]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
    <div className="flex-1 relative" style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={null}
        className={clsx(
          'bg-gray-50 dark:bg-gray-950',
          editorMode === 'addState' && 'cursor-crosshair',
          editorMode === 'delete' && 'cursor-not-allowed',
        )}
        panOnDrag={editorMode !== 'addState'}
        nodesDraggable={editorMode !== 'delete'}
        elementsSelectable={editorMode === 'select'}
      >
        <Background color="#9ca3af" gap={24} size={1} />
        <Controls />
        <MiniMap nodeColor="#6366f1" className="!bg-white dark:!bg-gray-800" />
      </ReactFlow>

      {/* Editor Mode Toolbar */}
      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-1 z-10">
        <ModeButton
          active={editorMode === 'select'}
          onClick={() => setEditorMode('select')}
          title="Select & Move (S)"
          icon={<MousePointer2 size={15} />}
        />
        <ModeButton
          active={editorMode === 'addState'}
          onClick={() => setEditorMode('addState')}
          title="Add State — click canvas (A)"
          icon={<PlusCircle size={15} />}
          activeColor="bg-blue-500 text-white"
        />
        <ModeButton
          active={editorMode === 'delete'}
          onClick={() => setEditorMode('delete')}
          title="Delete — click state/edge (D)"
          icon={<Trash2 size={15} />}
          activeColor="bg-red-500 text-white"
        />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-0.5" />
        <ModeButton
          active={false}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          icon={<Undo2 size={15} />}
        />
        <ModeButton
          active={false}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          icon={<Redo2 size={15} />}
        />
      </div>

      {/* Mode hint */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
        {editorMode === 'addState' && (
          <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">
            Click canvas to place state · Drag between states for transition
          </div>
        )}
        {editorMode === 'delete' && (
          <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">
            Click a state or edge to delete it
          </div>
        )}
        {editorMode === 'select' && (
          <div className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium opacity-70">
            Hover state edge → drag to connect · Click edge to manage transitions
          </div>
        )}
      </div>

      {transitionManager?.open && (
        <TransitionManagerModal
          open={transitionManager.open}
          onClose={() => setTransitionManager(null)}
          machine={machine}
          fromId={transitionManager.fromId}
          toId={transitionManager.toId}
        />
      )}

      {contextMenu && (
        <StateContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          machine={machine}
          stateId={contextMenu.stateId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  disabled,
  title,
  icon,
  activeColor = 'bg-gray-700 text-white',
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  icon: React.ReactNode;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
        active ? activeColor : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {icon}
    </button>
  );
}

export function MachineCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <MachineCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
