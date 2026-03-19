"use client";

import { useState, useRef, useEffect } from "react";
import { IconArrowUp, IconX } from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";


const pillStyle: React.CSSProperties = {
  fontFamily: F,
  fontSize: 13,
  fontWeight: 500,
  color: "#424242",
  background: "#FFFFFF",
  border: "1px solid #E0E0E0",
  borderRadius: 100,
  padding: "6px 14px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0px 1px 3px 0px rgba(12,35,60,0.06)",
};

// Layout constants (keep in sync with WorkspaceShell)
const PROMPT_BOTTOM = 22;
const PADDING_V = 16;        // top + bottom padding on prompt bar
const LINE_H = 24;           // px per textarea line
const MAX_LINES = 3;
const PILLS_GAP = 30;        // gap between prompt bar top edge and pills bottom
const BANNER_H = 48;         // blue context banner height (14px padding × 2 + 20px text)

interface Props {
  onSubmit?: (text: string) => void;
  onHeightChange?: (height: number) => void;
  selectedCard?: string | null;
  onClearSelection?: () => void;
  mode?: "edit" | "view";
}

export default function PromptBar({ onSubmit, onHeightChange, selectedCard, onClearSelection, mode = "edit" }: Props) {
  const PILLS =
    mode === "view"
      ? ["Compare regions", "Continue Analysis via MCP"]
      : ["Compare regions", "Continue Analysis via MCP", "Create a notebook"];
  const [value, setValue] = useState("");
  const [taHeight, setTaHeight] = useState(LINE_H); // textarea content height in px
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea on every value change
  const adjustHeight = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    const clamped = Math.min(el.scrollHeight, LINE_H * MAX_LINES);
    el.style.height = `${clamped}px`;
    setTaHeight(clamped);
  };

  const promptBarHeight = taHeight + PADDING_V * 2;
  const bannerVisible = !!selectedCard;
  // Pills sit above the banner (if visible) then the prompt bar
  const pillsBottom = PROMPT_BOTTOM + promptBarHeight + (bannerVisible ? BANNER_H : 0) + PILLS_GAP;

  // Notify parent when prompt bar changes height
  useEffect(() => {
    onHeightChange?.(promptBarHeight);
  }, [promptBarHeight, onHeightChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSubmit = () => {
    const text = value.trim();
    if (!text) return;
    setValue("");
    // Reset textarea height
    if (taRef.current) {
      taRef.current.style.height = `${LINE_H}px`;
      setTaHeight(LINE_H);
    }
    onSubmit?.(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasText = value.trim().length > 0;
  const atMax = taHeight >= LINE_H * MAX_LINES;

  return (
    <>
      {/* Contextual pill prompts */}
      <div
        style={{
          position: "fixed",
          bottom: pillsBottom,
          right: 18,
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 50,
          transition: "bottom 0.15s ease",
        }}
      >
        {PILLS.map((label) => (
          <button key={label} style={pillStyle}>
            {label}
          </button>
        ))}
      </div>

      {/* Context banner — sits flush on top of prompt bar, bottom corners bleed into it */}
      {bannerVisible && (
        <div
          style={{
            position: "fixed",
            bottom: PROMPT_BOTTOM + promptBarHeight,
            right: 18,
            width: 468,
            background: "#0B6FD3",
            borderRadius: "16px 16px 0 0",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 50,
            transition: "bottom 0.15s ease",
          }}
        >
          <button
            onClick={onClearSelection}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <IconX size={18} stroke={2} color="#FFFFFF" />
          </button>
          <span style={{ fontFamily: F, fontSize: 14, color: "#FFFFFF", lineHeight: "20px" }}>
            Chat about card{" "}
            <strong style={{ fontWeight: 700 }}>{selectedCard}</strong>
          </span>
        </div>
      )}

      {/* Prompt bar */}
      <div
        style={{
          position: "fixed",
          bottom: PROMPT_BOTTOM,
          right: 18,
          width: 468,
          background: "#FFFFFF",
          border: "1px solid #E0E0E0",
          borderRadius: bannerVisible ? "0 0 16px 16px" : 16,
          boxShadow: "0px 8px 20px 0px rgba(0, 0, 0, 0.05)",
          padding: PADDING_V,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 50,
        }}
      >
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={mode === "view" ? "Ask about this notebook" : "Give me more insights"}
          rows={1}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontFamily: F,
            fontSize: 16,
            color: "#212121",
            background: "transparent",
            resize: "none",
            lineHeight: `${LINE_H}px`,
            height: LINE_H,
            overflowY: atMax ? "auto" : "hidden",
            minWidth: 0,
            padding: 0,
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!hasText}
          aria-label="Send"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: hasText ? "#0b6fd3" : "#BDBDBD",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: hasText ? "pointer" : "default",
            transition: "background 0.15s",
          }}
        >
          <IconArrowUp size={16} stroke={2} color="#FFFFFF" />
        </button>
      </div>
    </>
  );
}
