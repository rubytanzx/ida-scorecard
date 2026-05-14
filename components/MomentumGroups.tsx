"use client";

import {
  IconTrendingUp,
  IconAlertTriangle,
  IconBulb,
} from "@tabler/icons-react";
import { momentumGroups, type MomentumGroup } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

interface GroupTheme {
  iconBg: string;
  iconFg: string;
  valueColor: string;
  Icon: typeof IconTrendingUp;
  ctaLabel: string;
}

const THEMES: Record<MomentumGroup["id"], GroupTheme> = {
  accelerating: {
    iconBg: "#E6F4EC",
    iconFg: "#067647",
    valueColor: "#067647",
    Icon: IconTrendingUp,
    ctaLabel: "See all accelerating",
  },
  slowing: {
    iconBg: "#FEE2E2",
    iconFg: "#B91C1C",
    valueColor: "#B91C1C",
    Icon: IconAlertTriangle,
    ctaLabel: "See all slowing",
  },
  emerging: {
    iconBg: "#EDE9FE",
    iconFg: "#5B21B6",
    valueColor: "#5B21B6",
    Icon: IconBulb,
    ctaLabel: "See all emerging",
  },
};

export default function MomentumGroups() {
  return (
    <section aria-label="What's Changing Right Now" style={{ marginBottom: 40 }}>
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
            What&apos;s Changing Right Now
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            Track momentum shifts over time
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {momentumGroups.map((g) => {
          const t = THEMES[g.id];
          const Icon = t.Icon;
          return (
            <article
              key={g.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontFamily: F,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: t.iconBg,
                    color: t.iconFg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden="true"
                >
                  <Icon size={20} stroke={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{g.subtitle}</div>
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {g.rows.map((r) => (
                  <li
                    key={r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      fontSize: 12,
                      color: "#374151",
                      gap: 12,
                    }}
                  >
                    <span style={{ flex: 1, lineHeight: 1.35 }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.valueColor }}>{r.delta}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                style={{ fontSize: 11, color: "#003F6B", fontWeight: 600, textDecoration: "none" }}
              >
                {t.ctaLabel} →
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
