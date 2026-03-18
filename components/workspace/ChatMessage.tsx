"use client";

import { useState, useEffect } from "react";
import { IconCheck } from "@tabler/icons-react";
import type { Message } from "@/data/mockInteraction";

const F = "'Open Sans', sans-serif";

// ─── Reasoning animation ─────────────────────────────────────────────────────

const STEPS: { label: string; source?: string; delay: number }[] = [
  { label: "Creating analysis plan",                                  delay: 0    },
  { label: "Navigating WBG Scorecard FY25 data",  source: "FY25 Explorer", delay: 500  },
  { label: "Benchmarking Mexico against 4 peers", source: "LAC Region",    delay: 1050 },
  { label: "Identifying priority gap areas",                          delay: 1650 },
  { label: "Generating insight cards",                                delay: 2200 },
];

function Dots({ color = "#0b6fd3" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: color,
            animation: `typing-dot 1.2s ease-in-out ${i * 133}ms infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ReasoningAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.slice(1).forEach((step, idx) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(idx + 2);
          setActiveStep(idx + 1);
        }, step.delay)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {STEPS.slice(0, visibleCount).map((step, idx) => {
        const isDone = idx < activeStep;
        const isActive = idx === activeStep;

        return (
          <div
            key={idx}
            className={idx > 0 ? "card-enter" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: isDone ? 0.5 : 1,
              transition: "opacity 0.3s",
            }}
          >
            {/* Indicator — fixed 16px wide so labels stay aligned */}
            <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {isDone ? (
                <IconCheck size={13} stroke={2.5} color="#16a34a" />
              ) : isActive ? (
                <Dots />
              ) : null}
            </div>

            {/* Label */}
            <span
              style={{
                fontFamily: F,
                fontSize: 13,
                color: isDone ? "#9CA3AF" : "#1F2937",
                lineHeight: "18px",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {step.label}
              {isActive && "…"}
            </span>

            {/* Source badge */}
            {step.source && (
              <span
                style={{
                  fontFamily: F,
                  fontSize: 11,
                  color: isDone ? "#C4C4C4" : "#0b6fd3",
                  background: isDone ? "#F5F5F5" : "#EBF3FC",
                  borderRadius: 4,
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {step.source}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Content renderer (bold markdown) ────────────────────────────────────────

function renderContent(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ fontWeight: 600 }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <div
          style={{
            background: "#002244",
            borderRadius: "20px 20px 0px 20px",
            padding: 16,
            maxWidth: "100%",
            fontFamily: F,
            fontSize: 14,
            color: "#FFFFFF",
            lineHeight: "20px",
          }}
        >
          {message.content}
        </div>
        {message.timestamp && (
          <span style={{ fontFamily: F, fontSize: 11, color: "#BDBDBD" }}>{message.timestamp}</span>
        )}
      </div>
    );
  }

  if (message.role === "typing") {
    return <ReasoningAnimation />;
  }

  // assistant
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontFamily: F,
          fontSize: 14,
          color: "#1F2937",
          lineHeight: "20px",
          whiteSpace: "pre-line",
        }}
      >
        {renderContent(message.content)}
      </div>
      {message.actions && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {message.actions.map((action) => (
            <button
              key={action.label}
              style={{
                height: 28,
                padding: "0 12px",
                borderRadius: 999,
                fontSize: 12,
                fontFamily: F,
                cursor: "pointer",
                ...(action.variant === "outlined"
                  ? { background: "transparent", border: "1px solid #4A9EFF", color: "#4A9EFF" }
                  : { background: "#1565C0", border: "none", color: "#FFFFFF" }),
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {message.timestamp && (
        <span style={{ fontFamily: F, fontSize: 11, color: "#BDBDBD" }}>{message.timestamp}</span>
      )}
    </div>
  );
}
