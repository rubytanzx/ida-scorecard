"use client";

import { useState, useRef, useEffect } from "react";
import { IconCheck } from "@tabler/icons-react";

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: "'Open Sans', sans-serif",
  fontSize: 18,
  fontWeight: 600,
  color: "#616161",
  lineHeight: "140%",
  whiteSpace: "nowrap",
};

const PLACEHOLDER = "Name your notebook";

interface Props {
  initialTitle?: string;
}

export default function FloatingTitle({ initialTitle = "Country Partnership Framework for Mexico FY25" }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    setTitle((t) => t.trim());
  }

  return (
    <>
    <style>{`#floating-title-input::placeholder { color: #bdbdbd; }`}</style>
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !editing && setEditing(true)}
      style={{
        position: "fixed",
        left: 112,
        top: 16,
        zIndex: 40,
        background: "white",
        border: `1px solid ${editing ? "#0b6fd3" : hovered ? "#bdbdbd" : "#e5e5e5"}`,
        borderRadius: 16,
        boxShadow: editing
          ? "0px 0px 0px 3px rgba(11,111,211,0.12), 0px 2px 4px 0px rgba(12,35,60,0.08)"
          : "0px 2px 4px 0px rgba(12,35,60,0.08)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        height: 64,
        cursor: editing ? "text" : "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {editing ? (
        <>
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
              marginLeft: 8,
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
        </>
      ) : (
        <span style={{ ...TEXT_STYLE, color: title ? "#616161" : "#bdbdbd" }}>
          {title || PLACEHOLDER}
        </span>
      )}
    </div>
    </>
  );
}
