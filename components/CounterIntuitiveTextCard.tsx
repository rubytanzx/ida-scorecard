"use client";

import {
  IconTrendingUp,
  IconDroplet,
  IconGenderFemale,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import {
  counterIntuitiveTextCards,
  type CounterIntuitiveTextCard,
} from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

interface ToneStyle { bg: string; fg: string; }
const TONES: Record<CounterIntuitiveTextCard["tone"], ToneStyle> = {
  green:  { bg: "#E6F4EC", fg: "#067647" },
  blue:   { bg: "#DBEAFE", fg: "#1D4ED8" },
  purple: { bg: "#EDE9FE", fg: "#5B21B6" },
  amber:  { bg: "#FEF3C7", fg: "#B45309" },
};

const ICON_MAP: Record<CounterIntuitiveTextCard["icon"], typeof IconTrendingUp> = {
  chart:  IconTrendingUp,
  water:  IconDroplet,
  female: IconGenderFemale,
  dollar: IconCurrencyDollar,
};

function Card({ card }: { card: CounterIntuitiveTextCard }) {
  const tone = TONES[card.tone];
  const Icon = ICON_MAP[card.icon];
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: F,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: tone.bg,
          color: tone.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <Icon size={18} stroke={1.8} />
      </div>

      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
        {card.headline}
      </h4>

      <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
        {card.description}
      </p>

      <a
        href="#"
        style={{ marginTop: "auto", fontSize: 11, color: "#003F6B", fontWeight: 600, textDecoration: "none" }}
      >
        Explore insight →
      </a>
    </article>
  );
}

export default function CounterIntuitiveFindings() {
  return (
    <section aria-label="Counter Intuitive Findings" style={{ marginBottom: 40 }}>
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
            Counter Intuitive Findings
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            Where the data challenges assumptions
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {counterIntuitiveTextCards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </div>
    </section>
  );
}
