"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconX,
  IconChartBar,
  IconGripVertical,
  IconDownload,
  IconWand,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
} from "recharts";
import {
  NARRATIVE_PANEL_MIN_WIDTH,
  NARRATIVE_PANEL_MAX_WIDTH,
} from "./NarrativePanel";

interface Props {
  open: boolean;
  prompt: string;
  onClose: () => void;
  /** Switch to the narrative pane in the same slot. Optional now —
   * the footer no longer surfaces a button for it; callers may still
   * pass it for header-level affordances if desired. */
  onOpenNarrative?: () => void;
  /** Open the public/shared-link viewer experience for this artefact. */
  onPreviewAsViewer?: () => void;
  width: number;
  onResize: (width: number, dragging: boolean) => void;
  /** When true, render a beam-driven generation animation instead of
   * the real poster body — used while the user has just clicked
   * "Generate · Insightographic" and the artefact is being composed. */
  loading?: boolean;
}

// ─── Flow detection (mirrors NarrativePanel / ConversationView) ─────────────

type FlowId = "africa-poverty" | "health-gap";
function detectFlow(prompt: string): FlowId {
  const t = prompt.toLowerCase();
  if (t.includes("health services target")) return "health-gap";
  if (t.includes("extreme poverty")) return "africa-poverty";
  return "africa-poverty";
}

// ─── Per-flow content — poster-style summary of the conversation ────────────

type Tone = "navy" | "teal" | "gold" | "green" | "red" | "purple";
const TONE_COLOR: Record<Tone, string> = {
  navy:   "#003F6B",
  teal:   "#00A0DF",
  gold:   "#E88B2B",
  green:  "#2E8B57",
  red:    "#D04040",
  purple: "#6B4FA0",
};

interface ChartDatum {
  name: string;
  value: number;        // achieved
  expected?: number;    // pipeline target (bars only)
  color: string;
}

interface FlowContent {
  kicker: string;       // small uppercase eyebrow
  title: string;        // header title
  headline: string;     // serif statement at top of body
  // Hero KPI block
  heroValue: string;
  heroSub: string;
  heroProgressPct: number;
  heroProgressLabel: string;
  // Chart card
  chartTitle: string;
  chartType: "radial" | "bars";
  chartData: ChartDatum[];
  // Stats strip (3-up)
  stats: { value: string; label: string; tone: Tone }[];
  // Pull-quote insight
  insight: string;
  // Sources (shortened)
  sources: string[];
}

const FLOW_CONTENT: Record<FlowId, FlowContent> = {
  "africa-poverty": {
    kicker: "FY25 INSIGHTOGRAPHIC",
    title: "IDA Cross-Pillar Reach",
    headline:
      "FY25 IDA delivery reached 939M direct beneficiaries across People-pillar programs in the world's 75 poorest countries.",
    heroValue: "939M",
    heroSub: "direct beneficiaries (FY25)",
    heroProgressPct: 63,
    heroProgressLabel: "63% of 1.49B FY25 pipeline",
    chartTitle: "Vertical achievement vs FY25 plan",
    chartType: "radial",
    chartData: [
      { name: "People",         value: 68, color: "#2E8B57" },
      { name: "Prosperity",     value: 52, color: "#E88B2B" },
      { name: "Planet",         value: 45, color: "#E88B2B" },
      { name: "Infrastructure", value: 41, color: "#D04040" },
      { name: "Digital",        value: 50, color: "#E88B2B" },
    ],
    stats: [
      { value: "370M", label: "Health-services reach",  tone: "navy"  },
      { value: "325M", label: "Students supported",     tone: "teal"  },
      { value: "244M", label: "Safety-net beneficiaries", tone: "green" },
    ],
    insight:
      "Infrastructure (41%) and Planet (45%) lag the pipeline most — these are the highest-leverage gaps for FY26 funding decisions.",
    sources: [
      "CSC_RES_*.xlsx · Aggregates (Time_Period 2025-06-30, Org_Code WBG)",
      "1_1_RESULTS_Social_Safety_Nets.pdf",
      "IDA_Scorecard_Metadata_1.xlsx",
    ],
  },
  "health-gap": {
    kicker: "FY25 INSIGHTOGRAPHIC",
    title: "Health-Services Delivery Gap",
    headline:
      "Five IDA-FCS countries account for ~37% of FY25 HNP pipeline shortfall — workforce + supply chain are the dominant drivers.",
    heroValue: "5 / 75",
    heroSub: "IDA countries below 50% of FY25 HNP plan",
    heroProgressPct: 87,
    heroProgressLabel: "Global HNP reach: 370M of 425M (87%)",
    chartTitle: "Bottom-5 HNP achievement vs FY25 target",
    chartType: "bars",
    chartData: [
      { name: "Yemen",       value: 1.2, expected: 3.2, color: "#D04040" },
      { name: "Sudan",       value: 1.7, expected: 4.1, color: "#D04040" },
      { name: "Afghanistan", value: 2.4, expected: 5.5, color: "#D04040" },
      { name: "South Sudan", value: 0.6, expected: 1.3, color: "#D04040" },
      { name: "Myanmar",     value: 1.5, expected: 3.1, color: "#D04040" },
    ],
    stats: [
      { value: "38%", label: "Conflict-related supply", tone: "red"  },
      { value: "27%", label: "Health-worker shortage",  tone: "gold" },
      { value: "18%", label: "Displacement / access",   tone: "navy" },
    ],
    insight:
      "All five underperformers are conflict-affected. Workforce strengthening and pooled-procurement supply chains are the highest-leverage FY26 levers.",
    sources: [
      "CSC_RES_HEA_SERV.xlsx · WB Project Information (FY25, FCV_Flag = Y)",
      "3_1_RESULTS_HNP_Services.pdf",
      "14_1_CONTEXT_Poverty_in_FCS.pdf",
    ],
  },
};

