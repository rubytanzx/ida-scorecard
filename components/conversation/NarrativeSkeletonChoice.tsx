// components/conversation/NarrativeSkeletonChoice.tsx
//
// Renders the AI assistant message + 4 narrative-angle cards as a horizontal
// scroll-snap carousel in the skeleton-ready phase. Each card shows the
// Challenge in full, the Interventions with a fade-out mask, and the Country
// examples as flag chips. The expand icon top-right opens a full preview panel.

"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrowsMaximize, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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

  // Active index = which card is centred (focal) in the deck. Side cards
  // tilt away in 3D and are dimmed; clicking one brings it to focus.
  const [activeIndex, setActiveIndex] = useState(0);

  const goToCard = (i: number) => {
    setActiveIndex(Math.max(0, Math.min(skeletons.length - 1, i)));
  };
  const stepBy = (dir: -1 | 1) => goToCard(activeIndex + dir);

  // Mount-in transition: fade the whole deck up the first time the
  // skeleton-ready phase opens. Each card uses its own deck transform.
  const [mountedIn, setMountedIn] = useState(!animate);
  useEffect(() => {
    if (!animate) {
      setMountedIn(true);
      return;
    }
    setMountedIn(false);
    const t = setTimeout(() => setMountedIn(true), 250);
    return () => clearTimeout(t);
  }, [animate]);

  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">{leadText}</p>

        {/* Flat carousel — cards flush to the left edge. Next card peeks on
            the right and the right-edge gradient overlay fades it out. */}
        <div className="group relative h-[440px] flex items-center overflow-hidden">
          {skeletons.map((s, i) => {
            const offset = i - activeIndex;
            const abs = Math.abs(offset);
            const isFocal = offset === 0;
            const hidden = abs > 2;
            // Flat horizontal offset — no rotation, no Z, no scale.
            const cardTransform = `translateX(${offset * 340}px)`;
            return (
              <div
                key={s.id}
                style={{
                  transform: cardTransform,
                  opacity: hidden ? 0 : mountedIn ? 1 : 0,
                  pointerEvents: hidden ? "none" : "auto",
                  zIndex: 10 - abs,
                  transition:
                    "transform 500ms cubic-bezier(0.22,1,0.36,1)," +
                    " opacity 400ms ease-out",
                  willChange: "transform, opacity",
                }}
                className="absolute"
              >
                <SkeletonCard
                  skeleton={s}
                  selected={selectedSkeletonId === s.id}
                  focal={isFocal}
                  onClick={() => {
                    if (!isFocal) {
                      goToCard(i);
                      return;
                    }
                    onSelect(selectedSkeletonId === s.id ? null : s.id);
                  }}
                  onPreview={() => onPreview(s.id)}
                />
              </div>
            );
          })}

          {/* Right-edge fade overlay — solid-white → transparent gradient
              that dissolves the peeking next card into the page. The left
              edge is flush with the focal card so no left overlay needed. */}
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-40 pointer-events-none z-20"
            style={{ background: "linear-gradient(to left, #fff 0%, #fff 30%, rgba(255,255,255,0) 100%)" }}
          />

          {/* Edge arrows — fade in on container hover. Disabled at endpoints. */}
          <CarouselArrow
            direction="left"
            disabled={activeIndex === 0}
            onClick={() => stepBy(-1)}
          />
          <CarouselArrow
            direction="right"
            disabled={activeIndex >= skeletons.length - 1}
            onClick={() => stepBy(1)}
          />
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {skeletons.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to angle ${i + 1}`}
              aria-current={activeIndex === i ? "true" : undefined}
              onClick={() => goToCard(i)}
              className={
                "rounded-full transition-all duration-200" +
                (activeIndex === i
                  ? " w-4 h-1.5 bg-violet-500"
                  : " w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({
  skeleton,
  selected,
  focal,
  onClick,
  onPreview,
}: {
  skeleton: NarrativeSkeleton;
  selected: boolean;
  /** True for the centre card in the deck; controls the expand-icon
   *  visibility and the slightly stronger card shadow. */
  focal: boolean;
  onClick: () => void;
  onPreview: () => void;
}) {
  const { title, challengeText, interventionText, countryExamples, countryFlags, sourceCounts } =
    skeleton;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={
        "group relative w-[320px] h-[420px] flex flex-col rounded-2xl cursor-pointer overflow-hidden" +
        " transition-[border-color,box-shadow,background-color] duration-200" +
        (selected
          ? " bg-violet-50 border border-violet-300" +
            " shadow-[0_18px_36px_-12px_rgba(124,58,237,0.35),0_2px_6px_rgba(124,58,237,0.08)]"
          : focal
            ? " bg-white border border-gray-200" +
              " shadow-[0_18px_36px_-12px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)]" +
              " hover:bg-violet-50 hover:border-violet-200"
            : " bg-white border border-gray-200" +
              " shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]" +
              " hover:bg-violet-50")
      }
    >
      {/* Header — title + caption + expand icon */}
      <div className="shrink-0 flex items-start gap-2 px-4 pt-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold text-gray-900 leading-snug">
            {title}
          </h4>
          <p className="mt-0.5 text-[11.5px] text-gray-500 leading-relaxed">
            Based on {sourceCounts.pads.toLocaleString()} PADs, {sourceCounts.isrs.toLocaleString()} ISRs, and {sourceCounts.icrs.toLocaleString()} ICRs.
          </p>
        </div>
        {focal && (
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
        )}
      </div>

      <div className="shrink-0 mx-4 mt-3 h-px bg-gray-200/70" />

      {/* The Challenge — clamped to 4 lines so every card has the same
          header+challenge height regardless of source length. */}
      <div className="shrink-0 px-4 pt-3 pb-3">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
          The Challenge
        </span>
        <p
          className="mt-2 text-[12.5px] text-gray-800 leading-relaxed"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {challengeText}
        </p>
      </div>

      <div className="shrink-0 mx-4 h-px bg-gray-200/70" />

      {/* Interventions — fills the remaining card height with a bottom
          fade overlay; cards keep a uniform total height. */}
      <div className="relative flex-1 min-h-0 px-4 pt-3 overflow-hidden">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
          Interventions
        </span>
        <p className="mt-2 text-[12.5px] text-gray-800 leading-relaxed">
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

      <div className="shrink-0 mx-4 h-px bg-gray-200/70" />

      {/* Country examples — flag emoji chips */}
      <div className="shrink-0 px-4 pt-3 pb-4">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
          Country examples
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

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? IconChevronLeft : IconChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Previous angle" : "Next angle"}
      onClick={onClick}
      disabled={disabled}
      className={
        "absolute top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center" +
        " rounded-full bg-white border border-gray-200 shadow-md text-gray-600" +
        " opacity-0 group-hover:opacity-100 transition-opacity" +
        " hover:text-gray-900 hover:border-gray-300" +
        " disabled:opacity-0 disabled:cursor-default" +
        (direction === "left" ? " left-2" : " right-2")
      }
    >
      <Icon size={16} />
    </button>
  );
}
