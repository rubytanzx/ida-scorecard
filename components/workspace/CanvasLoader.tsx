"use client";

import dynamic from "next/dynamic";
import type { Node } from "reactflow";

const WorkspaceCanvas = dynamic(() => import("./WorkspaceCanvas"), { ssr: false });

interface Props {
  nodes: Node[];
  orderedNodes: Node[];
  playActive: boolean;
  fitViewTrigger: number;
  focusTarget?: { id: string; seq: number } | null;
  loading?: boolean;
  nodesDraggable?: boolean;
  onCardSelect?: (id: string | null) => void;
  onNodesDelete?: (ids: string[]) => void;
}

export default function CanvasLoader({ nodes, orderedNodes, playActive, fitViewTrigger, focusTarget, loading, nodesDraggable = true, onCardSelect, onNodesDelete }: Props) {
  return (
    <WorkspaceCanvas
      nodes={nodes}
      orderedNodes={orderedNodes}
      playActive={playActive}
      fitViewTrigger={fitViewTrigger}
      focusTarget={focusTarget}
      loading={loading}
      nodesDraggable={nodesDraggable}
      onCardSelect={onCardSelect}
      onNodesDelete={onNodesDelete}
    />
  );
}
