"use client";

import { IconArrowRight, IconExternalLink } from "@tabler/icons-react";
import {
  trendingTop,
  trendingSides,
  type TrendingProgress,
  type TrendingSideCard,
} from "@/lib/mockData";
import { gleamBorder } from "@/lib/cardStyles";

const F = "'Open Sans', sans-serif";

const PROGRESS_COLOR: Record<TrendingProgress["tone"], string> = {
  green: "#22C55E",
  amber: "#F59E0B",
  red:   "#DC2626",
};

function TagPill({ label }: { label: string }) {
  return (
    <span
      style={{
        alignSelf: "flex-start",
        fontFamily: F,
        fontSize: 12,
        fontWeight: 500,
        color: "#1D4ED8",
        background: "#FFFFFF",
        border: "1px solid #1D4ED8",
        borderRadius: 999,
        padding: "3px 12px",
      }}
    >
      {label}
    </span>
  );
}

function ProgressBar({ progress }: { progress: TrendingProgress }) {
  const fill = PROGRESS_COLOR[progress.tone];
  const pct = Math.max(0, Math.min(100, progress.pct));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: "100%",
          height: 8,
          background: "#E5E7EB",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: fill,
            borderRadius: 999,
          }}
        />
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", fontFamily: F, lineHeight: 1.4 }}>
        {progress.footnote}
      </div>
    </div>
  );
}

function SideCard({ card }: { card: TrendingSideCard }) {
  return (
    <article
      style={{
        ...gleamBorder,
        borderRadius: 12,
        padding: "22px 24px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: F,
        flex: 1,
        minHeight: 0,
      }}
    >
      <TagPill label={card.tag} />

      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.35,
          }}
        >
          {card.headline}
        </h3>
        <div style={{ marginTop: 4, fontSize: 13, color: "#9CA3AF", lineHeight: 1.4 }}>
          {card.subtitle}
        </div>
      </div>

      <ProgressBar progress={card.progress} />

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "#1D4ED8",
            textDecoration: "none",
          }}
        >
          {card.ctaLabel}
        </a>
        <IconArrowRight size={18} stroke={1.8} color="#1D4ED8" aria-hidden="true" />
      </div>
    </article>
  );
}

export default function TrendingAcrossIDA() {
  return (
    <section aria-label="Trending Across IDA" style={{ marginBottom: 40 }}>
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
            Trending Across IDA
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            AI-synthesized patterns from scorecard data and narratives
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all patterns →
        </a>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        {/* Top card (left, 58%) */}
        <article
          className="xl:basis-[58%]"
          style={{
            ...gleamBorder,
            borderRadius: 12,
            padding: "24px 28px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            fontFamily: F,
          }}
        >
          <TagPill label={trendingTop.tag} />

          <h3
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.3,
            }}
          >
            {trendingTop.headline}
          </h3>

          <p style={{ margin: 0, fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
            {trendingTop.description}
          </p>

          <ProgressBar progress={trendingTop.progress} />

          <div style={{ marginTop: 8 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Related Narratives
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {trendingTop.relatedNarratives.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    background: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#374151",
                    textDecoration: "none",
                    fontFamily: F,
                  }}
                >
                  {n.label}
                  <IconExternalLink size={14} stroke={1.8} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </article>

        {/* Side stack (right) */}
        <div className="flex flex-col gap-4 xl:flex-1">
          {trendingSides.map((c) => (
            <SideCard key={c.id} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
