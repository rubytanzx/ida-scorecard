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
  /** Which narrative section this visual will live under once generated. */
  section: string;
  recommended: boolean;
  Thumb: (props: { active: boolean }) => React.ReactElement;
}

const OPTIONS: Option[] = [
  { id: "map", label: "Interactive map", section: "Geography", recommended: true, Thumb: MapThumb },
  { id: "timeline", label: "Time-series chart", section: "The Challenge", recommended: true, Thumb: TimelineThumb },
  { id: "charts", label: "Bar charts", section: "Country Examples", recommended: false, Thumb: BarChartThumb },
  { id: "tables", label: "Data tables", section: "Lessons Learned", recommended: false, Thumb: TableThumb },
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
          {OPTIONS.map(({ id, label, section, recommended, Thumb }) => {
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
                  <div className="mt-0.5 text-[10.5px] text-gray-500 leading-snug">
                    In{" "}
                    <span className={on ? "text-violet-700 font-medium" : "text-gray-700 font-medium"}>
                      {section}
                    </span>
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
// Each thumb is a mini reproduction of the corresponding chart inside the
// NarrativePanel so the user previews what they're about to get. Colours
// match the live charts (WBG navy/red on context, green/orange/red on
// achievement) except when active, where everything tints violet.

function MapThumb({ active }: { active: boolean }) {
  // Mirrors WorldMap — abstract continent outlines + two coloured regions
  // standing in for the highlighted WB regions in the live map.
  const baseFill = active ? "rgba(124,58,237,0.10)" : "rgba(148,163,184,0.18)";
  const baseStroke = active ? "#7c3aed" : "#94a3b8";
  const goodFill = active ? "#a78bfa" : "#2E8B57";
  const warnFill = active ? "#7c3aed" : "#D04040";
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Africa-ish blob */}
      <path
        d="M50 22 Q56 18 62 22 L66 28 Q70 34 66 42 L62 50 Q56 54 50 50 L46 42 Q42 32 46 26 Z"
        fill={warnFill}
        stroke={baseStroke}
        strokeWidth="0.6"
        opacity={active ? 0.85 : 1}
      />
      {/* South-Asia blob */}
      <path
        d="M80 26 Q86 22 92 28 L94 36 Q92 42 86 44 L80 42 Q76 36 78 30 Z"
        fill={goodFill}
        stroke={baseStroke}
        strokeWidth="0.6"
        opacity={active ? 0.85 : 1}
      />
      {/* Other continents (Americas + Asia outline) */}
      <path
        d="M10 22 Q18 18 24 24 L26 32 Q22 40 16 42 L10 38 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="0.6"
      />
      <path
        d="M100 18 Q108 18 112 24 L114 30 Q110 32 104 30 L100 24 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="0.6"
      />
    </svg>
  );
}

function TimelineThumb({ active }: { active: boolean }) {
  // Mirrors ContextChart — two trend lines with dots, axis baseline.
  const fcs = active ? "#7c3aed" : "#D04040";   // red FCS line in live chart
  const lic = active ? "#a78bfa" : "#003F6B";   // navy LIC line in live chart
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      <line x1="8" y1="54" x2="114" y2="54" stroke="#e2e8f0" strokeWidth="0.6" />
      {/* FCS — higher, declining */}
      <path d="M14 18 L34 24 L54 22 L74 30 L94 28 L112 34" fill="none" stroke={fcs} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {[14, 34, 54, 74, 94, 112].map((x, i) => {
        const ys = [18, 24, 22, 30, 28, 34];
        return <circle key={`f${i}`} cx={x} cy={ys[i]} r={1.6} fill={fcs} />;
      })}
      {/* LIC — lower, slightly improving */}
      <path d="M14 40 L34 38 L54 42 L74 38 L94 36 L112 34" fill="none" stroke={lic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {[14, 34, 54, 74, 94, 112].map((x, i) => {
        const ys = [40, 38, 42, 38, 36, 34];
        return <circle key={`l${i}`} cx={x} cy={ys[i]} r={1.6} fill={lic} />;
      })}
    </svg>
  );
}

function BarChartThumb({ active }: { active: boolean }) {
  // Mirrors EvidenceChart — horizontal achievement bars vs a track,
  // coloured by ratio (green good / amber warn / red miss).
  const rows = [
    { width: 78, color: active ? "#a78bfa" : "#2E8B57" },
    { width: 64, color: active ? "#7c3aed" : "#E88B2B" },
    { width: 48, color: active ? "#a78bfa" : "#E88B2B" },
    { width: 32, color: active ? "#7c3aed" : "#D04040" },
  ];
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      {rows.map((r, i) => {
        const y = 12 + i * 12;
        return (
          <g key={i}>
            {/* track */}
            <rect x={10} y={y} width={100} height={4} rx={2} fill="#e2e8f0" />
            {/* fill */}
            <rect x={10} y={y} width={r.width} height={4} rx={2} fill={r.color} />
          </g>
        );
      })}
    </svg>
  );
}

function TableThumb({ active }: { active: boolean }) {
  // Mirrors RegionTiles — a compact grid of stat tiles with labels +
  // tiny progress bars. Same 2x3 layout as the live region grid.
  const accent = active ? "#7c3aed" : "#94a3b8";
  const fill = active ? "rgba(124,58,237,0.12)" : "rgba(148,163,184,0.16)";
  const tiles = [
    { x: 8, y: 10, w: 0.7 },
    { x: 44, y: 10, w: 0.55 },
    { x: 80, y: 10, w: 0.4 },
    { x: 8, y: 36, w: 0.5 },
    { x: 44, y: 36, w: 0.65 },
    { x: 80, y: 36, w: 0.85 },
  ];
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      {tiles.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.y} width={32} height={20} rx={2} fill="white" stroke={accent} strokeWidth="0.6" />
          {/* heading bar */}
          <rect x={t.x + 2} y={t.y + 3} width={14} height={2} rx={1} fill={accent} opacity={0.5} />
          {/* value bar */}
          <rect x={t.x + 2} y={t.y + 8} width={20} height={3} rx={1.5} fill={fill} />
          <rect x={t.x + 2} y={t.y + 8} width={20 * t.w} height={3} rx={1.5} fill={accent} />
          {/* small caption */}
          <rect x={t.x + 2} y={t.y + 14} width={10} height={1.5} rx={0.75} fill={accent} opacity={0.4} />
        </g>
      ))}
    </svg>
  );
}
