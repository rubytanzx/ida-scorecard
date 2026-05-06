"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronDown, IconCheck, IconX, IconPlus, IconArrowUp, IconMicrophone } from "@tabler/icons-react";

// ─── Param definitions ───────────────────────────────────────────────────────

export type ParamId = "goal" | "geography" | "sector" | "audience";

interface ParamDef {
  id: ParamId;
  label: string;
  kind: "dropdown" | "freetext";
  bg: string;
  fg: string;
  border: string;
  nudgeBg: string;
  options?: string[];
  placeholder: string;
}

const PARAMS: Record<ParamId, ParamDef> = {
  goal: {
    id: "goal",
    label: "Goal",
    kind: "freetext",
    bg: "#E6F1FB",
    fg: "#0C447C",
    border: "#B5D4F4",
    nudgeBg: "rgba(230,241,251,0.5)",
    placeholder: "describe your goal…",
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
  audience: {
    id: "audience",
    label: "Audience",
    kind: "freetext",
    bg: "#EEEDFE",
    fg: "#3C3489",
    border: "#CECBF6",
    nudgeBg: "rgba(238,237,254,0.5)",
    placeholder: "who will read this…",
  },
};

const PARAM_ORDER: ParamId[] = ["geography", "sector", "audience", "goal"];

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
  const [text, setText] = useState(initialText);
  const [placed, setPlaced] = useState<ParamId[]>([]);
  const [values, setValues] = useState<Record<ParamId, string>>({
    goal: "", geography: "", sector: "", audience: "",
  });
  const [openDropdown, setOpenDropdown] = useState<ParamId | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unplaced = PARAM_ORDER.filter(p => !placed.includes(p));
  const allPlaced = unplaced.length === 0;

  // Build the prompt string — text first, then pill values (matches the
  // visual order in the bar). No "Label:" prefix.
  const buildPrompt = () => {
    const parts: string[] = [];
    if (text.trim()) parts.push(text.trim());
    placed.forEach(p => {
      const v = values[p].trim();
      if (v) parts.push(v);
    });
    return parts.join("  ");
  };

  // Auto-collapse only after every pill has a value AND no dropdown is mid-pick.
  // Including `values` in the deps re-runs the effect on every keystroke,
  // resetting the 600ms timer until the user pauses — so we don't collapse
  // out from under someone who's still typing the last pill's value.
  const allFilled = allPlaced && PARAM_ORDER.every(p => values[p].trim() !== "");
  useEffect(() => {
    if (!allFilled || openDropdown) return;
    const t = setTimeout(() => onAllPlaced?.(buildPrompt()), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFilled, values, openDropdown]);

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

  const addPill = (paramId: ParamId) => {
    setPlaced(prev => [...prev, paramId]);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const removePill = (paramId: ParamId) => {
    setPlaced(prev => prev.filter(p => p !== paramId));
    setValues(prev => ({ ...prev, [paramId]: "" }));
    setOpenDropdown(null);
  };

  const handleSubmit = () => {
    const p = buildPrompt();
    if (!p.trim()) return;
    onSubmit(p);
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col">
      {/* ── Tag + input row ── */}
      <div className="flex items-start gap-2 px-4 py-3">
        <IconPlus size={15} className="text-gray-400 shrink-0 mt-[9px]" />

        {/* Text input first, pills inline after it. `field-sizing: content`
            shrinks the input to its typed value so pills sit immediately
            behind the text instead of being pushed in front of it. */}
        <div
          className="flex-1 flex flex-wrap items-center gap-1.5 min-h-[32px] cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Backspace" && text === "" && placed.length > 0) {
                removePill(placed[placed.length - 1]);
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") onDismiss();
            }}
            placeholder={placed.length === 0 ? "What do you want to learn about IDA results?" : ""}
            className="bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none py-0.5 [field-sizing:content]"
            style={{ minWidth: placed.length === 0 ? "100%" : 80, maxWidth: "100%" }}
            autoFocus
          />

          <AnimatePresence mode="popLayout">
            {placed.map(paramId => (
              <motion.div
                key={paramId}
                layoutId={`param-${paramId}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.7 }}
                style={{ display: "inline-flex" }}
              >
                <EditorPill
                  paramId={paramId}
                  value={values[paramId]}
                  onValueChange={v => setValues(prev => ({ ...prev, [paramId]: v }))}
                  open={openDropdown === paramId}
                  onToggle={() => setOpenDropdown(openDropdown === paramId ? null : paramId)}
                  onRemove={() => removePill(paramId)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
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

  // Once a pill is placed in the bar, all params use the Goal blue palette.
  const placedBg = PARAMS.goal.bg;
  const placedFg = PARAMS.goal.fg;
  const placedBorder = PARAMS.goal.border;

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
            {p.options!.map(opt => (
              <button
                key={opt}
                onClick={() => { onValueChange(opt); onToggle(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] text-left transition-colors hover:bg-gray-50"
                style={{ color: value === opt ? placedFg : "#374151" }}
              >
                {value === opt
                  ? <IconCheck size={12} style={{ color: placedFg }} />
                  : <span className="w-3 inline-block" />
                }
                {opt}
              </button>
            ))}
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
