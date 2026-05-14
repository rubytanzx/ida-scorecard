"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { IconArrowUp, IconSparkles } from "@tabler/icons-react";
import { momentumGroups, type MomentumGroup } from "@/lib/mockData";
import { gleamGreen, gleamAmber, gleamBlue } from "@/lib/cardStyles";

const F = "'Open Sans', sans-serif";

const GLEAM: Record<MomentumGroup["id"], CSSProperties> = {
  accelerating: gleamGreen,
  slowing:      gleamAmber,
  emerging:     gleamBlue,
};

const DELTA_COLOR: Record<MomentumGroup["id"], string> = {
  accelerating: "#16A34A", // green-600
  slowing:      "#D97706", // amber-600
  emerging:     "#2563EB", // blue-600
};

interface Props {
  /** When set, clicking a suggested prompt populates the main prompt bar with that text. */
  onPromptClick?: (prompt: string) => void;
}

export default function MomentumGroups({ onPromptClick }: Props = {}) {
  return (
    <section aria-label="Latest Indicator Movements" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <h2
          style={{
            margin: 0,
            color: "rgba(0, 13, 26, 0.96)",
            fontFamily: F,
            fontSize: 26,
            fontWeight: 300,
            lineHeight: "34px",
            letterSpacing: "-1.2px",
          }}
        >
          Latest Indicator Movements
        </h2>
        <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {momentumGroups.map((g) => (
          <article
            key={g.id}
            style={{
              ...GLEAM[g.id],
              borderRadius: 12,
              padding: "20px 22px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              fontFamily: F,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#111827" }}>
              {g.title}
            </h3>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
              {g.rows.map((r, i) => (
                <li
                  key={r.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: i < g.rows.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <Image
                    src={r.iconSrc}
                    alt=""
                    width={28}
                    height={28}
                    aria-hidden="true"
                    style={{ display: "block", flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: 14, color: "#374151", lineHeight: 1.4 }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: DELTA_COLOR[g.id] }}>
                    {r.delta}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
              {g.suggestedPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPromptClick?.(p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px 8px 12px",
                    background: "#F9FAFB",
                    border: "1px solid #F3F4F6",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: F,
                  }}
                >
                  <IconSparkles size={14} stroke={1.8} color="#6B7280" aria-hidden="true" />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 400,
                      color: "#4B5563",
                      lineHeight: 1.35,
                    }}
                  >
                    {p}
                  </span>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <IconArrowUp size={12} stroke={2} color="#6B7280" />
                  </span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
