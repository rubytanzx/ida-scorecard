// components/conversation/InteractiveElementsMessage.tsx
//
// AI-guided picker for which interactive elements to bake into the final
// narrative. The lead text references the selected skeleton specifically;
// the four options render as thumbnail cards with the recommended ones
// pre-selected.

"use client";

import { IconCheck } from "@tabler/icons-react";
import { FLOW_SKELETONS } from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";
import type { InteractiveElement } from "../../app/page";

interface Option {
  id: InteractiveElement;
  label: string;
  recommended: boolean;
  Thumb: (props: { active: boolean }) => React.ReactElement;
}

const OPTIONS: Option[] = [
  { id: "map", label: "Interactive map", recommended: true, Thumb: MapThumb },
  { id: "timeline", label: "Time-series chart", recommended: true, Thumb: TimelineThumb },
  { id: "charts", label: "Bar charts", recommended: false, Thumb: BarChartThumb },
  { id: "tables", label: "Data tables", recommended: false, Thumb: TableThumb },
];

interface Props {
  /** Flow + skeleton id let us reference the chosen angle specifically in
   *  the recommendation copy. */
  flow: FlowId;
  skeletonId: string | null;
  selected: InteractiveElement[];
  active: boolean;
  onToggle: (el: InteractiveElement) => void;
  onProceed: () => void;
}

export default function InteractiveElementsMessage({
  flow,
  skeletonId,
  selected,
  active,
  onToggle,
  onProceed,
}: Props) {
  const skeleton =
    skeletonId == null
      ? null
      : FLOW_SKELETONS[flow].find((s) => s.id === skeletonId) ?? null;

  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          {skeleton ? (
            <>
              For{" "}
              <span className="font-semibold text-gray-900">
                &ldquo;{skeleton.title}&rdquo;
              </span>
              {" "}across{" "}
              <span className="font-medium text-gray-900">
                {skeleton.countryFlags[0]} {skeleton.countryExamples[0]}
              </span>{" "}
              and{" "}
              <span className="font-medium text-gray-900">
                {skeleton.countryFlags[1]} {skeleton.countryExamples[1]}
              </span>
              {" "}({skeleton.sourceCounts.icrs} ICRs over multiple project cycles),
              I&apos;d surface an{" "}
              <span className="font-semibold text-gray-900">interactive map</span>{" "}
              — country-level coverage compares directly — and a{" "}
              <span className="font-semibold text-gray-900">time-series chart</span>{" "}
              to show how outcomes evolved across cohorts. Both are selected below;
              toggle anything off, then proceed.
            </>
          ) : (
            <>
              Pick the interactive elements to bake into the narrative.
            </>
          )}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {OPTIONS.map(({ id, label, recommended, Thumb }) => {
            const on = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => active && onToggle(id)}
                disabled={!active}
                aria-pressed={on}
                className={
                  "group relative flex flex-col items-stretch text-left p-2 rounded-xl border transition-colors" +
                  (active ? " cursor-pointer" : " cursor-default") +
                  (on
                    ? " bg-violet-50 border-violet-300"
                    : " bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50")
                }
              >
                <div
                  className={
                    "relative rounded-md overflow-hidden h-[64px] flex items-center justify-center" +
                    (on ? " bg-white" : " bg-gray-50")
                  }
                >
                  <Thumb active={on} />
                  {on && (
                    <span
                      aria-hidden
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center"
                    >
                      <IconCheck size={9} stroke={3} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="mt-2 px-0.5">
                  <div
                    className={
                      "text-[12px] font-semibold leading-snug" +
                      (on ? " text-violet-800" : " text-gray-800")
                    }
                  >
                    {label}
                  </div>
                  {recommended && (
                    <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-500">
                      Recommended
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {active && (
          <div>
            <button
              type="button"
              onClick={onProceed}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-1.5 rounded-full bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-colors"
            >
              <IconCheck size={12} stroke={3} />
              Proceed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Thumbnail SVGs ────────────────────────────────────────────────────────
// Each thumb takes an `active` prop so it can tint to violet when selected.

function MapThumb({ active }: { active: boolean }) {
  const stroke = active ? "#7c3aed" : "#94a3b8";
  const fill = active ? "rgba(124,58,237,0.15)" : "rgba(148,163,184,0.18)";
  const dot = active ? "#7c3aed" : "#475569";
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Stylised continents */}
      <path
        d="M8 22 Q14 16 22 18 L30 22 Q36 18 46 22 L52 26 Q58 22 68 24 L74 28 L70 38 Q64 40 58 36 L52 38 Q44 42 36 38 L26 40 Q18 38 14 32 L10 28 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.8"
      />
      <path
        d="M82 30 Q92 28 100 32 L110 36 L106 46 Q98 50 90 46 L84 40 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.8"
      />
      {/* Country pins */}
      <circle cx="36" cy="28" r="3" fill={dot} />
      <circle cx="64" cy="32" r="3" fill={dot} />
    </svg>
  );
}

function TimelineThumb({ active }: { active: boolean }) {
  const stroke = active ? "#7c3aed" : "#94a3b8";
  const fill = active ? "rgba(124,58,237,0.18)" : "rgba(148,163,184,0.2)";
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      {/* Axis */}
      <line x1="6" y1="54" x2="114" y2="54" stroke="#cbd5e1" strokeWidth="0.6" />
      {/* Area */}
      <path
        d="M8 44 L26 32 L44 38 L62 22 L80 28 L98 14 L114 20 L114 54 L8 54 Z"
        fill={fill}
      />
      {/* Line */}
      <path
        d="M8 44 L26 32 L44 38 L62 22 L80 28 L98 14 L114 20"
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Endpoint dot */}
      <circle cx="114" cy="20" r="2.2" fill={stroke} />
    </svg>
  );
}

function BarChartThumb({ active }: { active: boolean }) {
  const bar = active ? "#7c3aed" : "#94a3b8";
  const bars = [
    { x: 12, h: 22 },
    { x: 32, h: 38 },
    { x: 52, h: 28 },
    { x: 72, h: 46 },
    { x: 92, h: 18 },
  ];
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      <line x1="6" y1="56" x2="114" y2="56" stroke="#cbd5e1" strokeWidth="0.6" />
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={56 - b.h}
          width={12}
          height={b.h}
          rx={1.5}
          fill={bar}
          opacity={active ? 1 : 0.85}
        />
      ))}
    </svg>
  );
}

function TableThumb({ active }: { active: boolean }) {
  const stroke = active ? "#7c3aed" : "#cbd5e1";
  const header = active ? "rgba(124,58,237,0.18)" : "rgba(148,163,184,0.2)";
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      {/* Outer border */}
      <rect x="8" y="10" width="104" height="44" rx="3" fill="white" stroke={stroke} strokeWidth="0.8" />
      {/* Header */}
      <rect x="8" y="10" width="104" height="11" rx="3" fill={header} />
      {/* Row dividers */}
      <line x1="8" y1="32" x2="112" y2="32" stroke={stroke} strokeWidth="0.5" />
      <line x1="8" y1="43" x2="112" y2="43" stroke={stroke} strokeWidth="0.5" />
      {/* Column dividers */}
      <line x1="42" y1="10" x2="42" y2="54" stroke={stroke} strokeWidth="0.5" />
      <line x1="78" y1="10" x2="78" y2="54" stroke={stroke} strokeWidth="0.5" />
    </svg>
  );
}
