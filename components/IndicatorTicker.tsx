"use client";

import { useEffect, useRef, useState } from "react";
import { IconUsers } from "@tabler/icons-react";
import { type Indicator } from "@/lib/mockData";
import IndicatorSparkline from "./IndicatorSparkline";

interface Props {
  indicators: Indicator[];
}

const F = "'Open Sans', sans-serif";

function tintBg(color: string) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

function deltaTone(ind: Indicator) {
  if (ind.ratio === null) {
    return { color: "#9CA3AF", arrow: "•", label: ind.comingSoon ? "Coming soon" : "Pending" };
  }
  const pct = Math.round(ind.ratio * 100);
  if (ind.ratio >= 0.85) return { color: "#10B981", arrow: "▲", label: `${pct}% of expected` };
  if (ind.ratio >= 0.5)  return { color: "#F59E0B", arrow: "▲", label: `${pct}% of expected` };
  return { color: "#EF4444", arrow: "▼", label: `${pct}% of expected` };
}

function TickerCard({ indicator, onOpen, isClone = false }: { indicator: Indicator; onOpen: () => void; isClone?: boolean }) {
  const tone = deltaTone(indicator);
  return (
    <button
      onClick={isClone ? undefined : onOpen}
      aria-hidden={isClone || undefined}
      tabIndex={isClone ? -1 : 0}
      aria-label={`${indicator.name}: ${indicator.achieved} of ${indicator.expected}`}
      style={{
        flex: "0 0 500px",
        height: 56,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: F,
      }}
    >
      {/* Icon circle */}
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: tintBg(tone.color),
          color: tone.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <IconUsers size={18} stroke={1.5} />
      </div>

      {/* Name */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          fontWeight: 400,
          color: "#4B5563",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {indicator.name}
      </div>

      {/* Sparkline */}
      <IndicatorSparkline
        points={indicator.sparkline}
        width={120}
        height={32}
        color={tone.color}
      />

      {/* Right stat block */}
      <div style={{ textAlign: "right", flexShrink: 0, width: 160, lineHeight: 1.2 }}>
        <div style={{ fontSize: 13 }}>
          <strong
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: indicator.achieved === "--" ? "#9CA3AF" : "#0D1A2B",
            }}
          >
            {indicator.achieved === "--" ? "—" : indicator.achieved}
          </strong>{" "}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: indicator.achieved === "--" ? "#9CA3AF" : "#0D1A2B",
            }}
          >
            Achieved
          </span>
        </div>
        <div style={{ fontSize: 12, color: tone.color, marginTop: 1 }}>
          <strong style={{ fontWeight: 600 }}>{indicator.expected}</strong>{" "}
          <span>Expected</span>
        </div>
      </div>
    </button>
  );
}

function MethodologyDrawer({
  indicator,
  onClose,
}: {
  indicator: Indicator;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const drawer = drawerRef.current;
    const focusables = drawer
      ? Array.from(
          drawer.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )
      : [];
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${indicator.name} methodology`}
      style={{ position: "fixed", inset: 0, zIndex: 100 }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(13,26,43,0.35)" }}
      />
      <aside
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          background: "#FFFFFF",
          boxShadow: "-12px 0 32px rgba(13,26,43,0.18)",
          padding: 24,
          overflowY: "auto",
          fontFamily: F,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0D1A2B", lineHeight: 1.35 }}>
            {indicator.name}
          </h3>
          <button
            aria-label="Close methodology"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
              color: "#6B7280",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 24 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: 0.8 }}>
              Achieved
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#0D1A2B", marginTop: 4 }}>
              {indicator.achieved === "--" ? "—" : indicator.achieved}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: 0.8 }}>
              Expected
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#0D1A2B", marginTop: 4 }}>
              {indicator.expected}
            </div>
          </div>
        </div>

        {indicator.subRows && indicator.subRows.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: 0.8 }}>
              Breakdown
            </div>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {indicator.subRows.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 8,
                    alignItems: "baseline",
                    fontSize: 12,
                    color: "#374151",
                  }}
                >
                  <span>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.achieved}</span>
                  <span style={{ color: "#9CA3AF" }}>of {row.expected}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 13, color: "#4B5563", lineHeight: 1.55 }}>
          {indicator.methodologyNote}
        </p>

        {indicator.methodologyUrl && (
          <a
            href={indicator.methodologyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 14,
              fontSize: 12,
              color: "#003F6B",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            How this is measured →
          </a>
        )}
      </aside>
    </div>
  );
}

export default function IndicatorTicker({ indicators }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? indicators.find((i) => i.id === openId) ?? null : null;

  // The track is rendered twice for a seamless loop.
  const doubled = [...indicators, ...indicators];

  return (
    <section aria-label="IDA scorecard indicators" style={{ marginBottom: 32 }}>
      <style>{`
        .ticker-viewport { overflow: hidden; }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll 180s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
          .ticker-viewport { overflow: auto; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 18,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "rgba(0, 13, 26, 0.96)",
              fontFamily: F,
              fontSize: 36,
              fontWeight: 300,
              lineHeight: "48px",
              letterSpacing: "-1.89px",
            }}
          >
            Indicators
          </h2>
          <div style={{ fontSize: 12, color: "#6B7280", fontFamily: F, marginTop: 2 }}>
            Real-time pulse of development outcomes
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: F }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#067647" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 0 4px rgba(16,185,129,0.18)",
              }}
            />
            Auto-updating
          </span>
          <button
            style={{
              fontSize: 12,
              color: "#003F6B",
              fontFamily: F,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            View all 22 →
          </button>
        </div>
      </div>

      {/* Viewport with fade-edge masks */}
      <div
        className="ticker-viewport"
        style={{
          position: "relative",
          background: "#F8F7F4",
          borderRadius: 12,
          padding: "12px 0",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
        }}
      >
        <div
          className="ticker-track"
          style={{
            display: "flex",
            gap: 10,
            paddingLeft: 12,
            paddingRight: 12,
            width: "max-content",
          }}
        >
          {doubled.map((ind, i) => (
            <TickerCard
              key={`${ind.id}-${i}`}
              indicator={ind}
              onOpen={() => setOpenId(ind.id)}
              isClone={i >= indicators.length}
            />
          ))}
        </div>
      </div>

      {open && <MethodologyDrawer indicator={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
