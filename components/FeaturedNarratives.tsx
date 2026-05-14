"use client";

import Image from "next/image";
import { IconDatabase } from "@tabler/icons-react";
import { featuredNarratives, type FeaturedNarrative } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

function Card({ narrative }: { narrative: FeaturedNarrative }) {
  return (
    <a
      href="#"
      style={{
        position: "relative",
        display: "block",
        borderRadius: 12,
        overflow: "hidden",
        aspectRatio: "5 / 4",
        textDecoration: "none",
        fontFamily: F,
      }}
    >
      <Image
        src={narrative.imageSrc}
        alt=""
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        style={{ objectFit: "cover" }}
      />

      {/* Bottom-anchored dark overlay so the white text reads. Stronger
          and earlier than a soft gradient so the bottom block is a
          legible dark wash, not just a fade. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 32%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.88) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Text content over the gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 6,
          color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.82)" }}>
          {narrative.outcomeArea}
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>
          {narrative.headline}
        </h3>

        {/* Hover trigger: tooltip lists the indicator names */}
        <span
          className="fn-tt"
          tabIndex={0}
          aria-label={`${narrative.indicators.length} linked indicators`}
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          <IconDatabase size={14} stroke={1.8} aria-hidden="true" />
          {narrative.indicators.length} Indicators
          <span className="fn-tt-bubble" role="tooltip">
            <span
              style={{
                display: "block",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Linked indicators
            </span>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {narrative.indicators.map((name) => (
                <li
                  key={name}
                  style={{
                    fontSize: 11,
                    color: "#FFFFFF",
                    lineHeight: 1.4,
                  }}
                >
                  · {name}
                </li>
              ))}
            </ul>
          </span>
        </span>
      </div>
    </a>
  );
}

export default function FeaturedNarratives() {
  return (
    <section aria-label="Featured Narratives" style={{ marginBottom: 40 }}>
      <style>{`
        .fn-tt {
          position: relative;
          cursor: help;
          outline: none;
        }
        .fn-tt-bubble {
          position: absolute;
          left: 0;
          bottom: calc(100% + 8px);
          min-width: 240px;
          max-width: 320px;
          padding: 10px 12px;
          background: #0D1A2B;
          color: #FFFFFF;
          font-family: 'Open Sans', sans-serif;
          font-weight: 400;
          border-radius: 8px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 120ms ease, transform 120ms ease;
          z-index: 30;
          box-shadow: 0 8px 20px rgba(13, 26, 43, 0.32);
        }
        .fn-tt-bubble::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 18px;
          border: 5px solid transparent;
          border-top-color: #0D1A2B;
        }
        .fn-tt:hover .fn-tt-bubble,
        .fn-tt:focus-visible .fn-tt-bubble {
          opacity: 1;
          transform: translateY(0);
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
          Featured Narratives
        </h2>
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            fontWeight: 500,
            color: "#39B5F5",
            fontFamily: F,
            textDecoration: "none",
          }}
        >
          See all <span aria-hidden="true">›</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredNarratives.map((n) => (
          <Card key={n.id} narrative={n} />
        ))}
      </div>
    </section>
  );
}
