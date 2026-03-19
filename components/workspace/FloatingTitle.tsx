"use client";

import { useState, useRef, useEffect } from "react";
import { IconCheck, IconSparkles, IconArrowBigUp, IconArrowBigDown, IconDotsVertical } from "@tabler/icons-react";

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: "'Open Sans', sans-serif",
  fontSize: 18,
  fontWeight: 600,
  color: "#616161",
  lineHeight: "140%",
  whiteSpace: "nowrap",
};

const PLACEHOLDER = "Name your notebook";

function TertiaryBtn({
  onClick,
  label,
  children,
  active,
  activeColor,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        height: 32,
        padding: "0 8px",
        border: "none",
        borderRadius: 8,
        background: "transparent",
        fontFamily: "'Open Sans', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: active && activeColor ? activeColor : "#616161",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

interface Props {
  initialTitle?: string;
  mode?: "edit" | "view";
}

export default function FloatingTitle({ initialTitle = "Country Partnership Framework for Mexico FY25", mode = "edit" }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(312);
  const [downvotes, setDownvotes] = useState(11);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!summaryOpen) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSummaryOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [summaryOpen]);

  function commit() {
    setEditing(false);
    setTitle((t) => t.trim());
  }

  function handleVote(dir: "up" | "down") {
    if (vote === dir) {
      setVote(null);
      if (dir === "up") setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (vote === "up") setUpvotes((v) => v - 1);
      if (vote === "down") setDownvotes((v) => v - 1);
      setVote(dir);
      if (dir === "up") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }
  }

  return (
    <>
      <style>{`#floating-title-input::placeholder { color: #bdbdbd; }`}</style>
      <div ref={containerRef} style={{ position: "fixed", left: 112, top: 16, zIndex: 40 }}>

        {/* Title pill */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: "white",
            border: `1px solid ${editing ? "#0b6fd3" : hovered ? "#bdbdbd" : "#e5e5e5"}`,
            borderRadius: 16,
            boxShadow: editing
              ? "0px 0px 0px 3px rgba(11,111,211,0.12), 0px 2px 4px 0px rgba(12,35,60,0.08)"
              : "0px 2px 4px 0px rgba(12,35,60,0.08)",
            padding: "8px 8px 8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            height: 64,
            cursor: "default",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        >
          {editing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
              <input
                id="floating-title-input"
                ref={inputRef}
                value={title}
                placeholder={PLACEHOLDER}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(false);
                }}
                style={{
                  ...TEXT_STYLE,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  width: Math.max(200, Math.max(title.length, PLACEHOLDER.length) * 11),
                }}
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={commit}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "none",
                  background: "#0b6fd3",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <IconCheck size={16} stroke={2.5} />
              </button>
            </div>
          ) : (
            <>
              {/* Summary / magic wand — left of title */}
              <TertiaryBtn
                label="Generate AI context summary"
                onClick={() => setSummaryOpen((v) => !v)}
                active={summaryOpen}
                activeColor="#0b6fd3"
              >
                <IconSparkles
                  size={18}
                  stroke={1.6}
                  color={summaryOpen ? "#0b6fd3" : "#616161"}
                />
              </TertiaryBtn>

              {/* Title */}
              <span
                onClick={mode === "edit" ? () => setEditing(true) : undefined}
                style={{ ...TEXT_STYLE, color: title ? "#616161" : "#bdbdbd", padding: "0 6px", cursor: mode === "edit" ? "text" : "default" }}
              >
                {title || PLACEHOLDER}
              </span>

              {mode === "view" && (
                <>
                  {/* Divider */}
                  <div style={{ width: 1, height: 22, background: "#E5E5E5", flexShrink: 0, margin: "0 4px" }} />

                  {/* Upvote */}
                  <TertiaryBtn
                    label="Upvote this notebook"
                    onClick={() => handleVote("up")}
                    active={vote === "up"}
                    activeColor="#16a34a"
                  >
                    <IconArrowBigUp
                      size={15}
                      stroke={vote === "up" ? 2.2 : 1.6}
                      color={vote === "up" ? "#16a34a" : "#616161"}
                    />
                    <span style={{ color: vote === "up" ? "#16a34a" : "#616161" }}>{upvotes}</span>
                  </TertiaryBtn>

                  {/* Downvote */}
                  <TertiaryBtn
                    label="Downvote this notebook"
                    onClick={() => handleVote("down")}
                    active={vote === "down"}
                    activeColor="#dc2626"
                  >
                    <IconArrowBigDown
                      size={15}
                      stroke={vote === "down" ? 2.2 : 1.6}
                      color={vote === "down" ? "#dc2626" : "#616161"}
                    />
                    <span style={{ color: vote === "down" ? "#dc2626" : "#616161" }}>{downvotes}</span>
                  </TertiaryBtn>
                </>
              )}

              {/* Kebab */}
              <TertiaryBtn label="More options" onClick={() => {}}>
                <IconDotsVertical size={17} stroke={1.6} color="#616161" />
              </TertiaryBtn>
            </>
          )}
        </div>

        {/* Summary dropdown */}
        {summaryOpen && (
          <div
            style={{
              position: "absolute",
              top: 72,
              left: 0,
              width: 380,
              background: "#FFFFFF",
              border: "1px solid rgba(11, 111, 211, 0.18)",
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(11, 111, 211, 0.12), 0 1px 4px rgba(12,35,60,0.08)",
              padding: "14px 16px",
              zIndex: 60,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <IconSparkles size={15} stroke={1.6} color="#0b6fd3" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 10, fontWeight: 700, color: "#0b6fd3", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Notebook Context Summary
                </p>
                <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 13, color: "#374151", lineHeight: "1.6", margin: 0 }}>
                  Analyzes Mexico&apos;s FY25 Country Partnership Framework outcomes vs. 4 LAC peers — Chile, Brazil, Colombia, and Peru — across 8 connectors including the WBG Scorecard Explorer, Operations Portal, and IFC project data. Focus areas: poverty, education, health, and climate indicators.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
