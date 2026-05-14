"use client";

import type { CSSProperties } from "react";
import { momentumGroups, type MomentumGroup } from "@/lib/mockData";
import { gleamGreen, gleamAmber, gleamBlue } from "@/lib/cardStyles";

const F = "'Open Sans', sans-serif";

const CTA_LABEL: Record<MomentumGroup["id"], string> = {
  accelerating: "Show me all accelerating drivers",
  slowing:      "Show me all slowing drivers",
  emerging:     "Show me all emerging drivers",
};

const GLEAM: Record<MomentumGroup["id"], CSSProperties> = {
  accelerating: gleamGreen,
  slowing:      gleamAmber,
  emerging:     gleamBlue,
};

export default function MomentumGroups() {
  return (
    <section aria-label="Latest Indicator Movements" style={{ marginBottom: 40 }}>
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
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: i < g.rows.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <span style={{ flex: 1, fontSize: 14, color: "#374151", lineHeight: 1.4 }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {r.delta}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              style={{
                alignSelf: "flex-start",
                marginTop: 4,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 400,
                color: "#374151",
                fontFamily: F,
                background: "#FFFFFF",
                border: "1px solid #D1D5DB",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              {CTA_LABEL[g.id]}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
