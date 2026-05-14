"use client";

import Image from "next/image";
import { IconArrowUp, IconSparkles } from "@tabler/icons-react";
import { momentumGroups, type MomentumGroup } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

const CARD_BG: Record<MomentumGroup["id"], string> = {
  accelerating: "#0F766E", // deep teal
  slowing:      "#C2410C", // burnt orange
  emerging:     "#1E1B6E", // deep navy
};

interface Props {
  /** When set, clicking a suggested prompt populates the main prompt bar with that text. */
  onPromptClick?: (prompt: string) => void;
}

export default function MomentumGroups({ onPromptClick }: Props = {}) {
  return (
    <section aria-label="Latest Indicator Movements" style={{ marginBottom: 40 }}>
      <style>{`
        @keyframes momentum-pill-gleam {
          0%   { background-position: 0% 50%, 0% 50%; }
          100% { background-position: 0% 50%, 200% 50%; }
        }
        .mg-prompt {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-align: left;
          padding: 6px 12px 6px 12px;
          border: 1px solid transparent;
          border-radius: 999px;
          cursor: pointer;
          font-family: 'Open Sans', sans-serif;
          color: #FFFFFF;
          background:
            linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10)) padding-box,
            linear-gradient(90deg,
              rgba(255,255,255,0.15) 0%,
              rgba(255,255,255,0.85) 25%,
              rgba(255,255,255,1) 50%,
              rgba(255,255,255,0.85) 75%,
              rgba(255,255,255,0.15) 100%
            ) border-box;
          background-size: 100% 100%, 200% 100%;
          animation: momentum-pill-gleam 3.6s linear infinite;
        }
        .mg-prompt:hover {
          background:
            linear-gradient(rgba(255,255,255,0.18), rgba(255,255,255,0.18)) padding-box,
            linear-gradient(90deg,
              rgba(255,255,255,0.25) 0%,
              rgba(255,255,255,1) 50%,
              rgba(255,255,255,0.25) 100%
            ) border-box;
          background-size: 100% 100%, 200% 100%;
        }
        @media (prefers-reduced-motion: reduce) {
          .mg-prompt { animation: none; }
        }
        .mg-icon {
          filter: brightness(0) invert(1);
        }
      `}</style>

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
              background: CARD_BG[g.id],
              border: "1px solid transparent",
              borderRadius: 16,
              padding: "22px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              fontFamily: F,
              color: "#FFFFFF",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#FFFFFF" }}>
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
                    borderBottom:
                      i < g.rows.length - 1
                        ? "1px solid rgba(255,255,255,0.18)"
                        : "none",
                  }}
                >
                  <Image
                    src={r.iconSrc}
                    alt=""
                    width={28}
                    height={28}
                    aria-hidden="true"
                    className="mg-icon"
                    style={{ display: "block", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.92)",
                      lineHeight: 1.4,
                    }}
                  >
                    {r.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>
                    {r.delta}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {g.suggestedPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPromptClick?.(p)}
                  className="mg-prompt"
                >
                  <IconSparkles size={14} stroke={1.8} color="#FFFFFF" aria-hidden="true" />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.95)",
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
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <IconArrowUp size={12} stroke={2} color="#FFFFFF" />
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
