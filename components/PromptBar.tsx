"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  IconMicrophone,
  IconArrowUp,
  IconPlus,
  IconNotebook,
  IconCheck,
  IconX,
  IconSparkles,
  IconArrowsUpDown,
  IconBook2,
} from "@tabler/icons-react";
import MadLibsInput from "./MadLibsInput";
import type { NarrativePhase } from "../app/page";

// ── Suggested-prompts dropdown data ──────────────────────────────────────────

const OUTCOME_AREAS = [
  { id: "all",       label: "All" },
  { id: "health",    label: "Health" },
  { id: "education", label: "Education" },
  { id: "private",   label: "Private Sector" },
  { id: "climate",   label: "Climate" },
] as const;

type AreaId = (typeof OUTCOME_AREAS)[number]["id"];

const AREA_PROMPTS: Record<AreaId, { compare: string[]; explore: string[] }> = {
  all: {
    compare: [
      "What explains the difference in results between FY24 and FY25?",
      "How do Sub-Saharan Africa outcomes compare to South Asia?",
      "Which regions showed the biggest improvement this fiscal year?",
      "Compare IDA and IBRD performance on private sector indicators",
      "How do FY25 results track against IDA21 policy commitments?",
    ],
    explore: [
      "How is People Reached with HNP Services measured?",
      "What methodology is used for the Electricity Access indicator?",
      "How does the Double Counting Flag affect aggregated results?",
      "What does the Financial Inclusion indicator track?",
      "How is climate co-benefit financing tracked across IDA operations?",
    ],
  },
  health: {
    compare: [
      "How did health results change between FY24 and FY25?",
      "Which regions improved most in health service delivery this year?",
      "Compare maternal and child health outcomes across IDA regions",
      "How does immunisation coverage vary across Sub-Saharan Africa?",
      "How do IDA health outcomes track against IDA21 targets?",
    ],
    explore: [
      "How is People Reached with Health, Nutrition and Population Services measured?",
      "What qualifies as an immunisation result in the IDA Scorecard?",
      "How does the Scorecard track nutrition and food security outcomes?",
      "How are maternal mortality indicators compiled and reported?",
      "Which health indicators are flagged for double-counting?",
    ],
  },
  education: {
    compare: [
      "How did education results change between FY24 and FY25?",
      "Which regions have the widest gap in learning outcomes?",
      "Compare girls' education outcomes across IDA regions",
      "How do IDA education results compare to IBRD country outcomes?",
      "How do FY25 education results track against IDA21 targets?",
    ],
    explore: [
      "How is the People Reached with Education Services indicator defined?",
      "What counts as a learning outcome in the IDA Scorecard?",
      "How does the Scorecard measure gender parity in education?",
      "How are primary school completion rates tracked?",
      "Which education indicators are most affected by double-counting?",
    ],
  },
  private: {
    compare: [
      "How did private sector results change between FY24 and FY25?",
      "Which regions attracted the most private investment this year?",
      "Compare IFC and IDA private sector outcomes across regions",
      "How do SME financing results vary across Sub-Saharan Africa?",
      "How do FY25 private sector results track against IDA21 targets?",
    ],
    explore: [
      "How is the Private Sector Jobs indicator measured in the Scorecard?",
      "What qualifies as an MSME reached in IDA operations?",
      "How is private sector mobilisation tracked across operations?",
      "What methodology underpins the Financial Inclusion indicator?",
      "How does the Scorecard track outcomes for women-owned businesses?",
    ],
  },
  climate: {
    compare: [
      "How did climate finance results change between FY24 and FY25?",
      "Which regions received the most climate co-benefit financing?",
      "Compare adaptation and mitigation outcomes across IDA regions",
      "How do IDA climate results compare to IBRD climate portfolios?",
      "How do FY25 climate results track against the IDA21 climate targets?",
    ],
    explore: [
      "How is climate co-benefit financing defined in the Scorecard?",
      "What qualifies as a climate adaptation result in IDA operations?",
      "How does the Scorecard track People Reached with Clean Energy?",
      "How is the Renewable Energy Capacity indicator compiled?",
      "Which climate indicators changed methodology since FY24?",
    ],
  },
};

