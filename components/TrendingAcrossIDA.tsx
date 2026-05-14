"use client";

import { trendingTop, trendingSides, type TrendingSideCard, type TrendingStat } from "@/lib/mockData";
import IndicatorSparkline from "./IndicatorSparkline";

const F = "'Open Sans', sans-serif";

function statColor(tone: TrendingStat["tone"]) {
  if (tone === "positive") return "#067647";
  if (tone === "negative") return "#B91C1C";
  return "#0D1A2B";
}

function SideCard({ card }: { card: TrendingSideCard }) {
  const isRisk = card.id === "risk-watch";
  const tagBg = isRisk ? "#FEE2E2" : "#EDE9FE";
  const tagFg = isRisk ? "#B91C1C" : "#5B21B6";
  const sparkColor = isRisk ? "#EF4444" : "#7C3AED";

  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: F,
      }}
    >
      <span
        style={{
          alignSelf: "flex-start",
          background: tagBg,
          color: tagFg,
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 6,
          fontWeight: 600,
        }}
      >
        {card.tag}
      </span>

      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
        {card.headline}
      </h4>

      <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
        {card.description}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <a
          href="#"
          style={{ fontSize: 11, color: "#003F6B", fontWeight: 600, textDecoration: "none" }}
        >
          {card.ctaLabel} →
        </a>
        <IndicatorSparkline points={card.sparkline} width={60} height={24} color={sparkColor} />
      </div>
    </article>
  );
}

export default function TrendingAcrossIDA() {
  return (
    <section aria-label="Trending Across IDA" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0D1A2B", fontFamily: F }}>
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

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Top Momentum (left, 58%) */}
        <article
          className="xl:basis-[58%]"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontFamily: F,
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              background: "#E6F4EC",
              color: "#067647",
              fontSize: 10,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {trendingTop.tag}
          </span>

          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", lineHeight: 1.3, fontFamily: F }}>
            {trendingTop.headline}
          </h3>

          <p style={{ margin: 0, fontSize: 14, color: "#4B5563", lineHeight: 1.55 }}>
            {trendingTop.description}
          </p>

          <div
            style={{
              marginTop: 6,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
              borderTop: "1px solid #F3F4F6",
              paddingTop: 14,
            }}
          >
            {trendingTop.stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 600, color: statColor(s.tone), lineHeight: 1.1 }}>
                  {s.value}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: "#6B7280", lineHeight: 1.35 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <a
            href="#"
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#003F6B",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {trendingTop.ctaLabel} →
          </a>
        </article>

        {/* Risk Watch + Emerging Signal (right column) */}
        <div className="flex flex-col gap-3 xl:flex-1">
          {trendingSides.map((c) => (
            <SideCard key={c.id} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
