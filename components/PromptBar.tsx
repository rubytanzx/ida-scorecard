"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  IconMicrophone,
  IconArrowUp,
  IconPlus,
  IconNotebook,
  IconCheck,
} from "@tabler/icons-react";
import MadLibsInput from "./MadLibsInput";
import type { NarrativePhase } from "../app/page";

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
  /** When true, submit doesn't trigger a new conversation transition. */
  inConversation?: boolean;
  /** Fires immediately when the user hits Enter / clicks send. Lets the parent
   *  scroll the home view back to the hero before the beam runs. */
  onSubmit?: () => void;
}

const HERO_TOP = 112;
const PILL_HEIGHT = 48;
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
  inConversation = false,
  onSubmit,
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

  const isBottom = mode === "bottom";

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
    if (!v || inConversation) return;
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

  const handleMadLibsSubmit = (prompt: string) => {
    setExpanded(false);
    onChange(prompt);
    triggerBeam(prompt);
  };

  const handleMadLibsAllPlaced = (prompt: string) => {
    onChange(prompt);
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

      {/* Narrative chips — "Create narrative" when idle, "Yes / Make changes" when skeleton-ready */}
      {isBottom && showCreateChip && (
        <div
          className={`fixed flex justify-end gap-2 ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
          style={{
            left: leftCss,
            transform: "translateX(-50%)",
            top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 36}px)`,
            width: widthCss,
            zIndex: 50,
            transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {narrativePhase === "skeleton-ready" ? (
            <>
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
            </>
          ) : (
            <button
              type="button"
              onClick={() => onCreateNarrative?.()}
              className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-colors"
            >
              <IconNotebook size={12} className="opacity-60" />
              Create narrative
            </button>
          )}
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
            top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 40}px)`,
            width: widthCss,
            height: PILL_HEIGHT + 80,
            zIndex: 49,
          }}
        />
      )}

      {/* ── Single bar — same pill, grows taller when expanded ── */}
      <form
        id="madlibs-card"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className={`fixed ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
        style={{
          left: leftCss,
          transform: "translateX(-50%)",
          top: isBottom
            ? `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP}px)`
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
            !isBottom && expanded
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
            if (!isBottom && !inConversation && !expanded) setExpanded(true);
          }}
        >
          {!isBottom && expanded ? (
            <MadLibsInput
              initialText={value}
              onSubmit={handleMadLibsSubmit}
              onDismiss={() => setExpanded(false)}
              onAllPlaced={handleMadLibsAllPlaced}
            />
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5">
              <IconPlus size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  if (submitted) setSubmitted(false);
                }}
                onFocus={() => {
                  if (!isBottom && !inConversation) setExpanded(true);
                }}
                placeholder={isBottom ? "Ask a follow-up question" : "What do you want to learn about IDA results?"}
                className="flex-1 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none"
                aria-label="Search the scorecard"
                readOnly={!isBottom && !inConversation}
              />
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
        </motion.div>
      </form>
    </>
  );
}