type Mode = "hero" | "bottom";
type WidthMode = "compact" | "wide";

interface Props {
  mode: Mode;
  /** "compact" = 580px (home), "wide" = 680px (conversation —
   * matches the DataIntroChat input column). */
  widthMode?: WidthMode;
  /** Forwarded to parent ~3s after submit so it can swap into conversation view. */
  onComplete?: (text: string) => void;
  /** External value control (so action pills on the home page can fill the bar). */
  value: string;
  onChange: (v: string) => void;
  holdMs?: number;
  /** Fires when the "Create narrative" chip is clicked (only in conversation mode). */
  onCreateNarrative?: () => void;
  /** When true, shift the bar left to leave room for an open right-side panel. */
  panelOpen?: boolean;
  /** Width of the right-side panel (used to compute the shifted center). */
  panelWidth?: number;
  /** When dragging the panel resize handle, skip CSS transitions for live feedback. */
  suppressTransition?: boolean;
  /** Show the "Create narrative" chip (only in conversation mode). */
  showCreateChip?: boolean;
  /** Current phase of the narrative creation flow — controls which chips to show. */
  narrativePhase?: NarrativePhase;
  /** Fires when the user clicks "Yes, create narrative" in skeleton-ready phase. */
  onNarrativeConfirm?: () => void;
  /** Fires when the user clicks "Make changes" in skeleton-ready phase. */
  onNarrativeMakeChanges?: () => void;
  /** When true, the "Yes, create narrative" button is disabled (no skeleton picked yet). */
  narrativeConfirmDisabled?: boolean;
  /** When set, renders a "Refining: <title>" reference chip above the input.
   * Submits route to `onRefineSubmit` instead of being no-ops. */
  refiningChip?: { title: string; onDismiss: () => void };
  /** Called when the user hits Enter / clicks Submit while a refining chip
   *  is active. Receives the typed text and is expected to clear the field. */
  onRefineSubmit?: (text: string) => void;
  /** When set, renders a "Create narrative" tag chip above the input. The
   *  next submit routes to onCreateNarrativeSubmit instead of starting a
   *  regular conversation. Mutually exclusive with refiningChip. */
  createNarrativeChip?: { onDismiss: () => void };
  /** Called when the user hits Enter / clicks Submit while the
   *  create-narrative tag is active. */
  onCreateNarrativeSubmit?: (text: string) => void;
  /** When true, submit doesn't trigger a new conversation transition. */
  inConversation?: boolean;
  /** Fires immediately when the user hits Enter / clicks send. Lets the parent
   *  scroll the home view back to the hero before the beam runs. */
  onSubmit?: () => void;
  /** When set, renders an "Editing: [excerpt]" chip above the input and routes
   *  submit to onContentModifySubmit. Mutually exclusive with other chips. */
  contentModifyChip?: { text: string; onDismiss: () => void };
  onContentModifySubmit?: (instruction: string) => void;
  /** Optional ref forwarded to the underlying text input so parent can call .focus(). */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const HERO_TOP = 112;
const PILL_HEIGHT = 48;
// Extra height added to the docked bar when a refining chip is rendered above
// the input row. Used to shift the bar (and its accessory chips/glow) upward
// so the bottom edge stays within the viewport.
const REFINING_EXTRA = 38;
const BOTTOM_GAP = 24;

export default function PromptBar({
  mode,
  widthMode = "compact",
  onComplete,
  value,
  onChange,
  holdMs = 3000,
  onCreateNarrative,
  panelOpen = false,
  panelWidth = 0,
  suppressTransition = false,
  showCreateChip = false,
  narrativePhase = "idle" as NarrativePhase,
  onNarrativeConfirm,
  onNarrativeMakeChanges,
  narrativeConfirmDisabled = false,
  refiningChip,
  onRefineSubmit,
  createNarrativeChip,
  onCreateNarrativeSubmit,
  inConversation = false,
  onSubmit,
  contentModifyChip,
  onContentModifySubmit,
  inputRef,
}: Props) {
  const widthCss = widthMode === "wide"
    ? "min(680px, calc(100% - 48px))"
    : "min(580px, calc(100% - 32px))";
  const expandedWidthCss = "min(680px, calc(100% - 48px))";

  const leftCss = panelOpen
    ? `calc((100vw - ${panelWidth}px) / 2)`
    : "50%";

  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Suffix text typed after the "Create a narrative" prefix in bottom-bar mode.
  const [narrativeSuffix, setNarrativeSuffix] = useState("");

  // ── Suggestions dropdown ──────────────────────────────────────────────────
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaId>("all");
  const [visibleSection, setVisibleSection] = useState<"compare" | "explore" | "all">("all");
  const formRef = useRef<HTMLFormElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState({
    topAnchor: 0, bottomAnchor: 0, left: 0, width: 0,
  });

  const openSuggestions = () => {
    const el = formRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDropdownPos({
      topAnchor: r.bottom + 8,
      bottomAnchor: window.innerHeight - r.top + 8,
      left: r.left,
      width: r.width,
    });
    // Show only the relevant section when a pill pre-filled the bar.
    const v = value.toLowerCase();
    if (v.startsWith("compare results")) {
      setVisibleSection("compare");
    } else if (v.startsWith("explore an indicator")) {
      setVisibleSection("explore");
    } else {
      setVisibleSection("all");
    }
    setShowSuggestions(true);
  };

  const isBottom = mode === "bottom";
  const hasChip = !!refiningChip || !!createNarrativeChip || !!contentModifyChip;
  const extraHeight = hasChip ? REFINING_EXTRA : 0;

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const triggerBeam = (v: string) => {
    onSubmit?.();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    timers.current.push(setTimeout(() => {
      setSubmitted(false);
      requestAnimationFrame(() => setSubmitted(true));
    }, 0));
    timers.current.push(setTimeout(() => onComplete?.(v), holdMs));
  };

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    // Content-modify flow: hand the instruction to the panel and exit.
    if (onContentModifySubmit) {
      onContentModifySubmit(v);
      onChange("");
      return;
    }
    // Refining flow: short-circuit the new-conversation path and hand the
    // text to the parent's refinement handler instead.
    if (onRefineSubmit) {
      onRefineSubmit(v);
      return;
    }
    // Landing-page "Create a narrative" flow: open the conversation directly
    // in the planning phase instead of running the AI Q&A path.
    if (onCreateNarrativeSubmit) {
      onSubmit?.();
      const beamDelay = isBottom ? 700 : 0;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      timers.current.push(setTimeout(() => {
        setSubmitted(false);
        requestAnimationFrame(() => setSubmitted(true));
      }, beamDelay));
      timers.current.push(setTimeout(() => onCreateNarrativeSubmit(v), beamDelay + holdMs));
      return;
    }
    if (inConversation) return;
    onSubmit?.();
    const beamDelay = isBottom ? 700 : 0;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    timers.current.push(setTimeout(() => {
      setSubmitted(false);
      requestAnimationFrame(() => setSubmitted(true));
    }, beamDelay));
    timers.current.push(setTimeout(() => onComplete?.(v), beamDelay + holdMs));
  };

