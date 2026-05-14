"use client";

import Image from "next/image";
import { IconSparkles } from "@tabler/icons-react";
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
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border: 1px solid transparent;
          border-radius: 999px;
          cursor: pointer;
          font-family: 'Open Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.3;
          color: rgba(255,255,255,0.95);
          background:
            linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)) padding-box,
            linear-gradient(90deg,
              rgba(255,255,255,0.10) 0%,
              rgba(255,255,255,0.55) 45%,
              rgba(255,255,255,0.95) 50%,
              rgba(255,255,255,0.55) 55%,
              rgba(255,255,255,0.10) 100%
            ) border-box;
          background-size: 100% 100%, 220% 100%;
          animation: momentum-pill-gleam 5.5s linear infinite;
          transition: background-color 140ms ease;
        }
        .mg-prompt:hover {
          background:
            linear-gradient(rgba(255,255,255,0.16), rgba(255,255,255,0.16)) padding-box,
            linear-gradient(90deg,
              rgba(255,255,255,0.20) 0%,
              rgba(255,255,255,0.95) 50%,
              rgba(255,255,255,0.20) 100%
            ) border-box;
          background-size: 100% 100%, 220% 100%;
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

            <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {g.suggestedPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPromptClick?.(p)}
                  className="mg-prompt"
                >
                  <IconSparkles size={12} stroke={1.8} color="#FFFFFF" aria-hidden="true" />
                  {p}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
