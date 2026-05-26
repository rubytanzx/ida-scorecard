// components/conversation/NarrativeSkeletonChoice.tsx
//
// Renders the AI assistant message + 4 narrative-angle cards as a horizontal
// scroll-snap carousel in the skeleton-ready phase. Clicking a card sets the
// selection; clicking the selected card again toggles it off.

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCheck } from "@tabler/icons-react";
import {
  FLOW_SKELETONS,
  type NarrativeSkeleton,
} from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";

interface Props {
  flow: FlowId;
  selectedSkeletonId: string | null;
  onSelect: (id: string | null) => void;
  /** When true, animate the lead text + stagger the cards in. */
  animate: boolean;
}

export default function NarrativeSkeletonChoice({
  flow,
  selectedSkeletonId,
  onSelect,
  animate,
}: Props) {
  const skeletons = FLOW_SKELETONS[flow];

  // Sum source counts across the 4 skeletons for the lead-text message.
  const totals = skeletons.reduce(
    (acc, s) => ({
      pads: acc.pads + s.sourceCounts.pads,
      isrs: acc.isrs + s.sourceCounts.isrs,
      icrs: acc.icrs + s.sourceCounts.icrs,
    }),
    { pads: 0, isrs: 0, icrs: 0 },
  );

  const leadText = `I analysed ${totals.pads} PADs, ${totals.isrs} ISRs, and ${totals.icrs} ICRs and found 4 angles for this narrative. Pick one to expand.`;

  // Stagger card mount-in by 80ms per card when animating.
  const [revealedCount, setRevealedCount] = useState(() => (animate ? 0 : 4));
  useEffect(() => {
    if (!animate) {
      setRevealedCount(4);
      return;
    }
    setRevealedCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Wait ~300ms after mount for the lead text to settle, then reveal each card.
    for (let i = 0; i < skeletons.length; i++) {
      timers.push(setTimeout(() => setRevealedCount((n) => Math.max(n, i + 1)), 300 + i * 80));
    }
    return () => timers.forEach(clearTimeout);
  }, [animate, skeletons.length]);

  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">{leadText}</p>

        {/* Horizontal scroll-snap carousel — bleeds 8px past the gutters
            so partially-scrolled cards aren't clipped at the edges. */}
        <div
          className="-mx-2 px-2 overflow-x-auto scrollbar-auto-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          <div className="flex gap-3 pb-1">
            {skeletons.map((s, i) => (
              <SkeletonCard
                key={s.id}
                skeleton={s}
                selected={selectedSkeletonId === s.id}
                revealed={i < revealedCount}
                onClick={() =>
                  onSelect(selectedSkeletonId === s.id ? null : s.id)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({
  skeleton,
  selected,
  revealed,
  onClick,
}: {
  skeleton: NarrativeSkeleton;
  selected: boolean;
  revealed: boolean;
  onClick: () => void;
}) {
  const { marker, title, challengeTeaser, countryExamples, sourceCounts } = skeleton;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{ scrollSnapAlign: "start" }}
      className={
        "relative shrink-0 w-[280px] text-left bg-white rounded-xl p-4 flex flex-col gap-2.5" +
        " transition-[opacity,transform,border-color,box-shadow,background] duration-200" +
        (revealed
          ? " opacity-100 translate-y-0"
          : " opacity-0 translate-y-1 pointer-events-none") +
        (selected
          ? " border-2 border-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.12)]"
          : " border border-gray-200 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]")
      }
    >
      {/* Selected check pill — top-right, springs in on selection */}
      <AnimatePresence>
        {selected && (
          <motion.span
            aria-hidden
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.7 }}
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <IconCheck size={11} stroke={3} className="text-white" />
          </motion.span>
        )}
      </AnimatePresence>

      <span className="text-[11px] font-semibold text-gray-400 tracking-wider">
        {marker}
      </span>

      <h4
        className="text-[14px] font-semibold text-gray-900 leading-snug"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </h4>

      <p
        className="text-[12.5px] text-gray-700 leading-relaxed"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {challengeTeaser}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
        {countryExamples.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[11px] text-gray-700"
          >
            <span className="w-1 h-1 rounded-full bg-gray-400" aria-hidden />
            {c}
          </span>
        ))}
      </div>

      <div className="mt-1 pt-2 border-t border-gray-100 text-[10.5px] text-gray-400">
        Built from {sourceCounts.pads} PADs · {sourceCounts.isrs} ISRs · {sourceCounts.icrs} ICRs
      </div>
    </button>
  );
}
