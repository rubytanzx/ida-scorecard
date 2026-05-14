"use client";

import Image from "next/image";
import { outcomeAreas, type OutcomeArea } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

function Tile({ area }: { area: OutcomeArea }) {
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: "32px 28px",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        fontFamily: F,
      }}
    >
      <Image
        src={area.iconSrc}
        alt=""
        width={64}
        height={64}
        aria-hidden="true"
        style={{ display: "block" }}
      />

      <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
        {area.name}
      </div>
    </article>
  );
}

export default function OutcomeAreaGrid() {
  return (
    <section aria-label="Explore by Outcome Area" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
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
          Explore by Outcome Area
        </h2>
        <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {outcomeAreas.map((a) => (
          <Tile key={a.id} area={a} />
        ))}
      </div>
    </section>
  );
}
