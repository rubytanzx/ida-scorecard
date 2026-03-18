"use client";

import dynamic from "next/dynamic";
import type { Node } from "reactflow";

const WorkspaceCanvas = dynamic(() => import("./WorkspaceCanvas"), { ssr: false });

interface Props {
  nodes: Node[];
  fitViewTrigger: number;
  loading?: boolean;
  onCardSelect?: (id: string | null) => void;
}

export default function CanvasLoader({ nodes, fitViewTrigger, loading, onCardSelect }: Props) {
  return <WorkspaceCanvas nodes={nodes} fitViewTrigger={fitViewTrigger} loading={loading} onCardSelect={onCardSelect} />;
}
