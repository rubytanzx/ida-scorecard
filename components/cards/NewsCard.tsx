"use client";
import { useState } from "react";
import type { NodeProps } from "reactflow";
import { IconThumbUp, IconThumbDown } from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

const COUNTRIES = ["Mexico", "Chile", "Brazil", "Columbia", "Peru"];

const NEWS_ITEMS = [
  {
    type: "ALERT",
    typeColor: "#EF4444",
    text: "Mexico confirms IMSS-Bienestar absorbed 14M beneficiaries from Seguro Popular — coverage disruptions reported in Chiapas and Oaxaca",
    tags: ["#Health/UHC", "#Social Protection"],
    time: "4 hours ago",
  },
  {
    type: "ALERT",
    typeColor: "#EF4444",
    text: "Finance Ministry reaffirms commitment to reduce external borrowing in FY26 budget speech. No new multilateral loans for social sectors",
    tags: ["#Lending & Fiscal", "#Social Protection"],
    time: "4 hours ago",
  },
  {
    type: "INSIGHT",
    typeColor: "#60A5FA",
    text: "Mexico's central bank reports digital wallet transactions up 34% YoY — but 72% concentrated in CDMX, Monterrey, and Guadalajara. Rural adoption remains flat",
    tags: ["#Financial Inclusion", "#Digital Services"],
    time: "4 hours ago",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NewsCard({ selected, data }: NodeProps<any>) {
  const [cardHovered, setCardHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const viewMode = data?.viewMode ?? false;
  const playMode = data?.playMode ?? false;

  return (
    <div
      className="card-enter"
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        width: playMode ? "100%" : 411,
        fontFamily: F,
        cursor: playMode ? "default" : "grab",
        borderRadius: playMode ? 0 : 8,
        boxShadow: (!playMode && selected) ? "0 0 0 2px #0B6FD3" : undefined,
        transition: playMode ? undefined : "box-shadow 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#FFFFFF",
          borderTop: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderRight: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderBottom: "none",
          borderLeft: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderRadius: playMode ? 0 : "8px 8px 0 0",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: playMode ? undefined : "border-color 0.2s",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 600, color: "#1E293B" }}>News</span>
        <div
          style={{
            background: "#DCFCE7",
            borderRadius: 9999,
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#16A34A" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#15803D" }}>Live</span>
        </div>
      </div>

      {/* Country Tabs + News Items */}
      <div
        style={{
          background: "#FFFFFF",
          borderTop: "none",
          borderRight: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderBottom: "none",
          borderLeft: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          boxShadow: playMode ? "none" : cardHovered
            ? "0px 6px 16px 0px rgba(12,35,60,0.14)"
            : "0px 2px 4px 0px rgba(12,35,60,0.08)",
          transition: playMode ? undefined : "box-shadow 0.2s, border-color 0.2s",
        }}
      >
        {/* Country Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderBottom: "1px solid #E0E0E0",
          }}
        >
          {COUNTRIES.map((c) => (
            <div
              key={c}
              style={{
                padding: "10px 8px",
                fontSize: 16,
                fontWeight: c === "Mexico" ? 600 : 400,
                color: "#212121",
                borderBottom: c === "Mexico" ? "2px solid #0B6FD3" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </div>
          ))}
        </div>

        {/* News Items */}
        {NEWS_ITEMS.map((item, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredItem(i)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              padding: "16px 24px",
              borderBottom: i < NEWS_ITEMS.length - 1 ? "1px solid #E0E0E0" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              background: hoveredItem === i ? "#FAFAFA" : "transparent",
              transition: "background 0.12s",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14, color: item.typeColor, textTransform: "uppercase", fontWeight: 400 }}>
              {item.type}
            </span>
            <p
              style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: "22.75px" }}
            >
              {item.text}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {item.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 14, color: "#0B6FD3" }}>
                  {tag}
                </span>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#BDBDBD", letterSpacing: -0.25 }}>{item.time}</span>
          </div>
        ))}
      </div>

      {/* Footer: sources + thumbs */}
      <div
        style={{
          background: "#FFFFFF",
          borderTop: "none",
          borderRight: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderBottom: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderLeft: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderRadius: playMode ? 0 : "0 0 8px 8px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          transition: playMode ? undefined : "border-color 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {["Reuters", "Finance Ministry", "IMSS-Bienestar"].map((src) => (
            <span
              key={src}
              style={{
                fontSize: 11,
                color: "#616161",
                background: "#F5F5F5",
                borderRadius: 4,
                padding: "2px 6px",
                lineHeight: "1.4",
                fontFamily: F,
                whiteSpace: "nowrap",
              }}
            >
              {src}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <button
            style={{
              background: "none",
              border: "none",
              padding: "3.5px",
              cursor: "pointer",
              color: "#616161",
              display: "flex",
              alignItems: "center",
              borderRadius: 100,
            }}
          >
            <IconThumbUp size={17} stroke={1.5} />
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              padding: "3.5px",
              cursor: "pointer",
              color: "#616161",
              display: "flex",
              alignItems: "center",
              borderRadius: 100,
            }}
          >
            <IconThumbDown size={17} stroke={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
