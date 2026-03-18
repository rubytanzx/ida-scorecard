"use client";

import { useEffect } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  useNodesState,
  useReactFlow,
} from "reactflow";
import type { Node } from "reactflow";
import "reactflow/dist/style.css";
import { OverviewCard } from "@/components/cards/OverviewCard";
import { NarrativeCard } from "@/components/cards/NarrativeCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { OutcomeAreaCard } from "@/components/cards/OutcomeAreaCard";
import { DataCard } from "@/components/cards/DataCard";

const nodeTypes = {
  overview: OverviewCard,
  narrative: NarrativeCard,
  news: NewsCard,
  outcomeArea: OutcomeAreaCard,
  dataCard: DataCard,
};

interface Props {
  nodes: Node[];
  fitViewTrigger: number;
  loading?: boolean;
  onCardSelect?: (id: string | null) => void;
}

function FitViewTrigger({ trigger }: { trigger: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (trigger > 0) {
      fitView({ padding: 0.3, duration: 400 });
    }
  }, [trigger, fitView]);
  return null;
}

export default function WorkspaceCanvas({ nodes: externalNodes, fitViewTrigger, loading, onCardSelect }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  // Add new nodes from external without resetting drag positions
  useEffect(() => {
    setNodes((prev) => {
      const prevIds = new Set(prev.map((n) => n.id));
      const newNodes = externalNodes.filter((n) => !prevIds.has(n.id));
      if (newNodes.length === 0) return prev;
      return [...prev, ...newNodes];
    });
  }, [externalNodes, setNodes]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {loading && (
        <div
          className="canvas-loading-pulse"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(11,111,211,0.22) 0%, rgba(11,111,211,0.08) 40%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2}
        panOnScroll={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        selectionOnDrag={false}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        style={{ background: "#FFFFFF", width: "100%", height: "100%" }}
        onSelectionChange={({ nodes: selected }) => {
          const hit = selected.find((n) => n.selected);
          onCardSelect?.(hit?.id ?? null);
        }}
        onPaneClick={() => onCardSelect?.(null)}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={27}
          size={2}
          color="#BDBDBD"
          style={{ opacity: 0.31 }}
        />
        <FitViewTrigger trigger={fitViewTrigger} />
      </ReactFlow>
    </div>
  );
}
