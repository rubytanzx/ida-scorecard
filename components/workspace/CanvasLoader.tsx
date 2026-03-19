"use client";

import dynamic from "next/dynamic";
import type { Node } from "reactflow";

const WorkspaceCanvas = dynamic(() => import("./WorkspaceCanvas"), { ssr: false });

interface Props {
  nodes: Node[];
  orderedNodes: Node[];
  playActive: boolean;
  fitViewTrigger: number;
  loading?: boolean;
  nodesDraggable?: boolean;
  onCardSelect?: (id: string | null) => void;
}

export default function CanvasLoader({ nodes, orderedNodes, playActive, fitViewTrigger, loading, nodesDraggable = true, onCardSelect }: Props) {
  return (
    <WorkspaceCanvas
      nodes={nodes}
      orderedNodes={orderedNodes}
      playActive={playActive}
      fitViewTrigger={fitViewTrigger}
      loading={loading}
      nodesDraggable={nodesDraggable}
      onCardSelect={onCardSelect}
    />
  );
}
