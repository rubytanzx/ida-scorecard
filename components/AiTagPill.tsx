"use client";

/**
 * AI-generated tag pill — squarer corners, soft blue glow, and an
 * animated gradient border sheen that loops every few seconds so the
 * label reads as machine-suggested rather than a static UI label.
 *
 * The animation rides on `background-position` of the border-box
 * layer; the padding-box stays a flat #FFF so the pill content area
 * never moves.
 */

interface Props {
  label: string;
  /** Override the pill text + accent colour. Defaults to the standard #1D4ED8 blue. */
  color?: string;
}

export default function AiTagPill({ label, color = "#1D4ED8" }: Props) {
  return (
    <>
      <style>{`
        @keyframes ai-pill-gleam {
          0%   { background-position: 0% 50%, 0% 50%; }
          100% { background-position: 0% 50%, 200% 50%; }
        }
        .ai-pill {
          --ai-pill-color: #1D4ED8;
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          font-family: 'Open Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.1px;
          color: var(--ai-pill-color);
          padding: 4px 12px;
          border: 1px solid transparent;
          border-radius: 4px;
          background:
            linear-gradient(#FFFFFF, #FFFFFF) padding-box,
            linear-gradient(90deg,
              rgba(255,255,255,0.85) 0%,
              rgba(96,165,250,0.85) 25%,
              var(--ai-pill-color) 50%,
              rgba(96,165,250,0.85) 75%,
              rgba(255,255,255,0.85) 100%
            ) border-box;
          background-size: 100% 100%, 200% 100%;
          animation: ai-pill-gleam 3.2s linear infinite;
          box-shadow: 0 4px 2px 0 rgba(0, 90, 217, 0.08);
        }
        @media (prefers-reduced-motion: reduce) {
          .ai-pill { animation: none; }
        }
      `}</style>
      <span className="ai-pill" style={{ ["--ai-pill-color" as string]: color }}>
        {label}
      </span>
    </>
  );
}
