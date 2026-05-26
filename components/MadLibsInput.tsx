"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronDown, IconCheck, IconX, IconPlus, IconArrowUp, IconMicrophone } from "@tabler/icons-react";

// ─── Param definitions ───────────────────────────────────────────────────────

export type ParamId = "financingInstitution" | "geography" | "sector";

interface ParamDef {
  id: ParamId;
  label: string;
  kind: "dropdown" | "freetext";
  bg: string;
  fg: string;
  border: string;
  nudgeBg: string;
  options?: string[];
  disabledOptions?: string[];
  placeholder: string;
}

// Placed pills share the "intent blue" palette regardless of paramId.
const PLACED_BG = "#E6F1FB";
const PLACED_FG = "#0C447C";
const PLACED_BORDER = "#B5D4F4";

const PARAMS: Record<ParamId, ParamDef> = {
  financingInstitution: {
    id: "financingInstitution",
    label: "Financing Institution",
    kind: "dropdown",
    bg: PLACED_BG,
    fg: PLACED_FG,
    border: PLACED_BORDER,
    nudgeBg: "rgba(230,241,251,0.5)",
    options: ["World Bank", "IBRD", "IDA", "IFC", "MIGA"],
    disabledOptions: ["World Bank", "IBRD", "IFC", "MIGA"],
    placeholder: "pick an institution…",
  },
  geography: {
    id: "geography",
    label: "Geography",
    kind: "dropdown",
    bg: "#EAF3DE",
    fg: "#27500A",
    border: "#C0DD97",
    nudgeBg: "rgba(234,243,222,0.5)",
    options: [
      "Global",
      "Sub-Saharan Africa",
      "South Asia",
      "East Asia & Pacific",
      "Latin America & Caribbean",
      "Middle East & North Africa",
      "Europe & Central Asia",
    ],
    placeholder: "pick a region…",
  },
  sector: {
    id: "sector",
    label: "Sector",
    kind: "dropdown",
    bg: "#FAEEDA",
    fg: "#854F0B",
    border: "#FAC775",
    nudgeBg: "rgba(250,238,218,0.5)",
    options: [
      "Poverty & Social Protection",
      "Health & Nutrition",
      "Education",
      "Climate & Environment",
      "Infrastructure",
      "Digital Development",
      "Gender Equality",
      "Finance & Private Sector",
    ],
    placeholder: "pick a sector…",
  },
};

const PARAM_ORDER: ParamId[] = ["financingInstitution", "geography", "sector"];

// ─── Segment model ───────────────────────────────────────────────────────────
// The input row is a sequence of inline segments. Pills are inserted at the
// caret (= end of trailing text), so a sentence reads naturally:
//   [text][pill][text][pill][trailing text]
// The trailing text segment is always the live typing target.

type TextSegment = { kind: "text"; id: string; value: string };
type PillSegment = { kind: "pill"; id: string; paramId: ParamId; value: string };
type Segment = TextSegment | PillSegment;

const makeId = () => Math.random().toString(36).slice(2, 10);

