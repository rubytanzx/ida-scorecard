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
      {/* Shared clipPath defining the curved-wave shape that sweeps
          across each card on hover. clipPathUnits=objectBoundingBox so
          the 0..1 path coords stretch to whatever the overlay's
          rectangle is. */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <clipPath id="mg-sweep" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.55,0 C 0.85,0.33 0.85,0.67 0.55,1 L 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        .mg-card {
          --mg-card-color: #FFFFFF;
          position: relative;
          overflow: hidden;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 22px 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-family: 'Open Sans', sans-serif;
        }
        .mg-card-overlay {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 200%;
          background: var(--mg-card-color);
          /* SVG clipPath defined once at section root paints the
             left 55% of the overlay rectangle plus a single rightward
             bulge peaking at 85% width. Translating the overlay from
             -100% -> 0% slides the bulge across the card. */
          clip-path: url(#mg-sweep);
          -webkit-clip-path: url(#mg-sweep);
          transform: translateX(-100%);
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          z-index: 0;
        }
        .mg-card:hover .mg-card-overlay,
        .mg-card:focus-within .mg-card-overlay {
          transform: translateX(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .mg-card-overlay { transition: none; }
        }

        .mg-card-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }

        /* Header row: title preceded by a thin coloured stroke that
           shares the card's brand colour. */
        .mg-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mg-card-stroke {
          flex-shrink: 0;
          width: 4px;
          height: 22px;
          border-radius: 2px;
          background: var(--mg-card-color);
          transition: background-color 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mg-card:hover .mg-card-stroke,
        .mg-card:focus-within .mg-card-stroke {
          background: #FFFFFF;
        }

        /* Text colours flip from dark (white-card default) to white
           (hovered, on the brand fill). Transition timed to feel
           in step with the curved sweep. */
        .mg-card-title,
        .mg-card-row-label,
        .mg-card-row-delta {
          transition: color 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mg-card-title       { color: #111827; }
        .mg-card-row-label   { color: #374151; }
        .mg-card-row-delta   { color: #111827; }
        .mg-card:hover .mg-card-title,
        .mg-card:focus-within .mg-card-title,
        .mg-card:hover .mg-card-row-delta,
        .mg-card:focus-within .mg-card-row-delta {
          color: #FFFFFF;
        }
        .mg-card:hover .mg-card-row-label,
        .mg-card:focus-within .mg-card-row-label {
          color: rgba(255,255,255,0.92);
        }

        /* Row separator: dark gray on white, light white on the fill */
        .mg-card-row {
          --mg-row-divider: rgba(13,26,43,0.08);
          border-bottom: 1px solid var(--mg-row-divider);
          transition: border-color 500ms ease;
        }
        .mg-card-row:last-child { border-bottom: none; }
        .mg-card:hover .mg-card-row,
        .mg-card:focus-within .mg-card-row {
          --mg-row-divider: rgba(255,255,255,0.18);
        }

        /* Indicator icons: crossfade colored SVG (default) and white
           silhouette (hovered). Both sit absolutely inside a 28x28
           wrapper; opacity is the only thing animated. */
        .mg-icon-wrap {
          position: relative;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
        .mg-icon-wrap > * {
          position: absolute;
          inset: 0;
          transition: opacity 500ms ease;
        }
        .mg-icon-white { opacity: 0; filter: brightness(0) invert(1); }
        .mg-card:hover .mg-icon-color,
        .mg-card:focus-within .mg-icon-color { opacity: 0; }
        .mg-card:hover .mg-icon-white,
        .mg-card:focus-within .mg-icon-white { opacity: 1; }

        /* Suggested-prompt pills: white pill at rest with brand-color
           ink. On hover (i.e. card filled) they stay white pills with
           brand text, which now visually pops against the coloured
           surface. */
        .mg-prompt {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 999px;
          cursor: pointer;
          font-family: 'Open Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.3;
          background: #FFFFFF;
          color: var(--mg-card-color);
          transition: background-color 140ms ease, border-color 500ms ease;
        }
        .mg-card:hover .mg-prompt,
        .mg-card:focus-within .mg-prompt {
          border-color: rgba(255,255,255,0.6);
        }
        .mg-prompt:hover {
          background: rgba(255,255,255,0.92);
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
            className="mg-card"
            style={{ ["--mg-card-color" as string]: CARD_BG[g.id] }}
          >
            <span className="mg-card-overlay" aria-hidden="true" />
            <div className="mg-card-content">
              <div className="mg-card-header">
                <span className="mg-card-stroke" aria-hidden="true" />
                <h3 className="mg-card-title" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  {g.title}
                </h3>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
                {g.rows.map((r) => (
                  <li
                    key={r.label}
                    className="mg-card-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                    }}
                  >
                    <span className="mg-icon-wrap" aria-hidden="true">
                      <Image
                        src={r.iconSrc}
                        alt=""
                        width={28}
                        height={28}
                        className="mg-icon-color"
                        style={{ display: "block" }}
                      />
                      <Image
                        src={r.iconSrc}
                        alt=""
                        width={28}
                        height={28}
                        className="mg-icon-white"
                        style={{ display: "block" }}
                      />
                    </span>
                    <span
                      className="mg-card-row-label"
                      style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}
                    >
                      {r.label}
                    </span>
                    <span className="mg-card-row-delta" style={{ fontSize: 14, fontWeight: 600 }}>
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
                    <IconSparkles size={12} stroke={1.8} aria-hidden="true" />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