  useEffect(() => {
    if (mode !== "hero") { setSubmitted(false); setExpanded(false); }
  }, [mode]);

  // When the create-narrative chip activates in bottom-bar mode, pre-fill the
  // parent value with the fixed prefix and reset the local suffix field.
  // Dependency is the boolean coercion so this only fires on activate/deactivate.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!createNarrativeChip) { setNarrativeSuffix(""); return; }
    setNarrativeSuffix("");
    onChange("Create a narrative ");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!createNarrativeChip]);

  // Close expanded when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is inside the expanded card
      const card = document.getElementById("madlibs-card");
      if (card && !card.contains(target)) setExpanded(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [expanded]);

  // Close suggestions dropdown on outside click or Escape
  useEffect(() => {
    if (!showSuggestions) return;
    const onDown = (e: MouseEvent) => {
      const form = formRef.current;
      const drop = document.getElementById("prompt-suggestions-dropdown");
      const t = e.target as Node;
      if (form && !form.contains(t) && (!drop || !drop.contains(t))) {
        setShowSuggestions(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSuggestions(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showSuggestions]);

  const handleMadLibsSubmit = (prompt: string) => {
    setExpanded(false);
    onChange(prompt);
    // Landing-page create-narrative mode owns its own completion callback —
    // run the beam visualisation, then dispatch to it instead of onComplete.
    if (onCreateNarrativeSubmit) {
      onSubmit?.();
      timers.current.forEach(clearTimeout);
      timers.current = [];
      timers.current.push(setTimeout(() => {
        setSubmitted(false);
        requestAnimationFrame(() => setSubmitted(true));
      }, 0));
      timers.current.push(setTimeout(() => onCreateNarrativeSubmit(prompt), holdMs));
      return;
    }
    triggerBeam(prompt);
  };

  const handleMadLibsAllPlaced = (prompt: string) => {
    onChange(prompt);
    // In create-narrative mode we keep MadLibs visible so the user can still
    // add or remove pills; let the explicit submit drive completion.
    if (onCreateNarrativeSubmit) return;
    setExpanded(false);
  };

  return (
    <>
      {/* BEAM */}
      {submitted && !isBottom && (
        <div
          aria-hidden
          className="fixed pointer-events-none overflow-hidden"
          style={{ top: 75, left: 0, right: 0, height: 360, zIndex: 45 }}
        >
          <div
            className="prompt-beam absolute"
            style={{
              top: 0,
              left: "50%",
              width: "min(1400px, 100vw)",
              height: 280,
              transform: "translateX(-50%)",
              borderRadius: "50%",
            }}
          />
        </div>
      )}
      {submitted && !isBottom && (
        <div
          aria-hidden
          className="prompt-stroke fixed left-0 right-0"
          style={{ top: 72, height: 3, zIndex: 55 }}
        />
      )}
      {submitted && !isBottom && (
        <div
          aria-hidden
          className="prompt-dim-overlay fixed left-0 right-0 bottom-0"
          style={{ top: 72, zIndex: 40 }}
        />
      )}

      {/* Narrative chips — "Yes / Make changes" pair shown only in
          skeleton-ready phase after a card is selected. The earlier
          "Create narrative" entry point now lives on the landing page. */}
      {isBottom && showCreateChip && narrativePhase === "skeleton-ready" && (
        <div
          className={`fixed flex justify-end gap-2 ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
          style={{
            left: leftCss,
            transform: "translateX(-50%)",
            top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 36 + extraHeight}px)`,
            width: widthCss,
            zIndex: 50,
            transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <button
            type="button"
            onClick={() => onNarrativeMakeChanges?.()}
            className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-colors"
          >
            Make changes
          </button>
          <button
            type="button"
            onClick={() => onNarrativeConfirm?.()}
            disabled={narrativeConfirmDisabled}
            aria-disabled={narrativeConfirmDisabled}
            className={
              "flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-full shadow-sm transition-colors" +
              (narrativeConfirmDisabled
                ? " text-gray-400 bg-gray-200 border border-gray-200 cursor-not-allowed"
                : " text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 active:scale-[0.98]")
            }
          >
            <IconCheck size={12} />
            Yes, create narrative
          </button>
        </div>
      )}

      {/* Mild ambient glow behind the docked prompt bar on the home
          view. Hidden in conversation/viewer/workspace flows. */}
      {isBottom && !inConversation && (
        <div
          aria-hidden
          className="prompt-bottom-glow fixed pointer-events-none"
          style={{
            left: leftCss,
            top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 40 + extraHeight}px)`,
            width: widthCss,
            height: PILL_HEIGHT + 80 + extraHeight,
            zIndex: 49,
          }}
        />
      )}

      {/* ── Single bar — same pill, grows taller when expanded ── */}
      <form
        ref={formRef}
        id="madlibs-card"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className={`fixed ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
        style={{
          left: leftCss,
          transform: "translateX(-50%)",
          top: isBottom
            ? `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + extraHeight}px)`
            : `${HERO_TOP}px`,
          width: !isBottom && expanded ? expandedWidthCss : widthCss,
          zIndex: 50,
          transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
          className={`bg-white border border-gray-200 hover:shadow-md focus-within:border-blue-400 focus-within:shadow-md focus-within:ring-[3px] focus-within:ring-blue-50 ${
            (!isBottom && expanded) || hasChip
              ? "rounded-[28px]"
              : "rounded-full hover:border-gray-300 cursor-text"
          }`}
          style={{
            transitionProperty: "border-radius, box-shadow, border-color",
            transitionDuration: "200ms",
            // Landing-page promptbar: soft teal halo glow on the
            // border so the bar reads as the primary interactive surface,
            // matching the page's pale-teal gradient. Inner ring + soft
            // outer aura, collapsed to a flat shadow once the user
            // enters conversation/viewer/workspace mode.
            boxShadow: inConversation
              ? "0 1px 2px rgba(0,0,0,0.04)"
              : "0 0 0 1px rgba(15,118,110,0.22), 0 0 24px rgba(45,212,191,0.32), 0 0 56px rgba(15,118,110,0.14), 0 1px 2px rgba(0,0,0,0.04)",
          }}
          onClick={() => {
            if (refiningChip) return;
            // Create-narrative mode: expand to MadLibs as before.
            if (createNarrativeChip) {
              if (!expanded) setExpanded(true);
              return;
            }
            if (inConversation) return;
            // All other landing-page clicks: open suggestions dropdown instead
            // of MadLibs (prevents MadLibs auto-submit on pre-filled text).
            if (!showSuggestions && !hasChip) openSuggestions();
          }}
        >
          <div className="flex flex-col">
            {refiningChip && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(167,139,250,0.10)] border border-violet-300 text-[11.5px] font-medium text-violet-800 max-w-full">
                  <span className="opacity-70 shrink-0">Refining:</span>
                  <span className="truncate">{refiningChip.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      refiningChip.onDismiss();
                    }}
                    aria-label="Cancel refining"
                    className="ml-0.5 -mr-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-violet-200/70 transition-colors shrink-0"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              </div>
            )}
            {contentModifyChip && !refiningChip && !createNarrativeChip && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-[11.5px] font-medium text-violet-800 max-w-full">
                  <IconSparkles size={11} className="shrink-0 text-violet-500" />
                  <span className="opacity-60 shrink-0">Editing:</span>
                  <span className="truncate max-w-[200px]">{contentModifyChip.text}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); contentModifyChip.onDismiss(); }}
                    aria-label="Cancel editing"
                    className="ml-0.5 -mr-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-violet-200/70 transition-colors shrink-0"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              </div>
            )}
            {createNarrativeChip && !refiningChip && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(167,139,250,0.10)] border border-violet-300 text-[11.5px] font-semibold text-violet-700 max-w-full">
                  <IconNotebook size={11} className="shrink-0" />
                  <span className="truncate">Create narrative</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      createNarrativeChip.onDismiss();
                    }}
                    aria-label="Cancel create narrative"
                    className="ml-0.5 -mr-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-violet-200/70 transition-colors shrink-0"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              </div>
            )}
            {!isBottom && (expanded || createNarrativeChip) ? (
              <MadLibsInput
                initialText={value}
                onSubmit={handleMadLibsSubmit}
                onDismiss={() => {
                  // In create-narrative mode there's no separate "collapse"
                  // state to fall back to — leave the bar in MadLibs so the
                  // user can keep editing. In regular mode, dismiss as usual.
                  if (!createNarrativeChip) setExpanded(false);
                }}
                onAllPlaced={handleMadLibsAllPlaced}
                includeOutcomeArea={!!createNarrativeChip}
                placeholder={
                  createNarrativeChip
                    ? "Which outcome area and angle should this year's narrative focus on?"
                    : undefined
                }
              />
            ) : (
            <div className={`flex items-center gap-2 px-4 ${hasChip ? "pb-3 pt-1" : "py-2.5"}`}>
              {isBottom && createNarrativeChip
                ? <IconNotebook size={15} className="text-violet-500 shrink-0" />
                : <IconPlus size={15} className="text-gray-400 shrink-0" />
              }
              {isBottom && createNarrativeChip ? (
                <>
                  <span className="text-[14px] font-medium text-gray-800 shrink-0 select-none">
                    Create a narrative
                  </span>
                  <input
                    type="text"
                    value={narrativeSuffix}
                    onChange={(e) => {
                      setNarrativeSuffix(e.target.value);
                      onChange("Create a narrative " + e.target.value);
                      if (submitted) setSubmitted(false);
                    }}
                    placeholder="for protection for the poorest in Sub-Saharan Africa"
                    className="flex-1 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none"
                    aria-label="Describe the narrative"
                    autoFocus
                  />
                </>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    if (submitted) setSubmitted(false);
                    if (showSuggestions) setShowSuggestions(false);
                  }}
                  onFocus={() => {
                    if (hasChip || inConversation) return;
                    if (!showSuggestions) openSuggestions();
                  }}
                  placeholder={
                    contentModifyChip
                      ? "Describe the change you want to make to this passage…"
                      : refiningChip
                      ? "Describe the changes you want to make…"
                      : isBottom
                      ? "Ask a follow-up question"
                      : "What do you want to learn about IDA results?"
                  }
                  className="flex-1 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none"
                  aria-label="Search the scorecard"
                  autoFocus={!!contentModifyChip}
                />
              )}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Voice input"
                >
                  <IconMicrophone size={16} />
                </button>
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-white transition-colors"
                  style={{ background: value.trim() ? "#111" : "#BDBDBD" }}
                  aria-label="Submit"
                >
                  <IconArrowUp size={14} />
                </button>
              </div>
            </div>
            )}
          </div>
        </motion.div>
      </form>

      {/* ── Suggested-prompts dropdown ──────────────────────────────────────
          Renders as a fixed panel below (hero) or above (bottom) the bar.
          Uses portals via fixed positioning — no DOM ancestor needed. */}
      {showSuggestions && !hasChip && !inConversation && (
        <div
          id="prompt-suggestions-dropdown"
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-fade-in"
          style={{
            position: "fixed",
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 51,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
            ...(isBottom
              ? { bottom: dropdownPos.bottomAnchor }
              : { top: dropdownPos.topAnchor }),
          }}
        >
          {/* Outcome area filter pills */}
          <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 flex-wrap">
            {OUTCOME_AREAS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSelectedArea(id)}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-full transition-colors ${
                  selectedArea === id
                    ? "bg-[#0288D1] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h-px bg-gray-100 mx-3 mb-1" />

          {/* Compare results */}
          {(visibleSection === "all" || visibleSection === "compare") && (
            <div className="px-2 pb-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <IconArrowsUpDown size={11} className="text-gray-400" />
                <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">
                  Compare results
                </span>
              </div>
              {AREA_PROMPTS[selectedArea].compare.map((p) => (
                <button
                  key={p}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(p); setShowSuggestions(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-[13px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {visibleSection === "all" && <div className="h-px bg-gray-100 mx-3 my-1" />}

          {/* Explore an indicator */}
          {(visibleSection === "all" || visibleSection === "explore") && (
            <div className="px-2 pt-1 pb-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <IconBook2 size={11} className="text-gray-400" />
                <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">
                  Explore an indicator
                </span>
              </div>
              {AREA_PROMPTS[selectedArea].explore.map((p) => (
                <button
                  key={p}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(p); setShowSuggestions(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-[13px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
