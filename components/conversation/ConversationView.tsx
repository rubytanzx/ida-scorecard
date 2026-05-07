"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconShare,
  IconFiles,
  IconX,
  IconChevronDown,
  IconChevronRight,
  IconCopy as IconCopySm,
  IconThumbUp,
  IconThumbDown,
  IconArrowDown,
  IconArrowUp as IconArrowUpRight,
  IconExternalLink,
  IconMinus,
  IconNotebook,
  IconSparkles,
  IconSearch,
  IconCalculator,
  IconFilter,
  IconChartBar,
  IconCheck,
  IconPencil,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { NarrativePhase } from "../../app/page";

const F = "'Open Sans', sans-serif";

export interface Artefact {
  id: string;
  kind: "narrative" | "insightographic";
  title: string;
  prompt: string;
  createdAt: number;
}

interface Props {
  prompt: string;
  onClose?: () => void;
  /** When true, the right-side narrative panel is open — shrink content area. */
  panelOpen?: boolean;
  panelWidth?: number;
  /** Skip CSS transition while the panel is being dragged. */
  suppressTransition?: boolean;
  /** Saved-narrative artefacts created from this conversation. */
  artefacts?: Artefact[];
  /** Open the narrative panel for a previously-created artefact. */
  onSelectArtefact?: (a: Artefact) => void;
  /** User-editable title — falls back to flow's default title when empty. */
  title?: string;
  onTitleChange?: (t: string) => void;
  /** When true, render only the conversation body (no header, h-full instead
   * of h-screen) so this view can be embedded inside another layout, e.g.
   * the shared-link viewer. */
  embedded?: boolean;
  /** Current narrative creation phase — drives which AI message blocks to render. */
  narrativePhase?: NarrativePhase;
  /** Fires when the NarrativePlanningMessage step animation completes. */
  onNarrativePlanningComplete?: () => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Numbers from CLAUDE.md §7 (FY25 headline results). Indicator codes match
// the XLSX inventory in §4. Colors use the design system tokens in §11.

// Flow detection — keyword-driven. Anything mentioning "health services target"
// resolves to the health-gap flow; anything with "extreme poverty" resolves to
// the africa-poverty flow. Falls back to africa-poverty otherwise (the default).
export type FlowId = "africa-poverty" | "health-gap";

export function detectFlow(prompt: string): FlowId {
  const t = prompt.toLowerCase();
  if (
    t.includes("health services target") ||
    t.includes("health & nutrition") ||
    t.includes("global") ||
    t.includes("countries")
  ) return "health-gap";
  // "extreme poverty", "africa", "sub-saharan", "poverty & social protection", "social protection" → africa-poverty
  return "africa-poverty";
}

type Vertical = "People" | "Prosperity" | "Planet" | "Infrastructure" | "Digital";
const FILTER_TABS = ["All", "People", "Prosperity", "Planet", "Infrastructure", "Digital"] as const;
type FilterTab = typeof FILTER_TABS[number];

// Health-flow filter tabs (country-level lens)
const HEALTH_FILTER_TABS = ["All countries", "FCS", "Behind target"] as const;
type HealthFilterTab = typeof HEALTH_FILTER_TABS[number];

interface ChartRow {
  name: string;
  code: string;
  vertical: Vertical;
  achieved: number;          // FY25 achieved (in millions for beneficiary indicators)
  expected: number | null;   // FY25 pipeline target (null when CLAUDE.md doesn't list one)
  unit: string;              // for the tooltip
  note?: string;
}

// CLAUDE.md §7 — FY25 headline results. expected = null where the doc shows "—".
const CHART_DATA: ChartRow[] = [
  { name: "Social safety nets",  code: "CSC_RES_SOC_SAF_PROG",   vertical: "People",         achieved: 244, expected: 313, unit: "M people", note: "+12% YoY" },
  { name: "Students supported",  code: "CSC_RES_EDU_SUPP",       vertical: "People",         achieved: 325, expected: 452, unit: "M students", note: "+12% YoY" },
  { name: "Health services",     code: "CSC_RES_HEA_SERV",       vertical: "People",         achieved: 370, expected: 425, unit: "M people", note: "+12% YoY" },
  { name: "Tax-to-GDP <15%",     code: "CSC_RES_TAX_REV_GDP",    vertical: "Prosperity",     achieved:  56, expected: null, unit: "countries", note: "Persistent" },
  { name: "Climate resilience",  code: "CSC_RES_RESI_CLIM_RISK", vertical: "Planet",         achieved: 244, expected: 425, unit: "M people", note: "Behind target" },
  { name: "Conservation hectares", code: "CSC_RES_TER_AQU_HECT", vertical: "Planet",         achieved:  93, expected: null, unit: "M hectares", note: "+12% YoY" },
  { name: "Electricity access",  code: "CSC_RES_ELC_ACCS",       vertical: "Infrastructure", achieved: 215, expected: 576, unit: "M people", note: "Behind target" },
  { name: "Broadband users",     code: "CSC_RES_BRO_INTE",       vertical: "Digital",        achieved: 217, expected: null, unit: "M people", note: "2× vs FY24" },
];

type SignalDirection = "down" | "flat" | "up";

interface SignalCard {
  tag: string;
  direction: SignalDirection;
  label: string;
  value: string;
}

const RELATED_SIGNALS: SignalCard[] = [
  { tag: "IDA AVG", direction: "down", label: "Extreme poverty rate (FCS)",  value: "30.4%" },
  { tag: "LIC AVG", direction: "down", label: "Learning poverty (primary)",  value: "70%"   },
  { tag: "FLAT",    direction: "flat", label: "UHC service coverage index",   value: "45/100" },
  { tag: "+2x",     direction: "up",   label: "Broadband users (vs FY24)",    value: "217M"   },
];

// ─── Health-gap flow data ────────────────────────────────────────────────────
// Country-level breakdown of CSC_RES_HEA_SERV (FY25). All countries with > 40%
// gap are FCS — keeping the chart focused on diagnostic signal.
interface HealthCountryRow {
  name: string;
  iso3: string;
  fcs: boolean;
  achieved: number;   // M people receiving HNP services
  expected: number;   // FY25 pipeline target, M people
}

const HEALTH_COUNTRY_DATA: HealthCountryRow[] = [
  { name: "Yemen",       iso3: "YEM", fcs: true,  achieved: 1.2, expected: 3.2 },
  { name: "Sudan",       iso3: "SDN", fcs: true,  achieved: 1.7, expected: 4.1 },
  { name: "Afghanistan", iso3: "AFG", fcs: true,  achieved: 2.4, expected: 5.5 },
  { name: "South Sudan", iso3: "SSD", fcs: true,  achieved: 0.6, expected: 1.3 },
  { name: "Myanmar",     iso3: "MMR", fcs: true,  achieved: 1.5, expected: 3.1 },
  { name: "Mozambique",  iso3: "MOZ", fcs: false, achieved: 2.7, expected: 4.5 },
  { name: "Pakistan",    iso3: "PAK", fcs: false, achieved: 28.4, expected: 36.5 },
  { name: "Bangladesh",  iso3: "BGD", fcs: false, achieved: 32.6, expected: 35.2 },
  { name: "India",       iso3: "IND", fcs: false, achieved: 89.0, expected: 101.0 },
];

const HEALTH_RELATED_SIGNALS: SignalCard[] = [
  { tag: "FCS",     direction: "down", label: "Avg health-service achievement (FCS)", value: "44%" },
  { tag: "FLAT",    direction: "flat", label: "UHC service coverage index — FCS",     value: "32/100" },
  { tag: "RISING",  direction: "down", label: "Stunting prevalence (FCS, under-5)",   value: "33.6%" },
  { tag: "DECLINE", direction: "down", label: "Health worker density (per 1k, FCS)",   value: "0.8" },
];

// ─── Per-flow content map ────────────────────────────────────────────────────
interface FlowContent {
  title: string;
  defaultPrompt: string;
  leadAnswer: string;
  bodyText: string;
  filterCaption: string;
  chartTitle: string;
  signalsHeader: string;
  continueExploring: string[];
  sources: string[];
}

const FLOW_CONTENT: Record<FlowId, FlowContent> = {
  "africa-poverty": {
    title: "World Bank Group's Performance in Africa",
    defaultPrompt: "Is IDA making a difference for people in extreme poverty in Sub-Saharan Africa?",
    leadAnswer:
      "Yes — IDA reached 244M people through safety nets and 325M students through education in FY25, with the strongest gains in Sub-Saharan Africa.",
    bodyText:
      "IDA operations in FY25 delivered measurable improvements across the poorest 75 countries. Coverage is growing, but electricity access and climate resilience remain significantly below target — signalling where the largest gaps persist for people in extreme poverty.",
    filterCaption: "Figures from the active FY2025 portfolio (end-June 2025). Filter by theme:",
    chartTitle: "FY25 Results vs pipeline — IDA headline indicators",
    signalsHeader: "Related Signals",
    continueExploring: [
      "Which countries saw the biggest safety net gains?",
      "Why is electricity access lagging behind its 576M target?",
      "How does IDA compare to IBRD on poverty results?",
      "Show me FCS-only results for Sub-Saharan Africa",
    ],
    sources: [
      "Social Safety Nets results · FY2025 global aggregate",
      "Education Support results · FY2025 project data, FCS countries",
      "Social Safety Nets methodology note — beneficiary counting rules",
    ],
  },
  "health-gap": {
    title: "Health services delivery gap — IDA FY25",
    defaultPrompt:
      "Which countries are furthest behind on health services targets in FY25 — and what's driving the gap?",
    leadAnswer:
      "5 IDA countries are tracking under 50% of their FY25 HNP-service targets — every one is FCS, with conflict-related supply-chain disruption and health-worker shortages as the dominant drivers.",
    bodyText:
      "Globally, WBG-supported HNP services reached 370M people in FY25 vs the 425M pipeline (87%). The headline obscures sharp country-level divergence: Yemen, Sudan, Afghanistan, South Sudan and Myanmar each fall well below 50% of plan, while Bangladesh, India and Pakistan are within 12 points of theirs. The shared driver across the bottom-five is conflict-affected service delivery — staff displacement, drug-supply chain breakdown, and de-prioritization of primary care for emergency response.",
    filterCaption:
      "FY25 country-level breakdown of Health Services results. Filter by status:",
    chartTitle: "HNP service achievement — country gaps vs FY25 target",
    signalsHeader: "Driving signals",
    continueExploring: [
      "Show me Yemen's full health portfolio",
      "What's the trajectory of UHC service coverage in FCS?",
      "Which prior IDA programs closed similar gaps?",
      "What's the FY26 pipeline for HNP in conflict states?",
    ],
    sources: [
      "Health Services results · FY2025 project data, FCS countries",
      "HNP Services methodology note — service coverage definition",
      "Universal Health Coverage context — UHC service coverage index",
      "Poverty in FCS context — health correlates",
    ],
  },
};

// Narrative catalog from CLAUDE.md §12. Keywords drive matching against the
// user's query so the surfaced narratives are relevant to what they asked.
interface Narrative {
  oa: string;          // outcome-area badge label
  title: string;       // narrative title
  slug: string;        // appended to NARRATIVE_BASE
  headline: string;    // FY25 stat tied to the narrative
  direction: SignalDirection;
  keywords: string[];  // matched against the prompt
}

const NARRATIVE_BASE = "https://scorecard.worldbank.org/en/narratives/";

const NARRATIVES: Narrative[] = [
  {
    oa: "OA-1", title: "Protection for the Poorest",
    slug: "protection-for-the-poorest/results-narrative",
    headline: "244M reached", direction: "up",
    keywords: ["poverty", "poor", "extreme", "safety net", "social protection", "vulnerable", "inequality"],
  },
  {
    oa: "OA-2", title: "No Learning Poverty",
    slug: "no-learning-poverty/results-narrative",
    headline: "325M students", direction: "up",
    keywords: ["education", "learning", "school", "students", "literacy", "primary"],
  },
  {
    oa: "OA-3", title: "Healthier Lives",
    slug: "healthier-lives/results-narrative",
    headline: "370M people", direction: "up",
    keywords: ["health", "uhc", "hospital", "stunting", "nutrition", "disease", "medical"],
  },
  {
    oa: "OA-5", title: "Green & Blue Planet",
    slug: "green-and-blue-planet/results-narrative",
    headline: "244M / 425M", direction: "down",
    keywords: ["climate", "resilience", "emissions", "ghg", "conservation", "biodiversity", "planet", "environment"],
  },
  {
    oa: "OA-7", title: "Sustainable Food Systems",
    slug: "sustainable-food-systems/results-narrative",
    headline: "Food security", direction: "flat",
    keywords: ["food", "nutrition", "hunger", "agriculture", "farm", "crops"],
  },
  {
    oa: "OA-9", title: "Energy for All",
    slug: "affordable-reliable-sustainable-energy/results-narrative",
    headline: "215M / 576M", direction: "down",
    keywords: ["electricity", "energy", "power", "grid", "renewable", "solar", "wind"],
  },
  {
    oa: "OA-10", title: "Digital Connectivity",
    slug: "digital-connectivity/results-narrative",
    headline: "217M (+2x)", direction: "up",
    keywords: ["broadband", "internet", "digital", "connectivity", "online"],
  },
  {
    oa: "OA-11", title: "Digital Services",
    slug: "digital-services/results-narrative",
    headline: "e-Gov rollout", direction: "up",
    keywords: ["digital", "service", "egovernment", "platform", "digitalization"],
  },
  {
    oa: "OA-12", title: "Gender Equality & Youth",
    slug: "gender-equality-and-youth-inclusion/results-narrative",
    headline: "Women & youth", direction: "up",
    keywords: ["gender", "women", "girls", "youth", "equality", "inclusion", "neet"],
  },
  {
    oa: "OA-14", title: "Better Lives in FCV",
    slug: "better-lives-for-people-in-fragility/results-narrative",
    headline: "FCS focus", direction: "down",
    keywords: ["fcs", "fcv", "fragile", "conflict", "violence", "displacement", "refugee"],
  },
  {
    oa: "OA-15", title: "More Private Investments",
    slug: "more-private-investments/results-narrative",
    headline: "PCE & PCM", direction: "flat",
    keywords: ["private capital", "investment", "pce", "pcm", "ifc", "miga", "mobilized", "enabled"],
  },
];

/** Score each narrative by how many of its keywords appear in `prompt`,
 * return the top `n`. Falls back to the first `n` when nothing matches. */
function pickNarratives(prompt: string, n = 4): Narrative[] {
  const text = prompt.toLowerCase();
  const scored = NARRATIVES.map((nv) => ({
    nv,
    score: nv.keywords.reduce((acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0), 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  if (scored[0].score === 0) return NARRATIVES.slice(0, n);
  return scored.slice(0, n).map((s) => s.nv);
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function NarrativeCard({ n }: { n: Narrative }) {
  return (
    <a
      href={`${NARRATIVE_BASE}${n.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2.5 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h6 className="text-[13.5px] font-semibold text-gray-900 leading-snug">
          {n.title}
        </h6>
        <IconExternalLink
          size={13}
          className="text-gray-300 group-hover:text-blue-600 transition-colors shrink-0 mt-0.5"
        />
      </div>
      <span className="text-[11.5px] text-gray-500 leading-tight">{n.headline}</span>
    </a>
  );
}

function SignalCard({ s }: { s: SignalCard }) {
  const tagStyle =
    s.direction === "down" ? "bg-red-50 text-red-700"   :
    s.direction === "flat" ? "bg-amber-50 text-amber-700" :
                             "bg-emerald-50 text-emerald-700";
  const Arrow =
    s.direction === "down" ? IconArrowDown :
    s.direction === "flat" ? IconMinus :
                             IconArrowUpRight;

  return (
    <div className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
      <span className={`inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${tagStyle}`}>
        <Arrow size={10} stroke={2.5} />
        {s.tag}
      </span>
      <span className="text-[11.5px] text-gray-500 leading-tight">{s.label}</span>
      <span className="text-[18px] font-bold text-gray-900 leading-none">{s.value}</span>
    </div>
  );
}

interface ChartTooltipPayload {
  payload: ChartRow;
}
function ChartTooltip({ active, payload }: { active?: boolean; payload?: ChartTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const ratio = row.expected
    ? Math.round((row.achieved / row.expected) * 100)
    : null;
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-md px-3 py-2 text-[12px]">
      <div className="font-semibold text-gray-900 mb-1">{row.name}</div>
      <div className="flex items-center gap-2 text-gray-600">
        <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#5B5BD6" }} />
        Achieved <span className="font-semibold text-gray-900 ml-auto">{row.achieved} {row.unit}</span>
      </div>
      {row.expected != null && (
        <div className="flex items-center gap-2 text-gray-600 mt-0.5">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#C7C7F0" }} />
          Expected <span className="font-semibold text-gray-900 ml-auto">{row.expected} {row.unit}</span>
        </div>
      )}
      {ratio != null && (
        <div className="text-[11px] text-gray-400 mt-1">{ratio}% of pipeline</div>
      )}
      {row.note && <div className="text-[11px] text-gray-400 mt-0.5">{row.note}</div>}
      <div className="text-[10px] text-gray-300 mt-1.5 font-mono">{row.code}</div>
    </div>
  );
}

function PovertyChart({ title }: { title: string }) {
  const [active, setActive] = useState<FilterTab>("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const data = active === "All"
    ? CHART_DATA
    : CHART_DATA.filter((r) => r.vertical === active);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
      <h4 className="text-[15px] font-bold text-gray-900">{title}</h4>

      {/* Interactive filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-1 rounded-md text-[12px] font-medium border transition-colors ${
              active === t
                ? "border-gray-900 text-gray-900 bg-white"
                : "border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11.5px] text-gray-600 mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#5B5BD6" }} />
          Achieved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#C7C7F0" }} />
          Expected (pipeline)
        </span>
      </div>

      <div style={{ height: Math.max(180, data.length * 52) }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            barCategoryGap={10}
            onMouseLeave={() => setHovered(null)}
          >
            <CartesianGrid horizontal={false} stroke="#F1F5F9" />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v}`}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11.5, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              width={150}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(91, 91, 214, 0.05)" }} />
            <Bar
              dataKey="achieved"
              fill="#5B5BD6"
              radius={[0, 3, 3, 0]}
              barSize={10}
              onMouseEnter={(d: { payload?: ChartRow }) => setHovered(d.payload?.code ?? null)}
              fillOpacity={1}
            />
            <Bar
              dataKey="expected"
              fill="#C7C7F0"
              radius={[0, 3, 3, 0]}
              barSize={10}
              onMouseEnter={(d: { payload?: ChartRow }) => setHovered(d.payload?.code ?? null)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote that updates with hover for a bit of feedback */}
      <div className="text-[11px] text-gray-400 -mt-1 pl-1 min-h-[14px]">
        {hovered
          ? `Indicator code: ${hovered}`
          : `${data.length} indicator${data.length === 1 ? "" : "s"} · hover bars for detail`}
      </div>
    </div>
  );
}

// Health-gap flow — country-level achievement chart with status filter.
function HealthGapChart({ title, caption }: { title: string; caption: string }) {
  const [active, setActive] = useState<HealthFilterTab>("All countries");
  const [hovered, setHovered] = useState<string | null>(null);

  const data = HEALTH_COUNTRY_DATA
    .filter((r) => {
      if (active === "FCS") return r.fcs;
      if (active === "Behind target") return r.achieved / r.expected < 0.5;
      return true;
    })
    .slice()
    .sort((a, b) => a.achieved / a.expected - b.achieved / b.expected); // worst first

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
      <h4 className="text-[15px] font-bold text-gray-900">{title}</h4>

      <div className="flex items-center gap-2 flex-wrap">
        {HEALTH_FILTER_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-1 rounded-md text-[12px] font-medium border transition-colors ${
              active === t
                ? "border-gray-900 text-gray-900 bg-white"
                : "border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11.5px] text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#5B5BD6" }} />
          Achieved (FY25)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#C7C7F0" }} />
          FY25 target
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {data.map((row) => {
          const ratio = row.achieved / row.expected;
          const pct = Math.round(ratio * 100);
          const isHover = hovered === row.iso3;
          const barColor =
            ratio < 0.5  ? "#D04040" :
            ratio < 0.75 ? "#E88B2B" : "#2E8B57";
          return (
            <li
              key={row.iso3}
              onMouseEnter={() => setHovered(row.iso3)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col gap-1"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-gray-900 flex items-center gap-1.5">
                  {row.name}
                  {row.fcs && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded bg-orange-50 text-orange-700 border border-orange-200">
                      FCS
                    </span>
                  )}
                </span>
                <span className={`text-[11.5px] tabular-nums transition-colors ${isHover ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                  {row.achieved}M / {row.expected}M · {pct}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-[#C7C7F0]"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, pct)}%`, background: barColor, opacity: isHover ? 1 : 0.9 }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-[11px] text-gray-400 -mt-1">
        {caption}
      </div>
    </div>
  );
}

// ─── Thought Process ─────────────────────────────────────────────────────────
// A vertical "research log" with typed steps (search → compute → filter → analyze)
// each rendered as a connected timeline item with its own icon and a
// monospace "result" line.

type ThoughtStepType = "search" | "compute" | "filter" | "analyze";

const THOUGHT_STEP_META: Record<ThoughtStepType, { icon: typeof IconSearch; color: string; tint: string; label: string }> = {
  search:  { icon: IconSearch,     color: "#0288D1", tint: "#E6F4FB", label: "Search"  },
  compute: { icon: IconCalculator, color: "#6B4FA0", tint: "#EFEAF7", label: "Compute" },
  filter:  { icon: IconFilter,     color: "#E88B2B", tint: "#FCEFE0", label: "Filter"  },
  analyze: { icon: IconChartBar,   color: "#2E8B57", tint: "#E5F2EC", label: "Analyze" },
};

interface ThoughtStep {
  type: ThoughtStepType;
  text: string;
  detail?: string;   // monospaced "result" line
}

const THOUGHT_STEPS_AFRICA: ThoughtStep[] = [
  { type: "search",  text: "Searching the active FY2025 portfolio for poverty-relevant outcome indicators",         detail: "8 Results indicators matched" },
  { type: "filter",  text: "Filtering to IDA-eligible countries and excluding double-counted beneficiaries",          detail: "Deduplicating beneficiaries" },
  { type: "compute", text: "Computing achieved/expected pipeline ratios per indicator at FY25 cut-off",                detail: "FY2025 cut-off (June 2025)" },
  { type: "analyze", text: "Identifying regional leaders and cross-referencing related context signals",               detail: "AFE/AFW lead vs other regions" },
];

const THOUGHT_STEPS_HEALTH: ThoughtStep[] = [
  { type: "search",  text: "Reading Health Services results · project-level rows for FY2025",                           detail: "874 project rows scanned" },
  { type: "compute", text: "Computing achieved/expected ratio per country and aggregating by ISO3",                     detail: "Deduplicating beneficiaries" },
  { type: "filter",  text: "Filtering to fragile/conflict-affected states and ranking countries furthest below 100%",   detail: "5 countries below 50% — all FCS" },
  { type: "analyze", text: "Layering UHC index and stunting context indicators to identify driver patterns",            detail: "UHC Coverage · Stunting" },
];

const NARRATIVE_PLAN_STEPS: ThoughtStep[] = [
  { type: "search",  text: "Reading conversation context",          detail: "africa-poverty signal · 1 query" },
  { type: "search",  text: "Loading indicator catalogue",           detail: "IDA_Scorecard_Metadata_1.xlsx · 21 Results indicators" },
  { type: "filter",  text: "Matching 6 Results indicators",         detail: "SOC_SAF · EDU_SUPP · HEA_SERV · RESI_CLIM · ELC_ACCS · EXT_POOR_FCS" },
  { type: "compute", text: "Filtering to AFE + AFW · FY25 cut-off", detail: "Time_Period == 2025-06-30 · Double_Counting_Flag ≠ Y" },
  { type: "filter",  text: "Pairing 3 Client Context series",       detail: "CSC_CLI_EXT_POOR_FCS · SE_LPV_PRIM · EG_ELC_ACCS_ZS" },
  { type: "analyze", text: "Structuring narrative sections",        detail: "Context · Intervention · Evidence · Impact" },
];

function ThoughtProcess({ flow }: { flow: FlowId }) {
  const [open, setOpen] = useState(false);
  const steps = flow === "health-gap" ? THOUGHT_STEPS_HEALTH : THOUGHT_STEPS_AFRICA;

  return (
    <div className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
          <IconSparkles size={13} className="text-blue-500" />
        </span>
        <span className="text-[13px] font-semibold text-gray-700">Thought Process</span>
        <span className="text-[11px] text-gray-300">·</span>
        <span className="text-[11px] text-gray-500 font-mono">{steps.length} steps</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
          <IconCheck size={10} stroke={3} />
          Complete
        </span>
        <IconChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
          <ol className="relative pl-7">
            {/* Connector line */}
            <span
              aria-hidden
              className="absolute top-3 bottom-3 w-px bg-gray-200"
              style={{ left: 12 }}
            />
            {steps.map((step, i) => {
              const meta = THOUGHT_STEP_META[step.type];
              const Icon = meta.icon;
              return (
                <li key={i} className="relative py-2 first:pt-0 last:pb-0">
                  {/* Timeline marker */}
                  <span
                    className="absolute -left-7 top-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                    style={{ background: meta.tint }}
                  >
                    <Icon size={11} style={{ color: meta.color }} />
                  </span>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[9.5px] font-semibold uppercase tracking-wider px-1 py-px rounded"
                      style={{ background: meta.tint, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Step {i + 1}</span>
                  </div>
                  <div className="text-[12.5px] text-gray-800 leading-snug">{step.text}</div>
                  {step.detail && (
                    <div className="mt-1 text-[10.5px] text-gray-500 font-mono bg-gray-50 border border-gray-100 rounded px-2 py-1 inline-block">
                      → {step.detail}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function NarrativePlanningMessage({
  animate,
  onComplete,
}: {
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(() =>
    animate ? 0 : NARRATIVE_PLAN_STEPS.length
  );
  const [open, setOpen] = useState(animate);
  const done = visibleCount >= NARRATIVE_PLAN_STEPS.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reveal one step every 400ms while animating
  useEffect(() => {
    if (!animate || done) return;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), 400);
    return () => clearTimeout(t);
  }, [animate, visibleCount, done]);

  // Auto-collapse and fire callback once all steps are visible
  useEffect(() => {
    if (!animate || !done) return;
    const t = setTimeout(() => {
      setOpen(false);
      onCompleteRef.current?.();
    }, 400);
    return () => clearTimeout(t);
  }, [animate, done]);

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0">
        <div className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
          <button
            onClick={() => done && setOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            aria-expanded={open}
          >
            <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
              <IconSparkles
                size={13}
                className={done ? "text-blue-500" : "text-blue-500 animate-pulse"}
              />
            </span>
            <span className="text-[13px] font-semibold text-gray-700">Narrative planning</span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-500 font-mono">
              {NARRATIVE_PLAN_STEPS.length} steps
            </span>
            {done ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                <IconCheck size={10} stroke={3} />
                Complete
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Running
              </span>
            )}
            {done && (
              <IconChevronDown
                size={14}
                className={`text-gray-400 transition-transform ml-1 ${open ? "rotate-180" : ""}`}
              />
            )}
          </button>

          {open && (
            <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
              <ol className="relative pl-7">
                <span
                  aria-hidden
                  className="absolute top-3 bottom-3 w-px bg-gray-200"
                  style={{ left: 12 }}
                />
                {NARRATIVE_PLAN_STEPS.map((step, i) => {
                  const meta = THOUGHT_STEP_META[step.type];
                  const Icon = meta.icon;
                  const visible = i < visibleCount;
                  return (
                    <li
                      key={i}
                      className={`relative py-2 first:pt-0 last:pb-0 transition-opacity duration-300 ${
                        visible ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span
                        className="absolute -left-7 top-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                        style={{ background: meta.tint }}
                      >
                        <Icon size={11} style={{ color: meta.color }} />
                      </span>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[9.5px] font-semibold uppercase tracking-wider px-1 py-px rounded"
                          style={{ background: meta.tint, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Step {i + 1}</span>
                      </div>
                      <div className="text-[12.5px] text-gray-800 leading-snug">{step.text}</div>
                      {step.detail && visible && (
                        <div className="mt-1 text-[10.5px] text-gray-500 font-mono bg-gray-50 border border-gray-100 rounded px-2 py-1 inline-block">
                          → {step.detail}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NarrativeSkeletonMessage() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          Here&rsquo;s the outline for your narrative. Let me know if this looks right:
        </p>

        <div className="flex flex-col gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          {/* Context */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Context
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed">
              Sub-Saharan Africa remains the epicentre of extreme poverty. FCS-country poverty sits
              at 30.4%{" "}
              <code className="text-[11.5px] font-mono bg-gray-100 px-1 py-px rounded text-gray-600">
                CSC_CLI_EXT_POOR_FCS
              </code>
              , 70% learning poverty persists in primary schools{" "}
              <code className="text-[11.5px] font-mono bg-gray-100 px-1 py-px rounded text-gray-600">
                SE_LPV_PRIM
              </code>
              , and 56 economies collect less than 15% tax-to-GDP — limiting fiscal space for
              homegrown investment.
            </p>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Intervention */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Intervention
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed">
              FY25 IDA operations targeted People-pillar programs across AFE + AFW, with safety
              nets, education access, and primary health care as the primary delivery channels.
              Climate resilience and electricity expansion{" "}
              <code className="text-[11.5px] font-mono bg-gray-100 px-1 py-px rounded text-gray-600">
                EG_ELC_ACCS_ZS
              </code>{" "}
              addressed the Planet and Infrastructure pillars.
            </p>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Evidence */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Evidence
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed mb-1.5">
              Key FY25 results vs. pipeline targets:
            </p>
            <ul className="flex flex-col gap-1.5 text-[12.5px] text-gray-700 pl-1">
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[5px]" aria-hidden="true" />
                <span>
                  Social safety nets: 244M / ~313M{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_SOC_SAF_PROG
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[5px]" aria-hidden="true" />
                <span>
                  Students supported: 325M / ~452M{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_EDU_SUPP
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[5px]" aria-hidden="true" />
                <span>
                  Health services: 370M / ~425M{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_HEA_SERV
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0 mt-[5px]" aria-hidden="true" />
                <span>
                  Climate resilience: 244M / ~425M — behind target{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_RESI_CLIM_RISK
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 mt-[5px]" aria-hidden="true" />
                <span>
                  Electricity access: 215M / 576M — significantly behind target{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_ELC_ACCS
                  </code>
                </span>
              </li>
            </ul>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Impact */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Impact
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed">
              The People vertical leads at 68% achievement. FCS-country health efficiency is 2.3×
              vs. non-FCS IDA peers. Infrastructure at 41% flags FY26 priorities, with electricity
              access warranting a dedicated funding push in AFE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NarrativeGeneratingMessage() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <p className="text-[13.5px] text-gray-700 leading-relaxed pt-1">
        Got it — generating the first draft of your narrative now.
      </p>
    </div>
  );
}

// Hover-to-edit conversation title — pencil glyph appears on hover; click to
// switch to a centered text input that commits on Enter or blur, cancels on
// Escape. Used in the conversation header so users can override the
// AI-derived working title.
function EditableTitle({
  value,
  onChange,
}: {
  value: string;
  onChange?: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!onChange) {
    return (
      <h1 className="text-center text-[15px] font-semibold text-gray-900" style={{ fontFamily: F }}>
        {value}
      </h1>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const next = draft.trim();
          if (next && next !== value) onChange(next);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter")  { e.currentTarget.blur(); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className="text-center text-[15px] font-semibold text-gray-900 bg-white border border-blue-300 rounded-md px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[280px] max-w-[480px]"
        style={{ fontFamily: F }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to rename"
      className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-gray-900 hover:bg-gray-50 rounded-md px-2 py-0.5 transition-colors max-w-full"
      style={{ fontFamily: F }}
    >
      <span className="truncate">{value}</span>
      <IconPencil
        size={12}
        className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
}

function UsedSources({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-[12.5px] text-blue-600 font-medium">
        Used {sources.length} sources
        <IconChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-2 ml-4 list-disc text-[12px] text-gray-500 space-y-1">
          {sources.map((s) => <li key={s}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function ConversationView({
  prompt,
  onClose,
  panelOpen,
  panelWidth = 0,
  suppressTransition,
  artefacts = [],
  onSelectArtefact,
  title,
  onTitleChange,
  embedded,
  narrativePhase = "idle",
  onNarrativePlanningComplete,
}: Props) {
  const flow = useMemo(() => detectFlow(prompt), [prompt]);
  const content = FLOW_CONTENT[flow];
  const signals = flow === "health-gap" ? HEALTH_RELATED_SIGNALS : RELATED_SIGNALS;
  const narratives = useMemo(() => pickNarratives(prompt, 4), [prompt]);

  const narrativeArtefact = artefacts.find((a) => a.kind === "narrative");
  // Show blocks permanently once the artefact is saved (persistent chat history).
  const showBlock1 = narrativePhase !== "idle" || !!narrativeArtefact;
  const showBlock2 =
    narrativePhase === "skeleton-ready" ||
    narrativePhase === "generating" ||
    !!narrativeArtefact;
  const showBlock3 = narrativePhase === "generating" || !!narrativeArtefact;

  // Files dropdown state
  const [filesOpen, setFilesOpen] = useState(false);
  const filesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filesOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (filesRef.current && !filesRef.current.contains(e.target as Node)) {
        setFilesOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filesOpen]);

  return (
    <div
      className={`flex flex-col ${embedded ? "h-full" : "h-screen"} bg-white ${suppressTransition ? "" : "transition-[padding] duration-500 ease-in-out"}`}
      style={{ paddingRight: panelOpen ? panelWidth : 0 }}
    >
      {/* 3-column grid keeps the title at the geometric viewport center
          regardless of left logo width or right action group width.
          Hidden in embedded mode — the parent provides its own header. */}
      {!embedded && <header className="shrink-0 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 border-b border-gray-100">
        <Image
          src="/globe.svg"
          alt="World Bank Group"
          width={36}
          height={36}
          className="justify-self-start shrink-0"
          priority
        />
        <div className="justify-self-center min-w-0 max-w-full flex items-center justify-center">
          <EditableTitle value={title ?? content.title} onChange={onTitleChange} />
        </div>
        <div className="justify-self-end flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-50">
            <IconShare size={14} />
            Share
          </button>

          {/* Files: list of created narrative artefacts */}
          <div ref={filesRef} className="relative">
            <button
              onClick={() => setFilesOpen((v) => !v)}
              aria-label={`Artefacts (${artefacts.length})`}
              className={`relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${
                filesOpen ? "text-gray-900 bg-gray-100" : "text-gray-500"
              }`}
            >
              <IconFiles size={16} />
              {artefacts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-semibold flex items-center justify-center">
                  {artefacts.length}
                </span>
              )}
            </button>

            {filesOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Narrative artefacts</div>
                </div>
                {artefacts.length === 0 ? (
                  <div className="px-3 py-6 text-[12px] text-gray-400 text-center">
                    No artefacts yet.<br />
                    Click <span className="font-medium text-gray-600">Create narrative</span> to save one.
                  </div>
                ) : (
                  <ul className="max-h-[320px] overflow-y-auto">
                    {[...artefacts].reverse().map((a) => {
                      const isInsight = a.kind === "insightographic";
                      const Icon = isInsight ? IconChartBar : IconNotebook;
                      return (
                        <li key={a.id}>
                          <button
                            onClick={() => { onSelectArtefact?.(a); setFilesOpen(false); }}
                            className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                              isInsight ? "bg-emerald-50" : "bg-blue-50"
                            }`}>
                              <Icon size={13} className={isInsight ? "text-emerald-600" : "text-blue-600"} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] font-medium text-gray-900 truncate">{a.title}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded ${
                                  isInsight ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                                }`}>
                                  {isInsight ? "Insight" : "Narrative"}
                                </span>
                                <span className="text-[10.5px] text-gray-400">
                                  {new Date(a.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                </span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <IconX size={16} />
          </button>
        </div>
      </header>}

      {/* Scrollable conversation area — bottom padding leaves room for the
          shared PromptBar that sits fixed at the page bottom. */}
      <div className="flex-1 overflow-y-auto scrollbar-auto-hide">
        <div className="max-w-[680px] mx-auto px-6 py-8 pb-32 flex flex-col gap-6">
          {/* User message */}
          <div className="self-end flex items-center gap-3 max-w-[85%]">
            <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
              {prompt}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
              NT
            </div>
          </div>

          {/* Thought process */}
          <ThoughtProcess flow={flow} />

          {/* Assistant response */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
              SC
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <p className="text-[14.5px] font-semibold text-gray-900 leading-relaxed">
                {content.leadAnswer}
              </p>
              <p className="text-[13.5px] text-gray-700 leading-relaxed">
                {content.bodyText}
              </p>
              <p className="text-[12.5px] text-gray-500">
                {content.filterCaption}
              </p>

              {/* Chart — flow-specific */}
              {flow === "health-gap" ? (
                <HealthGapChart
                  title={content.chartTitle}
                  caption="Health Services results · project-level data · FY2025"
                />
              ) : (
                <PovertyChart title={content.chartTitle} />
              )}

              {/* Related Signals */}
              <div className="flex flex-col gap-2 mt-2">
                <h5 className="text-[12px] font-semibold text-gray-500">{content.signalsHeader}</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {signals.map((s, i) => <SignalCard key={i} s={s} />)}
                </div>
              </div>

              {/* Narratives — matched to the user's prompt via keyword scoring */}
              <div className="flex flex-col gap-2 mt-2">
                <h5 className="text-[12px] font-semibold text-gray-500">Narratives you may be interested in</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {narratives.map((nv) => <NarrativeCard key={nv.slug} n={nv} />)}
                </div>
              </div>

              {/* Sources */}
              <UsedSources sources={content.sources} />

              {/* Continue exploring */}
              <div className="flex flex-col gap-3 mt-2">
                <h5 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Continue Exploring</h5>
                <div className="flex flex-wrap gap-2">
                  {content.continueExploring.map((q) => (
                    <button
                      key={q}
                      className="px-3 py-1.5 rounded-full border border-gray-200 text-[12.5px] text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-gray-100 text-gray-400">
                <button className="hover:text-gray-700 transition-colors"><IconCopySm size={16} /></button>
                <span className="w-px h-4 bg-gray-200" />
                <button className="hover:text-gray-700 transition-colors"><IconThumbUp size={16} /></button>
                <button className="hover:text-gray-700 transition-colors"><IconThumbDown size={16} /></button>
              </div>
            </div>
          </div>

          {/* ── Narrative confirmation flow ── */}
          {showBlock1 && (
            <NarrativePlanningMessage
              animate={narrativePhase === "planning"}
              onComplete={onNarrativePlanningComplete}
            />
          )}
          {showBlock2 && <NarrativeSkeletonMessage />}
          {showBlock3 && <NarrativeGeneratingMessage />}

          <div className="h-8" />
        </div>
      </div>

    </div>
  );
}
