"use client";

import type { Node } from "reactflow";
import { OverviewCard } from "@/components/cards/OverviewCard";
import { NarrativeCard } from "@/components/cards/NarrativeCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { OutcomeAreaCard } from "@/components/cards/OutcomeAreaCard";
import { DataCard } from "@/components/cards/DataCard";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

const cardComponents = {
  overview: OverviewCard,
  narrative: NarrativeCard,
  news: NewsCard,
  outcomeArea: OutcomeAreaCard,
  dataCard: DataCard,
} as const;

interface Props {
  node: Node;
  index: number;
  total: number;
  onAdvance: () => void;
}

export default function PlayModeCard({ node, index, total, onAdvance }: Props) {
  const CardComponent = cardComponents[node.type as keyof typeof cardComponents];
  const isLast = index === total - 1;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(70vw, 860px)",
        maxHeight: "80vh",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        borderRadius: 16,
        boxShadow: "0px 24px 64px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      {/* Card content */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {CardComponent ? (
          <CardComponent
            id={node.id}
            type={node.type ?? ""}
            data={node.data}
            selected={false}
            isConnectable={false}
            zIndex={0}
            xPos={0}
            yPos={0}
            dragging={false}
          />
        ) : (
          <div style={{ padding: 24, fontFamily: F, color: "#616161" }}>Card unavailable</div>
        )}
      </div>

      {/* Footer: Next / Finish */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "12px 20px",
          borderTop: "1px solid #F3F4F6",
          background: "#FAFAFA",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onAdvance}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 999,
            border: isLast ? "1px solid #0b6fd3" : "none",
            background: isLast ? "#0b6fd3" : "transparent",
            cursor: "pointer",
            fontFamily: F,
            fontSize: 13,
            fontWeight: 600,
            color: isLast ? "#FFFFFF" : "#9E9E9E",
          }}
        >
          {isLast ? (
            <>
              <IconCheck size={14} stroke={2} />
              Finish
            </>
          ) : (
            <>
              Next
              <IconArrowRight size={14} stroke={2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