// field-sizing is a modern CSS prop (Chrome 123+, Safari 17.4+, FF 123+) that
// auto-sizes an input to its content. Lets non-trailing text segments shrink
// to fit so pills sit tight against their text.
const fieldSizingStyle = { fieldSizing: "content" } as unknown as CSSProperties;

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  initialText?: string;
  onSubmit: (prompt: string) => void;
  onDismiss: () => void;
  /** Fires (with the built prompt) when the nudge row empties. */
  onAllPlaced?: (prompt: string) => void;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MadLibsInput({ initialText = "", onSubmit, onDismiss, onAllPlaced }: Props) {
  const [segments, setSegments] = useState<Segment[]>(() => [
    { kind: "text", id: "init", value: initialText },
  ]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const trailingInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placedParamIds = segments
    .filter((s): s is PillSegment => s.kind === "pill")
    .map(s => s.paramId);
  const unplaced = PARAM_ORDER.filter(p => !placedParamIds.includes(p));
  const allPlaced = unplaced.length === 0;

  // Build the prompt by walking segments in order. Pill values inline with
  // text gives a natural sentence: "show me X for Geography on Sector".
  const buildPrompt = () => {
    const parts: string[] = [];
    segments.forEach(s => {
      const v = s.kind === "text" ? s.value : s.value.trim();
      if (v) parts.push(v);
    });
    return parts.join(" ").replace(/\s+/g, " ").trim();
  };

  // Auto-collapse only after every pill has a value AND no dropdown is mid-pick.
  // Including `segments` re-runs the effect on every keystroke, resetting the
  // 600ms timer until the user pauses.
  const allFilled =
    allPlaced && segments.every(s => s.kind !== "pill" || s.value.trim() !== "");
  useEffect(() => {
    if (!allFilled || openDropdown) return;
    const t = setTimeout(() => onAllPlaced?.(buildPrompt()), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFilled, segments, openDropdown]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openDropdown]);

  // Insert a pill at the caret (= after the current trailing text). The old
  // trailing text becomes a committed mid-segment and a fresh empty text
  // segment is created after the pill.
  const addPill = (paramId: ParamId) => {
    setSegments(prev => [
      ...prev,
      { kind: "pill", id: makeId(), paramId, value: "" },
      { kind: "text", id: makeId(), value: "" },
    ]);
    setTimeout(() => trailingInputRef.current?.focus(), 60);
  };

  // Removing a pill merges the surrounding text segments back together so the
  // sentence flows seamlessly.
  const removePill = (segId: string) => {
    setSegments(prev => {
      const idx = prev.findIndex(s => s.id === segId);
      if (idx < 0) return prev;
      const before = prev[idx - 1];
      const after = prev[idx + 1];
      if (before?.kind === "text" && after?.kind === "text") {
        const merged: TextSegment = {
          kind: "text",
          id: before.id,
          value: before.value + after.value,
        };
        return [...prev.slice(0, idx - 1), merged, ...prev.slice(idx + 2)];
      }
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    setOpenDropdown(null);
  };

  const updateTextValue = (segId: string, value: string) => {
    setSegments(prev =>
      prev.map(s => (s.id === segId && s.kind === "text" ? { ...s, value } : s))
    );
  };

  const updatePillValue = (segId: string, value: string) => {
    setSegments(prev =>
      prev.map(s => (s.id === segId && s.kind === "pill" ? { ...s, value } : s))
    );
  };

  const handleSubmit = () => {
    const p = buildPrompt();
    if (!p.trim()) return;
    onSubmit(p);
  };

  const trailingIdx = segments.length - 1;
  const showInitialPlaceholder =
    segments.length === 1 &&
    segments[0].kind === "text" &&
    segments[0].value === "";

  return (
    <div ref={containerRef} className="w-full flex flex-col">
      {/* ── Tag + input row ── */}
      <div className="flex items-start gap-2 px-4 py-3">
        <IconPlus size={15} className="text-gray-400 shrink-0 mt-[9px]" />

        {/* The whole row is one typable area — the trailing input flex-grows
            to fill, pills and committed text fragments sit inline in order.
            Clicking anywhere in the row focuses the trailing input. */}
        <div
          className="flex-1 flex flex-wrap items-center gap-x-1 gap-y-1.5 min-h-[32px] cursor-text"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-pill]")) return;
            if ((e.target as HTMLElement).tagName === "INPUT") return;
            trailingInputRef.current?.focus();
          }}
        >
          {segments.map((seg, i) => {
            if (seg.kind === "text") {
              const isTrailing = i === trailingIdx;
              return (
                <input
                  key={seg.id}
                  ref={isTrailing ? trailingInputRef : undefined}
                  value={seg.value}
                  onChange={e => updateTextValue(seg.id, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Backspace" && seg.value === "" && i > 0) {
                      const prev = segments[i - 1];
                      if (prev.kind === "pill") {
                        e.preventDefault();
                        removePill(prev.id);
                      }
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                    if (e.key === "Escape") onDismiss();
                  }}
                  placeholder={
                    isTrailing && showInitialPlaceholder
                      ? "What do you want to learn about IDA results?"
                      : ""
                  }
                  className={
                    "bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none py-0.5 " +
                    (isTrailing ? "flex-1 min-w-[120px]" : "min-w-[4px]")
                  }
                  style={isTrailing ? undefined : fieldSizingStyle}
                  autoFocus={
                    isTrailing && (i === 0 || segments[i - 1]?.kind === "pill")
                  }
                />
              );
            }
            return (
              <motion.div
                key={seg.id}
                data-pill
                layoutId={`param-${seg.paramId}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.7 }}
                style={{ display: "inline-flex" }}
              >
                <EditorPill
                  paramId={seg.paramId}
                  value={seg.value}
                  onValueChange={v => updatePillValue(seg.id, v)}
                  open={openDropdown === seg.id}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === seg.id ? null : seg.id)
                  }
                  onRemove={() => removePill(seg.id)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 mt-1">
          <button
            type="button"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Voice input"
          >
            <IconMicrophone size={16} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!buildPrompt().trim()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-white transition-colors"
            style={{ background: buildPrompt().trim() ? "#111" : "#BDBDBD" }}
            aria-label="Submit"
          >
            <IconArrowUp size={14} />
          </button>
        </div>
      </div>

      {/* ── Nudge row ── */}
      <AnimatePresence>
        {unplaced.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-t border-gray-100">
              <AnimatePresence mode="popLayout">
                {unplaced.map(paramId => (
                  <NudgePill key={paramId} paramId={paramId} onAdd={() => addPill(paramId)} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Editor pill ─────────────────────────────────────────────────────────────

function EditorPill({
  paramId,
  value,
  onValueChange,
  open,
  onToggle,
  onRemove,
}: {
  paramId: ParamId;
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const p = PARAMS[paramId];
  const ftRef = useRef<HTMLInputElement>(null);

  // Auto-focus the freetext input when pill first appears
  useEffect(() => {
    if (p.kind === "freetext") {
      setTimeout(() => ftRef.current?.focus(), 80);
    }
    if (p.kind === "dropdown") {
      setTimeout(() => onToggle(), 80);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once a pill is placed in the bar, all params share the intent-blue palette.
  const placedBg = PLACED_BG;
  const placedFg = PLACED_FG;
  const placedBorder = PLACED_BORDER;

  return (
    <div className="relative inline-flex">
      <div
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium border"
        style={{ background: placedBg, color: placedFg, borderColor: placedBorder }}
      >

        {p.kind === "dropdown" ? (
          <button
            onClick={onToggle}
            className="flex items-center gap-0.5 font-semibold hover:opacity-75 transition-opacity"
            style={{ color: placedFg }}
          >
            {value
              ? <span>{value}</span>
              : <span className="font-normal opacity-50">{p.placeholder}</span>
            }
            <IconChevronDown
              size={11}
              style={{ opacity: 0.6 }}
              className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <input
            ref={ftRef}
            value={value}
            onChange={e => onValueChange(e.target.value)}
            onKeyDown={e => {
              // Don't bubble backspace out to remove the pill while typing
              if (e.key === "Backspace" && value === "") {
                e.stopPropagation();
              } else {
                e.stopPropagation();
              }
            }}
            placeholder={p.placeholder}
            className="bg-transparent outline-none font-medium"
            style={{ color: placedFg, caretColor: placedFg, minWidth: 48, width: Math.max(48, value.length * 8) }}
          />
        )}

        <button
          onClick={onRemove}
          className="opacity-40 hover:opacity-80 transition-opacity ml-0.5"
          aria-label={`Remove ${p.label}`}
        >
          <IconX size={10} />
        </button>
      </div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && p.kind === "dropdown" && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-[calc(100%+5px)] left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[60] min-w-[200px]"
          >
            {p.options!.map(opt => {
              const disabled = p.disabledOptions?.includes(opt) ?? false;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (disabled) return;
                    onValueChange(opt);
                    onToggle();
                  }}
                  disabled={disabled}
                  aria-disabled={disabled}
                  className={
                    "w-full flex items-center gap-2 px-3 py-2 text-[12.5px] text-left transition-colors " +
                    (disabled
                      ? "cursor-not-allowed text-gray-300"
                      : "hover:bg-gray-50")
                  }
                  style={
                    disabled
                      ? undefined
                      : { color: value === opt ? placedFg : "#374151" }
                  }
                >
                  {value === opt && !disabled
                    ? <IconCheck size={12} style={{ color: placedFg }} />
                    : <span className="w-3 inline-block" />
                  }
                  {opt}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Nudge pill ──────────────────────────────────────────────────────────────

function NudgePill({ paramId, onAdd }: { paramId: ParamId; onAdd: () => void }) {
  const p = PARAMS[paramId];
  return (
    <motion.button
      layoutId={`param-${paramId}`}
      onClick={onAdd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
      whileHover={{ scale: 1.04, opacity: 0.9 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.7 }}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{
        color: "#6B7280",
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
        background: "rgba(243,244,246,0.6)",
        opacity: 0.85,
      }}
    >
      <IconPlus size={10} strokeWidth={2.5} />
      {p.label}
    </motion.button>
  );
}
