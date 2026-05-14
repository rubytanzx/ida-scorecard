"use client";

import {
  IconTrendingUp,
  IconDeviceDesktop,
  IconUsers,
  IconLeaf,
  IconUsersGroup,
  IconShield,
} from "@tabler/icons-react";
import { systemPatterns, type SystemPattern } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

interface TintStyle { bg: string; fg: string; }
const TINTS: Record<SystemPattern["tint"], TintStyle> = {
  green:        { bg: "#E6F4EC", fg: "#067647" },
  blue:         { bg: "#DBEAFE", fg: "#1D4ED8" },
  teal:         { bg: "#CCFBF1", fg: "#0F766E" },
  "purple-light": { bg: "#EDE9FE", fg: "#7C3AED" },
  purple:       { bg: "#F3E8FF", fg: "#6B21A8" },
  orange:       { bg: "#FFEDD5", fg: "#C2410C" },
};

const ICON_MAP: Record<SystemPattern["icon"], typeof IconTrendingUp> = {
  trend:      IconTrendingUp,
  digital:    IconDeviceDesktop,
  human:      IconUsers,
  climate:    IconLeaf,
  inclusion:  IconUsersGroup,
  fragility:  IconShield,
};

function Tile({ pattern }: { pattern: SystemPattern }) {
  const tint = TINTS[pattern.tint];
  const Icon = ICON_MAP[pattern.icon];
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        minHeight: 132,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: F,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: tint.bg,
          color: tint.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <Icon size={16} stroke={1.8} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.35 }}>
        {pattern.name}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#6B7280",
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {pattern.description}
      </div>

      <div style={{ marginTop: "auto", fontSize: 10, color: "#9CA3AF" }}>
        {pattern.narrativeCount} narratives · {pattern.indicatorCount} indicators
      </div>
    </article>
  );
}

export default function SystemPatternGrid() {
  return (
    <section aria-label="Explore by System Pattern" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
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
            Explore by System Pattern
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            Dive deeper using cross-sector lenses
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all patterns →
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {systemPatterns.map((p) => (
          <Tile key={p.id} pattern={p} />
        ))}
      </div>
    </section>
  );
}
