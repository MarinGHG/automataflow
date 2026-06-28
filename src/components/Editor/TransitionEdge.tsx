import React, { memo, useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { X } from 'lucide-react';

export interface TransitionEdgeData {
  label: string;
  from: string;
  to: string;
  transitionIds: string[];
  machineId: string;
  pathOffset: number;
  onOpenManager: (fromId: string, toId: string) => void;
  onDeleteEdge: (machineId: string, ids: string[]) => void;
}

/**
 * Canonical perpendicular: always computed from the geometrically "smaller"
 * endpoint so both directions of a bidirectional pair share the same perp axis.
 * Then +offset and -offset land on opposite sides regardless of edge direction.
 */
function computeOffsetPath(
  sourceX: number, sourceY: number,
  targetX: number, targetY: number,
  offset: number
): { path: string; labelX: number; labelY: number } {
  // Canonical: from leftmost (or topmost if same x)
  const flip =
    targetX < sourceX ||
    (targetX === sourceX && targetY < sourceY);
  const [cx1, cy1, cx2, cy2] = flip
    ? [targetX, targetY, sourceX, sourceY]
    : [sourceX, sourceY, targetX, targetY];

  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // CCW perpendicular of canonical direction
  const nx = -dy / len;
  const ny = dx / len;

  const midX = (sourceX + targetX) / 2 + nx * offset;
  const midY = (sourceY + targetY) / 2 + ny * offset;

  const path = `M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`;
  // Point at t=0.5 of quadratic bezier
  const labelX = 0.25 * sourceX + 0.5 * midX + 0.25 * targetX;
  const labelY = 0.25 * sourceY + 0.5 * midY + 0.25 * targetY;

  return { path, labelX, labelY };
}

export const TransitionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  source,
  target,
}: EdgeProps<TransitionEdgeData>) => {
  const [hovered, setHovered] = useState(false);
  const isSelfLoop = source === target;
  const markerId = `arrow-${id}`;
  const color = selected ? '#3b82f6' : hovered ? '#8b5cf6' : '#6b7280';
  const offset = data?.pathOffset ?? 0;
  const strokeWidth = hovered || selected ? 2 : 1.5;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data?.onOpenManager(data.from, data.to);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data) data.onDeleteEdge(data.machineId, data.transitionIds);
  };

  const markerEl = (
    <defs>
      <marker
        id={markerId}
        markerWidth="10"
        markerHeight="10"
        refX="8"
        refY="3"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path d="M 0 0 L 0 6 L 9 3 z" fill={color} />
      </marker>
    </defs>
  );

  // Self-loop: smooth arch above the node
  if (isSelfLoop) {
    const path = `M ${sourceX} ${sourceY} C ${sourceX + 40} ${sourceY - 90} ${targetX - 40} ${targetY - 90} ${targetX} ${targetY}`;
    const labelX = (sourceX + targetX) / 2;
    const labelY = sourceY - 100;

    return (
      <>
        {markerEl}
        <path d={path} fill="none" stroke="transparent" strokeWidth={14} style={{ cursor: 'pointer' }}
          onClick={handleClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} />
        <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth}
          markerEnd={`url(#${markerId})`} style={{ pointerEvents: 'none' }} />
        <EdgeLabelRenderer>
          <div style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
            className="flex items-center gap-1"
            onClick={handleClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <EdgeLabel label={data?.label ?? ''} hovered={hovered} selected={selected} />
            {(hovered || selected) && <DeleteBtn onClick={handleDelete} />}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }

  // Offset or straight edge
  let path: string;
  let labelX: number;
  let labelY: number;

  if (offset !== 0) {
    ({ path, labelX, labelY } = computeOffsetPath(sourceX, sourceY, targetX, targetY, offset));
  } else {
    const [bp, lx, ly] = getBezierPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      curvature: 0.2,
    });
    path = bp;
    labelX = lx;
    labelY = ly;
  }

  return (
    <>
      {markerEl}
      <path d={path} fill="none" stroke="transparent" strokeWidth={14} style={{ cursor: 'pointer' }}
        onClick={handleClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} />
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`} style={{ pointerEvents: 'none' }} />
      <EdgeLabelRenderer>
        <div style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
          className="flex items-center gap-1"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onClick={handleClick}>
          <EdgeLabel label={data?.label ?? ''} hovered={hovered} selected={selected} />
          {(hovered || selected) && <DeleteBtn onClick={handleDelete} />}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

function EdgeLabel({ label, hovered, selected }: { label: string; hovered: boolean; selected?: boolean }) {
  return (
    <div className={`text-xs px-1.5 py-0.5 rounded border font-mono whitespace-pre cursor-pointer shadow-sm transition-colors ${
      hovered || selected
        ? 'bg-white dark:bg-gray-800 border-violet-400 text-violet-700 dark:text-violet-400'
        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
    }`}>
      {label}
    </div>
  );
}

function DeleteBtn({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick}
      className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0">
      <X size={9} />
    </button>
  );
}

TransitionEdge.displayName = 'TransitionEdge';
