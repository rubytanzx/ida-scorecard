// components/conversation/NarrativeSkeletonChoice.tsx
//
// Renders the AI assistant message + 4 narrative-angle cards as a horizontal
// scroll-snap carousel in the skeleton-ready phase. Each card shows the
// Challenge in full, the Interventions with a fade-out mask, and the Country
// examples as flag chips. The expand icon top-right opens a full preview panel.

"use client";

import { useEffect, useState } from "react";
import { IconArrowsMaximize } from "@tabler/icons-react";
import {
  FLOW_SKELETONS,
  type NarrativeSkeleton,
} from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";

interface Props {
  flow: FlowId;
  selectedSkeletonId: string | null;
  onSelect: (id: string | null) => void;
  /** Opens the preview panel for a given skeleton id. */
  onPreview: (id: string) => void;
  /** When true, animate the lead text + stagger the cards in. */
  animate: boolean;
}

export default function NarrativeSkeletonChoice({
  flow,
  selectedSkeletonId,
  onSelect,
  onPreview,
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

  const leadText = `I analysed ${totals.pads.toLocaleString()} PADs, ${totals.isrs.toLocaleString()} ISRs, and ${totals.icrs.toLocaleString()} ICRs and found ${skeletons.length} angles for this narrative. Pick one to expand.`;

  // Stagger card mount-in by 80ms per card when animating.
  const [revealedCount, setRevealedCount] = useState(() => (animate ? 0 : skeletons.length));
  useEffect(() => {
    if (!animate) {
      setRevealedCount(skeletons.length);
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
          <div className="flex gap-3 pb-2">
            {skeletons.map((s, i) => (
              <SkeletonCard
                key={s.id}
                skeleton={s}
                selected={selectedSkeletonId === s.id}
                revealed={i < revealedCount}
                onSelect={() =>
                  onSelect(selectedSkeletonId === s.id ? null : s.id)
                }
                onPreview={() => onPreview(s.id)}
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
  onSelect,
  onPreview,
}: {
  skeleton: NarrativeSkeleton;
  selected: boolean;
  revealed: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const { title, challengeText, interventionText, countryExamples, countryFlags, sourceCounts } =
    skeleton;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ scrollSnapAlign: "start" }}
      className={
        "group relative shrink-0 w-[320px] rounded-2xl cursor-pointer overflow-hidden" +
        " transition-[border-color,box-shadow,background-color] duration-200" +
        (revealed
          ? " opacity-100 translate-y-0"
          : " opacity-0 translate-y-1 pointer-events-none") +
        " transition-[opacity,transform] duration-200" +
        (selected
          ? " bg-[rgba(167,139,250,0.10)] border border-violet-300" +
            " shadow-[0_8px_24px_-8px_rgba(124,58,237,0.25),0_2px_6px_rgba(124,58,237,0.08)]"
          : " bg-white border border-gray-200" +
            " hover:bg-[rgba(167,139,250,0.06)] hover:border-violet-200" +
            " hover:shadow-[0_8px_24px_-8px_rgba(124,58,237,0.18),0_2px_6px_rgba(124,58,237,0.06)]")
      }
    >
      {/* Header — title + caption + expand icon */}
      <div className="flex items-start gap-2 px-4 pt-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold text-gray-900 leading-snug">
            {title}
          </h4>
          <p className="mt-0.5 text-[11.5px] text-gray-500 leading-relaxed">
            Based on {sourceCounts.pads.toLocaleString()} PADs, {sourceCounts.isrs.toLocaleString()} ISRs, and {sourceCounts.icrs.toLocaleString()} ICRs.
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          aria-label={`Expand preview for ${title}`}
          className="shrink-0 w-7 h-7 -mr-1 -mt-0.5 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <IconArrowsMaximize size={14} />
        </button>
      </div>

      <div className="mx-4 mt-3 h-px bg-gray-200/70" />

      {/* The Challenge */}
      <div className="px-4 pt-3 pb-3">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
          The Challenge
        </span>
        <p className="mt-2 text-[12.5px] text-gray-800 leading-relaxed">
          {challengeText}
        </p>
      </div>

      <div className="mx-4 h-px bg-gray-200/70" />

      {/* Interventions — clipped + fade overlay */}
      <div className="relative px-4 pt-3">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
          Interventions
        </span>
        <p
          className="mt-2 text-[12.5px] text-gray-800 leading-relaxed"
          style={{
            maxHeight: "4.6em",
            overflow: "hidden",
          }}
        >
          {interventionText}
        </p>
        {/* Bottom fade — matches the card background so the text dissolves
            smoothly into whichever state the card is in. */}
        <div
          aria-hidden
          className={
            "pointer-events-none absolute left-0 right-0 bottom-0 h-12 " +
            (selected
              ? "bg-gradient-to-b from-transparent to-[rgba(247,243,255,1)]"
              : "bg-gradient-to-b from-transparent to-white group-hover:to-[rgba(248,245,255,1)]")
          }
        />
      </div>

      <div className="mx-4 h-px bg-gray-200/70" />

      {/* Countries — flag emoji chips */}
      <div className="px-4 pt-3 pb-4">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
          Countries
        </span>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {countryExamples.map((name, i) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-800"
            >
              <span className="text-[14px] leading-none" aria-hidden>
                {countryFlags[i]}
              </span>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