// ─── Charts (poster-scale) ──────────────────────────────────────────────────

function VerticalRadial({ data }: { data: ChartDatum[] }) {
  return (
    <div className="h-[210px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="28%"
          outerRadius="92%"
          data={data}
          startAngle={90}
          endAngle={-270}
          barSize={11}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={4}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </RadialBar>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CountryBars({ data }: { data: ChartDatum[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {data.map((row) => {
        const ratio = row.expected ? row.value / row.expected : 0;
        const pct = Math.round(ratio * 100);
        return (
          <li key={row.name} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[12.5px] text-gray-700 font-medium">{row.name}</span>
              <span className="text-[11px] tabular-nums text-gray-500">
                {row.value}M / {row.expected}M · {pct}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: "100%", background: "#F1D4D4" }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${pct}%`, background: row.color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Reusable body — used by the panel AND the shared-link viewer ───────────

export function InsightographicBody({ prompt }: { prompt: string }) {
  const flow = useMemo(() => detectFlow(prompt), [prompt]);
  const c = FLOW_CONTENT[flow];
  return (
    <div className="px-6 py-6 flex flex-col gap-5">
      {/* Headline */}
      <h2 className="text-[20px] font-bold text-gray-900 leading-snug">
        {c.headline}
      </h2>

      {/* Hero KPI on a navy gradient — anchors the page */}
      <div className="rounded-xl bg-gradient-to-br from-[#003F6B] to-[#0A5A8E] text-white p-5 flex flex-col gap-2 shadow-sm">
        <span className="text-[44px] leading-none font-bold tabular-nums tracking-tight">
          {c.heroValue}
        </span>
        <span className="text-[12.5px] text-white/80 leading-snug">
          {c.heroSub}
        </span>
        <div className="mt-2 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00A0DF] rounded-full transition-[width] duration-700"
            style={{ width: `${c.heroProgressPct}%` }}
          />
        </div>
        <span className="text-[10.5px] text-white/60">
          {c.heroProgressLabel}
        </span>
      </div>

      {/* Chart card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
        <h6 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {c.chartTitle}
        </h6>
        {c.chartType === "radial" ? (
          <VerticalRadial data={c.chartData} />
        ) : (
          <CountryBars data={c.chartData} />
        )}
        {c.chartType === "radial" && (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] mt-1">
            {c.chartData.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-gray-700 truncate">{d.name}</span>
                </span>
                <span className="font-mono text-gray-500 tabular-nums shrink-0">
                  {d.value}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3-up stats strip */}
      <div className="grid grid-cols-3 gap-2">
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-0.5 p-3 rounded-lg border border-gray-200 bg-white"
          >
            <span
              className="text-[20px] font-bold tabular-nums leading-none"
              style={{ color: TONE_COLOR[s.tone] }}
            >
              {s.value}
            </span>
            <span className="text-[10.5px] text-gray-600 leading-snug">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pull quote — distinguishes the recommendation from the data */}
      <blockquote className="border-l-2 border-emerald-400 pl-4 py-1 text-[13.5px] text-gray-800 italic leading-relaxed">
        {c.insight}
      </blockquote>

      {/* Sources */}
      <div className="pt-3 mt-1 border-t border-gray-100">
        <h6 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
          Sources
        </h6>
        <ul className="text-[10.5px] text-gray-500 space-y-0.5 font-mono">
          {c.sources.map((s) => (
            <li key={s} className="truncate">{s}</li>
          ))}
        </ul>
      </div>

      {/* Generated-from caption */}
      {prompt && (
        <p className="text-[11px] text-gray-400 italic mt-1">
          Generated from: &ldquo;{prompt}&rdquo;
        </p>
      )}
    </div>
  );
}

// ─── Generation loading state ───────────────────────────────────────────────
// Reuses the prompt-bar's beam animation so the "AI is thinking" visual
// language stays consistent across the app. A single beam glows from the
// top of the panel body while a label cycles through generation stages.

const INSIGHT_LOADING_STAGES = [
  "Generating",
  "Illustrating",
  "Composing visual story",
  "Polishing layout",
  "Finalizing",
];

function InsightographicLoading() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => (s + 1) % INSIGHT_LOADING_STAGES.length);
    }, 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full overflow-hidden flex flex-col items-center justify-center" aria-busy="true">
      {/* Beam — clipped to the top of the panel body. Same visual as the
          prompt-bar beam but scaled down to fit a single column. */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ height: 360 }}
      >
        <div
          className="prompt-beam absolute"
          style={{
            top: -60,
            left: "50%",
            width: "min(900px, 130%)",
            height: 280,
            transform: "translateX(-50%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Animated stroke directly under the panel header, mirroring the
          beam treatment. */}
      <div
        aria-hidden
        className="prompt-stroke absolute top-0 left-0 right-0"
        style={{ height: 2 }}
      />

      {/* Loader content — sits over the beam */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 -mt-20">
        <div className="w-14 h-14 rounded-full bg-white/85 backdrop-blur-sm border border-emerald-200 flex items-center justify-center shadow-sm">
          <IconWand size={22} className="text-emerald-600 animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
            FY25 Insightographic
          </div>
          <div
            key={stage}
            className="text-[18px] font-semibold text-gray-900 transition-opacity duration-300"
            style={{ animation: "narrative-content-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            {INSIGHT_LOADING_STAGES[stage]}
            <span className="inline-block w-1 ml-0.5 stream-cursor">·</span>
          </div>
          <div className="text-[11.5px] text-gray-500">
            Building your single-page summary
          </div>
        </div>

        {/* Stage-progress dots */}
        <div className="flex items-center gap-1.5 mt-1">
          {INSIGHT_LOADING_STAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stage   ? "w-6 bg-emerald-500" :
                i <  stage    ? "w-1.5 bg-emerald-400" :
                                 "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Panel ──────────────────────────────────────────────────────────────────

export default function InsightographicPanel({
  open,
  prompt,
  onClose,
  onOpenNarrative,
  onPreviewAsViewer,
  width,
  onResize,
  loading,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const flow = useMemo(() => detectFlow(prompt), [prompt]);
  const c = FLOW_CONTENT[flow];

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = startX.current - e.clientX;
      const next = Math.max(
        NARRATIVE_PANEL_MIN_WIDTH,
        Math.min(NARRATIVE_PANEL_MAX_WIDTH, startWidth.current + delta)
      );
      onResize(next, true);
    };
    const onUp = () => {
      setDragging(false);
      onResize(width, false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging, onResize, width]);

  const beginDrag = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startWidth.current = width;
    setDragging(true);
  };

  return (
    <aside
      aria-hidden={!open}
      className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] flex flex-col ${
        dragging ? "" : "transition-transform duration-500 ease-in-out"
      }`}
      style={{
        width,
        transform: open ? "translateX(0)" : `translateX(${width}px)`,
        zIndex: 60,
      }}
    >
      {open && (
        <div
          onMouseDown={beginDrag}
          role="separator"
          aria-label="Resize panel"
          className="group absolute left-0 top-0 bottom-0 w-2 -translate-x-1/2 cursor-col-resize z-10 flex items-center justify-center"
        >
          <span
            className={`block h-12 w-1 rounded-full transition-colors ${
              dragging ? "bg-blue-500" : "bg-gray-200 group-hover:bg-gray-300"
            }`}
          />
          <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md p-0.5 text-gray-400 pointer-events-none shadow-sm">
            <IconGripVertical size={12} />
          </span>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
            <IconChartBar size={15} className="text-emerald-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              {c.kicker}
            </span>
            <span className="text-[14px] font-semibold text-gray-900 leading-none truncate">
              {c.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            title="Download PNG"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <IconDownload size={16} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close panel"
          >
            <IconX size={16} />
          </button>
        </div>
      </header>

      {/* Body — single-page poster (shared with the public viewer).
          While generating, swap to a beam-driven loader so the panel
          isn't empty during the artefact's mock compose pass. */}
      <div className="flex-1 overflow-y-auto scrollbar-auto-hide">
        {loading ? <InsightographicLoading /> : <InsightographicBody prompt={prompt} />}
      </div>

      {/* Footer — Publish is the only action once the insightographic
          exists. Switching to the narrative happens via the Files icon
          in the conversation/viewer header. */}
      <footer className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onPreviewAsViewer}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Publish
        </button>
      </footer>
    </aside>
  );
}
