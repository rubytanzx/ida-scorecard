"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IconX,
  IconChevronDown,
  IconNotebook,
  IconGripVertical,
  IconMapPin,
  IconPlus,
  IconMinus as IconMinusSign,
  IconRefresh,
  IconWand,
  IconChartBar as IconInfographic,
  IconPresentationAnalytics,
  IconFileTypeDoc,
  IconChevronUp,
  IconWorld,
  IconCheck,
  IconSparkles,
  IconPhoto,
} from "@tabler/icons-react";
import type { AddedVisual } from "./ConversationView";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RcTooltip,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { FLOW_SKELETONS, type Pathways } from "./NarrativeSkeletons";

interface Props {
  open: boolean;
  prompt: string;
  onClose: () => void;
  width: number;
  onResize: (width: number, dragging: boolean) => void;
  /** Fires when the user picks an option from the Generate menu. The parent
   * decides what to do with the chosen format (e.g. swap to Infographic
   * panel, queue a download, etc.). */
  onGenerate?: (kind: string) => void;
  /** When true, render skeleton placeholders + an animated geography loader
   * in place of the real content — used while the narrative is being
   * generated for the first time. */
  loading?: boolean;
  /** Kinds already generated for this conversation. Used to mark menu
   * items as "open" rather than "generate" since one of each per
   * conversation is the rule. */
  generatedKinds?: string[];
  /** Which narrative-angle skeleton the conversation picked. Used to
   *  resolve the extra country example surfaced after the user clicks
   *  "Add one more country example" in the conversation thread. */
  skeletonId?: string | null;
  /** True after the user has applied the post-draft "add one more country
   *  example" refinement. The Country Examples section appends the
   *  skeleton's `extraCountryExample` story when this is set. */
  extraCountryApplied?: boolean;
  /** Visuals the user assigned from the VisualSupportMessage — rendered as
   *  skeleton placeholders inside the matching accordion section. */
  addedVisuals?: AddedVisual[];
  /** Called when the user removes a visual from the panel. */
  onRemoveVisual?: (id: string) => void;
  /** Called when the user adds a visual inline from a section's dotted-box
   *  picker. The panel knows the section, so it only needs to surface the
   *  type the user picked — the parent assigns an id. */
  onAddVisual?: (visual: AddedVisual) => void;
  /** Called when the user highlights text and clicks "Modify this". */
  onModifyContent?: (target: { text: string; sectionId: string | null }) => void;
  /** Signal from page.tsx to trigger a purple skeleton + body override for a
   *  section. The nonce ensures the effect fires even when the same sectionId
   *  is targeted twice in succession. */
  contentModifySignal?: { sectionId: string | null; instruction: string; nonce: number } | null;
}

export const NARRATIVE_PANEL_DEFAULT_WIDTH = 560;
export const NARRATIVE_PANEL_MIN_WIDTH = 360;
export const NARRATIVE_PANEL_MAX_WIDTH = 880;

// ─── Region map data ─────────────────────────────────────────────────────────

interface Region {
  code: string;       // WB region code
  name: string;
  short: string;      // ultra-short label for the tile
  reachM: number;     // FY25 IDA beneficiaries reached, millions (cross-pillar)
  expectedM: number;  // FY25 pipeline target, millions
  // Health-services breakdown (CSC_RES_HEA_SERV) for the health-gap flow
  healthReachM: number;
  healthExpectedM: number;
  keywords: string[];
}

// Regional totals for IDA-eligible CSC_RES_HEA_SERV (FY25) — internally
// consistent with the country breakdown shown in the conversation chart:
//   • SAR includes India (89/101) + Bangladesh (32.6/35.2) → ~88% achievement
//   • MENAAP includes Pakistan (28.4/36.5) + Afghanistan (2.4/5.5) + Yemen (1.2/3.2)
//     → low ratio because the bottom-2 drag the regional aggregate
//   • AFE includes Sudan + South Sudan (both bottom-5) → drag
//   • EAP includes Myanmar (bottom-5) → drag
const REGIONS: Region[] = [
  { code: "AFE",    name: "Africa East",                  short: "Africa East",  reachM: 92, expectedM: 124, healthReachM: 52, healthExpectedM:  72, keywords: ["africa", "sub-saharan", "afe", "kenya", "ethiopia", "sudan", "south sudan", "somalia"] },
  { code: "AFW",    name: "Africa West",                  short: "Africa West",  reachM: 78, expectedM: 113, healthReachM: 41, healthExpectedM:  52, keywords: ["africa", "sub-saharan", "afw", "nigeria", "ghana"] },
  { code: "EAP",    name: "East Asia & Pacific",          short: "East Asia",    reachM: 41, expectedM:  66, healthReachM: 31, healthExpectedM:  42, keywords: ["east asia", "pacific", "eap", "indonesia", "vietnam", "philippines", "myanmar"] },
  { code: "ECA",    name: "Europe & Central Asia",        short: "Eur. & C.Asia", reachM: 24, expectedM:  29, healthReachM:  8, healthExpectedM:  10, keywords: ["europe", "central asia", "eca"] },
  { code: "LCR",    name: "Latin America & Caribbean",    short: "LAC",          reachM: 28, expectedM:  39, healthReachM:  6, healthExpectedM:   8, keywords: ["latin america", "caribbean", "lcr", "lac", "mexico", "brazil"] },
  { code: "MENAAP", name: "Middle East · N. Africa · A&P", short: "MENAAP",       reachM: 19, expectedM:  35, healthReachM: 34, healthExpectedM:  52, keywords: ["middle east", "north africa", "menaap", "mena", "afghanistan", "pakistan", "yemen"] },
  { code: "SAR",    name: "South Asia",                   short: "South Asia",   reachM: 95, expectedM: 151, healthReachM: 92, healthExpectedM: 104, keywords: ["south asia", "sar", "india", "bangladesh", "nepal", "sri lanka"] },
];

const FCS_LENS_KEYWORDS = ["fcs", "fcv", "fragile", "conflict", "violence", "displaced", "refugee"];

function detectRegions(prompt: string, flow: FlowId): { codes: string[]; fcs: boolean } {
  const text = prompt.toLowerCase();

  // Health-gap flow is a global question ("which countries are behind?") —
  // every region needs to be visible for cross-region comparison. We just
  // force the FCS lens on, since the answer's bottom-5 are all FCS.
  if (flow === "health-gap") {
    return { codes: REGIONS.map((r) => r.code), fcs: true };
  }

  if (!text.trim()) return { codes: REGIONS.map((r) => r.code), fcs: false };
  const codes = new Set<string>();
  for (const r of REGIONS) {
    for (const k of r.keywords) {
      if (text.includes(k)) { codes.add(r.code); break; }
    }
  }
  const fcs = FCS_LENS_KEYWORDS.some((k) => text.includes(k));
  if (codes.size === 0) REGIONS.forEach((r) => codes.add(r.code));
  return { codes: Array.from(codes), fcs };
}

function ratioColor(r: number) {
  if (r < 0.55) return "#D04040";   // red
  if (r < 0.70) return "#E88B2B";   // gold
  return "#2E8B57";                 // green
}

// ─── World map data ──────────────────────────────────────────────────────────
// Topojson source: world-atlas v2 (Natural Earth, 110m). geo.id is M49 numeric,
// padded to 3 chars (e.g. Nigeria = "566", Afghanistan = "004").
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const pad3 = (n: number) => String(n).padStart(3, "0");

// IDA-relevant countries grouped by WBG region (ISO 3166-1 numeric).
const REGION_COUNTRIES: Record<string, number[]> = {
  AFE: [404, 834, 231, 800, 646, 108, 450, 454, 508, 894, 716, 706, 728, 729, 174, 232, 262],
  AFW: [566, 288, 686, 384, 854, 466, 562, 120, 148, 430, 694, 324, 624, 270, 478, 204, 768, 178, 180, 140, 132, 266, 678],
  EAP: [360, 608, 704, 116, 418, 104, 598,  90, 548, 242, 776, 882, 296, 583, 584, 626, 496, 156, 410, 392],
  ECA: [792, 643, 804, 398, 860, 762, 417,  31,  51, 268, 498, 112,   8,  70, 807, 499, 688, 795, 100, 191, 348, 616, 642, 703, 705, 233, 428, 440, 246, 752, 578, 208, 372, 826, 250, 276, 380, 528,  56, 442, 438,  40],
  LCR: [484,  76,  32, 170, 604, 152, 862,  68, 218, 320, 340, 558, 222, 591, 188, 858, 600, 388, 332, 214, 192,  84, 328, 740, 780,  44, 212, 308, 28],
  MENAAP: [818, 682, 364, 368, 400, 422, 760, 504, 788,  12, 434, 887,   4, 586, 729, 376, 275, 784, 634, 414,  48, 512],
  SAR: [356,  50, 524,  64, 144, 462],
};

const ISO_TO_REGION: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [r, isos] of Object.entries(REGION_COUNTRIES)) {
    for (const iso of isos) m[pad3(iso)] = r;
  }
  return m;
})();

const REGION_FILL: Record<string, string> = {
  AFE:    "#2E8B57",
  AFW:    "#54A574",
  EAP:    "#0288D1",
  ECA:    "#5C6BC0",
  LCR:    "#E88B2B",
  MENAAP: "#D04040",
  SAR:    "#6B4FA0",
};

interface WorldMapProps {
  prompt: string;
  flow: FlowId;
  selectedRegion: string | null;
  onSelectRegion: (r: string | null) => void;
}

function WorldMap({ prompt, flow, selectedRegion, onSelectRegion }: WorldMapProps) {
  const { codes, fcs } = useMemo(() => detectRegions(prompt, flow), [prompt, flow]);
  const inScope = (r?: string) => !r || codes.includes(r);
  const [hover, setHover] = useState<string | null>(null);

  // Zoom + pan state for ZoomableGroup
  const [zoom, setZoom] = useState(1.6);
  const [center, setCenter] = useState<[number, number]>([20, 10]);
  const clampZoom = (z: number) => Math.max(1, Math.min(8, z));

  return (
    <div className="relative bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/40 border border-gray-200 rounded-lg overflow-hidden">
      <div className="w-full" style={{ aspectRatio: "2 / 1" }}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 130 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={1}
            maxZoom={8}
            onMoveEnd={({ coordinates, zoom: z }) => {
              setCenter(coordinates as [number, number]);
              setZoom(z);
            }}
          >
            <Geographies geography={WORLD_GEO_URL}>
              {({ geographies }: { geographies: { rsmKey: string; id: string; properties: { name?: string } }[] }) =>
                geographies.map((geo) => {
                  const region = ISO_TO_REGION[geo.id];
                  const isHover = hover === geo.id;
                  const isSelected = !!selectedRegion && region === selectedRegion;
                  const inScopeNow = inScope(region);
                  const baseFill = region ? REGION_FILL[region] : "#E5E7EB";

                  // Selection > scope > hover for visibility
                  let opacity: number;
                  if (selectedRegion) {
                    opacity = isSelected ? 1 : region ? 0.18 : 0.12;
                  } else if (!region) {
                    opacity = 0.4;
                  } else {
                    opacity = inScopeNow ? (isHover ? 1 : 0.85) : 0.18;
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={baseFill}
                      stroke={isSelected ? "rgba(26,26,46,0.45)" : "#FFFFFF"}
                      strokeWidth={isSelected ? 0.55 : 0.4}
                      onMouseEnter={() => setHover(geo.id)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => {
                        if (region) onSelectRegion(selectedRegion === region ? null : region);
                      }}
                      style={{
                        default: { outline: "none", opacity, transition: "opacity .15s, fill .15s, stroke .15s", cursor: region ? "pointer" : "default" },
                        hover:   { outline: "none", opacity: 1 },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* FCS lens chip */}
      {fcs && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
          FCS lens
        </span>
      )}

      {/* Zoom controls — bottom-right */}
      <div className="absolute bottom-2 right-2 flex flex-col bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md overflow-hidden shadow-sm">
        <button
          aria-label="Zoom in"
          onClick={() => setZoom((z) => clampZoom(z * 1.5))}
          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <IconPlus size={13} />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => setZoom((z) => clampZoom(z / 1.5))}
          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <IconMinusSign size={13} />
        </button>
        <button
          aria-label="Reset view"
          onClick={() => { setZoom(1.6); setCenter([20, 10]); }}
          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <IconRefresh size={12} />
        </button>
      </div>

      {/* Hovered/selected readout */}
      {(hover || selectedRegion) && (
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md px-2 py-1 text-[11px] flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-sm"
            style={{
              background:
                (hover && ISO_TO_REGION[hover] && REGION_FILL[ISO_TO_REGION[hover]!]) ||
                (selectedRegion && REGION_FILL[selectedRegion]) ||
                "#9CA3AF",
            }}
          />
          <span className="font-semibold text-gray-900">
            {(hover && (ISO_TO_REGION[hover] ?? "Out of WBG scope")) || selectedRegion}
          </span>
          {selectedRegion && !hover && (
            <button
              onClick={() => onSelectRegion(null)}
              className="ml-1 text-gray-400 hover:text-gray-700"
              aria-label="Clear selection"
            >
              <IconX size={10} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface RegionTilesProps {
  prompt: string;
  flow: FlowId;
  selectedRegion: string | null;
  onSelectRegion: (r: string | null) => void;
}

function RegionTiles({ prompt, flow, selectedRegion, onSelectRegion }: RegionTilesProps) {
  const { codes } = useMemo(() => detectRegions(prompt, flow), [prompt, flow]);
  const [hover, setHover] = useState<string | null>(null);

  // Pick which slice to display — health-services-only for the health-gap flow,
  // cross-pillar reach otherwise.
  const isHealth = flow === "health-gap";
  const reachOf = (r: Region) => isHealth ? r.healthReachM : r.reachM;
  const expectedOf = (r: Region) => isHealth ? r.healthExpectedM : r.expectedM;

  // Resolve the active row. When nothing is selected or hovered, fall back
  // to a synthetic "Global" row that aggregates all regions — this gives
  // the user a meaningful default headline.
  const active = selectedRegion ?? hover;
  const activeRegion = active ? REGIONS.find((r) => r.code === active) : null;

  const globalReach = REGIONS.reduce((sum, r) => sum + reachOf(r), 0);
  const globalExpected = REGIONS.reduce((sum, r) => sum + expectedOf(r), 0);

  const activeCode = activeRegion?.code ?? "GLOBAL";
  const activeName = activeRegion?.name ?? (isHealth ? "All IDA · global" : "All IDA · global");
  const activeReach = activeRegion ? reachOf(activeRegion) : globalReach;
  const activeExpected = activeRegion ? expectedOf(activeRegion) : globalExpected;
  const activeRatio = activeExpected ? activeReach / activeExpected : 0;
  const activePct = Math.round(activeRatio * 100);

  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
        {isHealth ? "Regional health-services reach (FY25)" : "Regional reach (FY25)"}
      </h4>

      {/* Region tile grid — no outer card wrapper; each tile already
          carries its own surface so a parent card would just nest. */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-1.5">
          {REGIONS.map((r) => {
            const reach = reachOf(r);
            const expected = expectedOf(r);
            const ratio = expected ? reach / expected : 0;
            const pct = Math.round(ratio * 100);
            const inScope = codes.includes(r.code);
            const isHover = hover === r.code;
            const isSelected = selectedRegion === r.code;
            return (
              <button
                key={r.code}
                onMouseEnter={() => setHover(r.code)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectRegion(isSelected ? null : r.code)}
                className={`group relative flex flex-col items-start gap-0.5 p-2 rounded-md border transition-all text-left ${
                  isSelected
                    ? "bg-white border-gray-900 ring-2 ring-gray-300 shadow-sm"
                    : inScope
                      ? "bg-white border-gray-200 hover:border-gray-400"
                      : "bg-white/40 border-gray-100 opacity-50 hover:opacity-80"
                } ${isHover && !isSelected ? "ring-2 ring-blue-200 border-blue-400" : ""}`}
              >
                <span className="text-[9px] font-mono text-gray-400">{r.code}</span>
                <span className="text-[10.5px] font-semibold text-gray-700 leading-tight truncate w-full">
                  {r.short}
                </span>
                <span className="text-[13px] font-bold leading-none mt-0.5" style={{ color: ratioColor(ratio) }}>
                  {reach}M
                </span>
                <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: ratioColor(ratio) }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 mt-0.5">{pct}% of target</span>
              </button>
            );
          })}
        </div>

        {/* Live readout — single sentence around a prominent stat + progress bar.
            Falls back to global aggregate when nothing is selected/hovered. */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-mono text-gray-400">{activeCode}</span>
            <span className="text-[12.5px] font-semibold text-gray-900 truncate">{activeName}</span>
            {!activeRegion && (
              <span className="ml-auto text-[10px] text-gray-400 italic">
                hover or select a region
              </span>
            )}
          </div>

          {/* Headline reach number */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold text-gray-900 tabular-nums leading-none">
              {activeReach}M
            </span>
            <span className="text-[12px] text-gray-500">
              {isHealth ? "people received HNP services in FY25" : "people reached in FY25"}
            </span>
          </div>

          {/* Progress bar with percent on the right */}
          <div className="flex items-center gap-2.5 mt-0.5">
            <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${activePct}%`, background: ratioColor(activeRatio) }}
              />
            </div>
            <span
              className="text-[12px] font-semibold tabular-nums shrink-0"
              style={{ color: ratioColor(activeRatio) }}
            >
              {activePct}%
            </span>
          </div>

          {/* Target context */}
          <span className="text-[10.5px] text-gray-400 -mt-0.5">
            of {activeExpected}M FY25 {isHealth ? "HNP-services target" : "target"}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Per-country locator map ────────────────────────────────────────────────
// Small map embedded in each country example card. Reuses the same
// world-atlas topojson as the (now-removed) global WorldMap, but zooms in
// on a single country, highlighting it in violet. Falls back to a neutral
// dot when the country isn't in the lookup tables.

// Country name → M49 numeric (matches the topojson `geo.id`, padded to 3).
const NAME_TO_M49: Record<string, string> = {
  Ethiopia: "231", Niger: "562", Mozambique: "508", Madagascar: "450",
  Kenya: "404", Rwanda: "646", Senegal: "686", Yemen: "887",
  Afghanistan: "004", Sudan: "729", "South Sudan": "728", Pakistan: "586",
  Bangladesh: "050", Myanmar: "104", Chad: "148", Nigeria: "566",
  Mali: "466", Zambia: "894", Malawi: "454",
};

// Country name → [longitude, latitude]. Centred roughly on each country's
// geographic centroid so the projection focuses the map on the target.
const NAME_TO_LATLNG: Record<string, [number, number]> = {
  Ethiopia:    [40.5,   9.1],
  Niger:       [ 8.1,  17.6],
  Mozambique:  [35.5, -18.7],
  Madagascar:  [46.9, -18.8],
  Kenya:       [37.9,  -0.0],
  Rwanda:      [29.9,  -1.9],
  Senegal:     [-14.5, 14.5],
  Yemen:       [48.5,  15.6],
  Afghanistan: [67.7,  33.9],
  Sudan:       [30.2,  12.9],
  "South Sudan":[31.3,  7.9],
  Pakistan:    [69.3,  30.4],
  Bangladesh:  [90.4,  23.7],
  Myanmar:     [95.9,  21.9],
  Chad:        [18.7,  15.5],
  Nigeria:     [ 8.7,   9.1],
  Mali:        [-3.9,  17.6],
  Zambia:      [27.8, -13.1],
  Malawi:      [34.3, -13.3],
};

function CountryLocatorMap({ name }: { name: string }) {
  const m49 = NAME_TO_M49[name];
  const center = NAME_TO_LATLNG[name];
  // If the country isn't in our lookup, render a small placeholder so the
  // layout stays stable instead of collapsing.
  if (!m49 || !center) {
    return (
      <div
        className="w-full h-full rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center"
        aria-hidden
      >
        <IconMapPin size={14} className="text-gray-300" />
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-md overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/40">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 600, center }}
        style={{ width: "100%", height: "100%" }}
        aria-label={`Locator map of ${name}`}
      >
        <Geographies geography={WORLD_GEO_URL}>
          {({ geographies }: { geographies: { rsmKey: string; id: string }[] }) =>
            geographies.map((geo) => {
              const isTarget = geo.id === m49;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isTarget ? "#6B4FA0" : "#E5E7EB"}
                  stroke="#FFFFFF"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none", opacity: isTarget ? 1 : 0.85 },
                    hover:   { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

// ─── Charts for each accordion ──────────────────────────────────────────────

// CONTEXT — extreme poverty rate trend (FCS) from CLAUDE.md (declining)
const POVERTY_TREND = [
  { year: "FY21", fcs: 35.6, lic: 25.1 },
  { year: "FY22", fcs: 34.4, lic: 24.2 },
  { year: "FY23", fcs: 33.2, lic: 22.8 },
  { year: "FY24", fcs: 31.8, lic: 21.6 },
  { year: "FY25", fcs: 30.4, lic: 20.5 },
];

function ContextChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h6 className="text-[11px] font-semibold text-gray-700">Extreme poverty rate</h6>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#D04040]" />FCS</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#003F6B]" />LIC avg</span>
        </div>
      </div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={POVERTY_TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
            <RcTooltip
              contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
              formatter={(v, name) => [`${v}%`, name === "fcs" ? "FCS" : "LIC avg"]}
            />
            <Line type="monotone" dataKey="fcs" stroke="#D04040" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="lic" stroke="#003F6B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-gray-400 mt-1">CSC_CLI_EXT_POOR_FCS · 5-year trend</div>
    </div>
  );
}

// INTERVENTION — distribution of FY25 results by vertical
const VERTICAL_MIX = [
  { name: "People",         value: 939, color: "#003F6B" },
  { name: "Planet",         value: 337, color: "#2E8B57" },
  { name: "Infrastructure", value: 215, color: "#E88B2B" },
  { name: "Digital",        value: 217, color: "#00A0DF" },
  { name: "Prosperity",     value:  56, color: "#6B4FA0" },
];

function InterventionChart() {
  const [active, setActive] = useState<string | null>(null);
  const total = VERTICAL_MIX.reduce((s, v) => s + v.value, 0);
  const focus = active
    ? VERTICAL_MIX.find((v) => v.name === active)
    : VERTICAL_MIX[0];
  const pct = focus ? Math.round((focus.value / total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <h6 className="text-[11px] font-semibold text-gray-700 mb-2">FY25 reach mix by vertical</h6>
      <div className="flex items-center gap-3">
        <div className="relative w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={VERTICAL_MIX}
                dataKey="value"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
                onMouseEnter={(_, i) => setActive(VERTICAL_MIX[i].name)}
                onMouseLeave={() => setActive(null)}
              >
                {VERTICAL_MIX.map((v) => (
                  <Cell key={v.name} fill={v.color} stroke="white" strokeWidth={1.5}
                        opacity={!active || active === v.name ? 1 : 0.35} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[16px] font-bold text-gray-900">{pct}%</span>
            <span className="text-[9px] text-gray-500">{focus?.name ?? ""}</span>
          </div>
        </div>
        <ul className="flex-1 flex flex-col gap-1">
          {VERTICAL_MIX.map((v) => (
            <li
              key={v.name}
              onMouseEnter={() => setActive(v.name)}
              onMouseLeave={() => setActive(null)}
              className={`flex items-center justify-between gap-2 text-[11px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                active === v.name ? "bg-gray-50" : ""
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ background: v.color }} />
                <span className="text-gray-700">{v.name}</span>
              </span>
              <span className="font-mono text-gray-500">{v.value}M</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// EVIDENCE — FY25 achievement bars (interactive on hover)
const EVIDENCE_BARS = [
  { name: "Safety nets",      achieved: 244, expected: 313 },
  { name: "Students",         achieved: 325, expected: 452 },
  { name: "Health services",  achieved: 370, expected: 425 },
  { name: "Climate",          achieved: 244, expected: 425 },
  { name: "Electricity",      achieved: 215, expected: 576 },
];

function EvidenceChart() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <h6 className="text-[11px] font-semibold text-gray-700 mb-2">FY25 achievement vs pipeline</h6>
      <ul className="flex flex-col gap-2">
        {EVIDENCE_BARS.map((row, i) => {
          const ratio = row.achieved / row.expected;
          const pct = Math.round(ratio * 100);
          const isHover = hover === i;
          return (
            <li
              key={row.name}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="flex flex-col gap-0.5"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-gray-700">{row.name}</span>
                <span className={`text-[11px] tabular-nums transition-colors ${isHover ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                  {row.achieved}M / {row.expected}M · {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    background: ratioColor(ratio),
                    opacity: isHover ? 1 : 0.85,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// IMPACT — vertical achievement ratios as radial bars
const VERTICAL_RATIOS = [
  { name: "People",         value: 68, color: "#2E8B57" },
  { name: "Prosperity",     value: 52, color: "#E88B2B" },
  { name: "Planet",         value: 45, color: "#E88B2B" },
  { name: "Infrastructure", value: 41, color: "#D04040" },
  { name: "Digital",        value: 50, color: "#E88B2B" },
];

function ImpactChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <h6 className="text-[11px] font-semibold text-gray-700 mb-2">Vertical achievement (FY25)</h6>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="25%"
            outerRadius="92%"
            data={VERTICAL_RATIOS}
            startAngle={90}
            endAngle={-270}
            barSize={9}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={4}>
              {VERTICAL_RATIOS.map((v) => (
                <Cell key={v.name} fill={v.color} />
              ))}
            </RadialBar>
            <RcTooltip
              contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
              formatter={(v) => [`${v}%`, "Achievement"]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[11px]">
        {VERTICAL_RATIOS.map((v) => (
          <li key={v.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: v.color }} />
              <span className="text-gray-700 truncate">{v.name}</span>
            </span>
            <span className="font-mono text-gray-500 tabular-nums shrink-0">{v.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Section + Accordion ─────────────────────────────────────────────────────

type FlowId = "africa-poverty" | "health-gap";

function detectFlow(prompt: string): FlowId {
  const t = prompt.toLowerCase();
  if (
    t.includes("health services target") ||
    t.includes("health & nutrition") ||
    t.includes("global") ||
    t.includes("countries")
  ) return "health-gap";
  return "africa-poverty";
}

interface CountryStory {
  flag: string;
  name: string;
  iso?: string;
  body: string;
  /** Tiny stat shown on the right of each story card (e.g. project count). */
  meta?: string;
}

interface IndicatorRow {
  code: string;
  label: string;
  value: string;
}

interface Hero {
  /** Short outcome name shown as the big page title. */
  title: string;
  /** Lead-in paragraph below the title. */
  intro: string;
  /** Large headline metric for the hero stat block. */
  metric: { value: string; caption: string; code: string };
}

interface Section {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
  Chart?: () => React.ReactElement;
  /** Country case-study paragraphs — rendered below the chart inside the
   *  Country Examples accordion when present. */
  countryStories?: CountryStory[];
  /** When set, renders the 4-step pathway cards instead of bullets + Chart. */
  pathways?: Pathways;
  /** When set, renders a numbered list of "Lesson — bold lead + body"
   *  cards (Lessons Learned format). Replaces `bullets` for sections that
   *  carry structured takeaways. */
  lessons?: { lead: string; body: string }[];
}

interface NarrativeContent {
  hero: Hero;
  sections: Section[];
  indicators: IndicatorRow[];
  methodology: { title: string; href: string };
}

const SECTIONS_AFRICA: Section[] = [
  {
    id: "summary",
    title: "Summary",
    body: "IDA supported 75 of the world's poorest countries through overlapping crises — climate shocks, learning poverty, fiscal fragility, and fragility-conflict-violence — deploying shock-responsive safety nets, structured pedagogy, domestic revenue mobilisation, and community-driven development in the world's hardest operating environments.",
    bullets: [],
  },
  {
    id: "context",
    title: "The Challenge",
    body: "IDA-eligible countries (~75 of the world's poorest) face overlapping pressures: rising debt service, climate shocks, and persistent gaps in basic services. The FCS-country poverty rate has been declining, but remains nearly 50% above the LIC average.",
    bullets: [
      "30.4% of FCS-country populations live in extreme poverty (CSC_CLI_EXT_POOR_FCS)",
      "70% learning poverty in primary education across LICs (SE_LPV_PRIM)",
      "56 countries collecting below 15% tax-to-GDP — persistent over time",
    ],
    Chart: ContextChart,
  },
  {
    id: "intervention",
    title: "Pathways to Outcomes",
    body: "WBG operations across People, Planet, Infrastructure, and Digital pillars converged on integrated programs in FY25, with safety nets, education, and health systems forming the largest single delivery channels.",
    bullets: [
      "Social safety net programs",
      "Better-education support",
      "Health services — 370M reached vs 425M expected",
      "Climate resilience operations",
    ],
    Chart: InterventionChart,
  },
  {
    id: "evidence",
    title: "Country Examples",
    body: "FY25 headline numbers (IDA Results data · WBG global · June 2025) show measurable scaling against pipeline targets. The map below shows regional reach; country blocks summarise representative operations.",
    bullets: [],
    countryStories: [
      {
        flag: "🇪🇹",
        name: "Ethiopia",
        iso: "ETH",
        body: "Shock-responsive Productive Safety Net Programme reached 9.5M Ethiopians during the 2024 drought, with anticipatory transfers triggered within 14 days of a verified shock index. ICR rated outcomes 'Satisfactory'.",
        meta: "11 PADs · 41 ICRs",
      },
      {
        flag: "🇳🇪",
        name: "Niger",
        iso: "NER",
        body: "Adaptive social registry now covers 38% of Niger's chronic-poor households; payment rails sit on biometric ID for sub-week onboarding during lean-season triggers.",
        meta: "7 PADs · 19 ICRs",
      },
      {
        flag: "🇰🇪",
        name: "Kenya",
        iso: "KEN",
        body: "Secondary Education Quality Improvement Project supported 1.4M students with targeted social grants; combined with structured pedagogy reach 320,000 teachers received in-service coaching cycles.",
        meta: "9 PADs · 23 ICRs",
      },
    ],
  },
  {
    id: "impact",
    title: "Lessons Learned",
    body: "Direct beneficiary reach in IDA countries grew across all five verticals, but the gap between achievement and pipeline is widest in Infrastructure (41%) and Planet (45%) — flagging the next funding-cycle priorities.",
    lessons: [
      {
        lead: "FCS focus pays off.",
        body: "Health coverage in FCS countries was delivered at 2.3× the efficiency per dollar of non-FCS IDA peers — fragility multiplies the value of every IDA dollar reaching the right people.",
      },
      {
        lead: "People-pillar gains are the bright spot.",
        body: "People-pillar operations (safety nets, education, health) hit 68% of FY25 targets — the highest across the portfolio — and consistently outperformed when integrated around the same beneficiary cohort.",
      },
      {
        lead: "Infrastructure is the brake.",
        body: "Infrastructure achievement sits at 41%, well below mid-cycle expectation; this is where the next funding cycle needs to recalibrate.",
      },
    ],
    Chart: ImpactChart,
  },
];

const HERO_AFRICA: Hero = {
  title: "Protection for the Poorest",
  intro:
    "FY25 IDA delivery converged on People-pillar programs — safety nets, education, and primary health — reaching 939M direct beneficiaries across the world's poorest countries. FCS-country efficiency is 2.3× higher for health coverage than non-FCS IDA peers, a structural finding worth elevating.",
  metric: {
    value: "30.4%",
    caption: "of FCS-country populations live in extreme poverty (FY25)",
    code: "CSC_CLI_EXT_POOR_FCS",
  },
};

const INDICATORS_AFRICA: IndicatorRow[] = [
  { code: "CSC_RES_SOC_SAF_PROG",    label: "Safety net beneficiaries",   value: "244M / 313M" },
  { code: "CSC_RES_EDU_SUPP",        label: "Students supported",         value: "325M / 452M" },
  { code: "CSC_RES_HEA_SERV",        label: "Health services",            value: "370M / 425M" },
  { code: "CSC_RES_RESI_CLIM_RISK",  label: "Climate resilience",         value: "244M / 425M" },
  { code: "CSC_RES_ELC_ACCS",        label: "Electricity access",         value: "215M / 576M" },
  { code: "CSC_CLI_EXT_POOR_FCS",    label: "Extreme poverty (FCS)",      value: "30.4%" },
];

// ─── Health-gap flow charts + sections ──────────────────────────────────────

// CONTEXT — UHC service coverage index FCS vs LIC (declining/flat)
const UHC_TREND = [
  { year: "FY21", fcs: 35, lic: 47 },
  { year: "FY22", fcs: 34, lic: 48 },
  { year: "FY23", fcs: 33, lic: 48 },
  { year: "FY24", fcs: 32, lic: 49 },
  { year: "FY25", fcs: 32, lic: 49 },
];
function HealthContextChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h6 className="text-[11px] font-semibold text-gray-700">UHC service coverage index</h6>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#D04040]" />FCS</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#003F6B]" />LIC avg</span>
        </div>
      </div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={UHC_TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[20, 60]} />
            <RcTooltip
              contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
              formatter={(v, name) => [`${v}/100`, name === "fcs" ? "FCS" : "LIC avg"]}
            />
            <Line type="monotone" dataKey="fcs" stroke="#D04040" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="lic" stroke="#003F6B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-gray-400 mt-1">SH_UHC_SRVS_CV_XD · 5-year trend (0–100)</div>
    </div>
  );
}

// INTERVENTION — share of FY25 HNP results across project types (donut)
const HNP_PROJECT_MIX = [
  { name: "Primary care expansion", value: 165, color: "#003F6B" },
  { name: "Maternal & child health", value:  88, color: "#0288D1" },
  { name: "Disease surveillance",   value:  62, color: "#2E8B57" },
  { name: "Nutrition programs",     value:  35, color: "#E88B2B" },
  { name: "Health workforce",       value:  20, color: "#6B4FA0" },
];
function HealthInterventionChart() {
  const [active, setActive] = useState<string | null>(null);
  const total = HNP_PROJECT_MIX.reduce((s, v) => s + v.value, 0);
  const focus = active
    ? HNP_PROJECT_MIX.find((v) => v.name === active)
    : HNP_PROJECT_MIX[0];
  const pct = focus ? Math.round((focus.value / total) * 100) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <h6 className="text-[11px] font-semibold text-gray-700 mb-2">FY25 HNP reach by project type</h6>
      <div className="flex items-center gap-3">
        <div className="relative w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={HNP_PROJECT_MIX}
                dataKey="value"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
                onMouseEnter={(_, i) => setActive(HNP_PROJECT_MIX[i].name)}
                onMouseLeave={() => setActive(null)}
              >
                {HNP_PROJECT_MIX.map((v) => (
                  <Cell key={v.name} fill={v.color} stroke="white" strokeWidth={1.5}
                        opacity={!active || active === v.name ? 1 : 0.35} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[16px] font-bold text-gray-900">{pct}%</span>
            <span className="text-[9px] text-gray-500 text-center px-2">{focus?.name ?? ""}</span>
          </div>
        </div>
        <ul className="flex-1 flex flex-col gap-1">
          {HNP_PROJECT_MIX.map((v) => (
            <li
              key={v.name}
              onMouseEnter={() => setActive(v.name)}
              onMouseLeave={() => setActive(null)}
              className={`flex items-center justify-between gap-2 text-[11px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                active === v.name ? "bg-gray-50" : ""
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: v.color }} />
                <span className="text-gray-700 truncate">{v.name}</span>
              </span>
              <span className="font-mono text-gray-500 shrink-0">{v.value}M</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// IMPACT — driver decomposition of the gap (radial bars by driver share)
const GAP_DRIVERS = [
  { name: "Conflict-related supply",  value: 38, color: "#D04040" },
  { name: "Health worker shortage",   value: 27, color: "#E88B2B" },
  { name: "Displacement / access",    value: 18, color: "#6B4FA0" },
  { name: "Funding lag",              value: 11, color: "#0288D1" },
  { name: "Reporting completeness",   value:  6, color: "#2E8B57" },
];
function HealthImpactChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <h6 className="text-[11px] font-semibold text-gray-700 mb-2">Estimated driver share of bottom-5 gap</h6>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="25%"
            outerRadius="92%"
            data={GAP_DRIVERS}
            startAngle={90}
            endAngle={-270}
            barSize={9}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={4}>
              {GAP_DRIVERS.map((v) => <Cell key={v.name} fill={v.color} />)}
            </RadialBar>
            <RcTooltip
              contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
              formatter={(v) => [`${v}%`, "Driver share"]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[11px]">
        {GAP_DRIVERS.map((v) => (
          <li key={v.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: v.color }} />
              <span className="text-gray-700 truncate">{v.name}</span>
            </span>
            <span className="font-mono text-gray-500 tabular-nums shrink-0">{v.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SECTIONS_HEALTH: Section[] = [
  {
    id: "summary",
    title: "Summary",
    body: "FCS countries face a structural HNP underperformance driven by a chronic health workforce shortage (0.8 workers per 1,000 people), last-mile access gaps for remote communities, high childhood stunting rates, and recurrent emergency episodes — collectively accounting for ~37% of the global FY25 HNP pipeline shortfall.",
    bullets: [],
  },
  {
    id: "context",
    title: "The Challenge",
    body:
      "Universal health coverage in IDA-FCS countries has been roughly flat for half a decade, while the LIC average has nudged up. Conflict-affected populations are seeing service coverage erode rather than expand.",
    bullets: [
      "FCS UHC service coverage index ≈ 32/100 (vs LIC avg 49)",
      "Stunting prevalence ≈ 33.6% in FCS under-5s",
      "Health worker density ≈ 0.8 per 1,000 in FCS (WHO threshold: 4.45)",
    ],
    Chart: HealthContextChart,
  },
  {
    id: "intervention",
    title: "Pathways to Outcomes",
    body:
      "FY25 IDA-supported HNP delivery is heavily weighted toward primary care and maternal/child health. Workforce-strengthening operations remain a small share of the portfolio mix despite worker shortage being the second-largest driver of the gap.",
    bullets: [
      "Primary care expansion: 165M reached",
      "Maternal & child health: 88M reached",
      "Disease surveillance: 62M reached",
      "Nutrition: 35M reached  · Health workforce: 20M reached",
    ],
    Chart: HealthInterventionChart,
  },
  {
    id: "evidence",
    title: "Country Examples",
    body:
      "Bottom-5 country breakdown of Health Services results (FCS project data, FY2025). Each is below 50% of plan; collectively they account for ~37% of the global pipeline shortfall. Country blocks summarise representative operations.",
    bullets: [],
    countryStories: [
      {
        flag: "🇾🇪",
        name: "Yemen",
        iso: "YEM",
        body: "Emergency Health and Nutrition Project delivered HNP services to 1.2M against a 3.2M target; conflict-driven supply-chain disruption accounts for ~64% of the shortfall. UN-implemented delivery extended reach where direct IDA implementation was infeasible.",
        meta: "8 PADs · 5 ICRs",
      },
      {
        flag: "🇦🇫",
        name: "Afghanistan",
        iso: "AFG",
        body: "Sehatmandi Project absorbed catastrophic regime-change shocks via a third-party-monitored delivery model; coverage held at 44% of plan with rural retention packages keeping CHWs in highest-need districts.",
        meta: "6 PADs · 3 ICRs",
      },
      {
        flag: "🇸🇩",
        name: "Sudan",
        iso: "SDN",
        body: "Frontline health-worker payroll continuity via PFM-tagged disbursement triggers kept facilities operational through 2024 unrest. Pooled-buyer agreements with WHO covered 60% of critical medicines pipeline.",
        meta: "5 PADs · 2 ICRs",
      },
    ],
  },
  {
    id: "impact",
    title: "Lessons Learned",
    body:
      "Driver decomposition (Health Services project notes + supplementary methodology note) suggests conflict-related supply chain disruption is the single largest contributor — inputs that IDA can mitigate via shorter procurement cycles and pooled-buyer agreements with WHO.",
    lessons: [
      {
        lead: "Conflict supply chains are the dominant constraint.",
        body: "Conflict-related supply disruption explains 38% of the FY25 HNP-services gap — shorter procurement cycles and pooled-buyer agreements with WHO mitigate the bulk of it.",
      },
      {
        lead: "Workforce shortages compound the gap.",
        body: "Health-worker shortages add another 27% — frontline staff displacement and rural-retention failures show up consistently across the bottom-five countries.",
      },
      {
        lead: "Physical access is the last mile that matters.",
        body: "Displacement and access constraints account for 18% — third-party-monitored delivery and CHW retention packages held coverage where direct implementation was infeasible.",
      },
      {
        lead: "FY26 priority is clear.",
        body: "Workforce + supply chain in the five conflict states is where the next cycle's HNP dollars should land first.",
      },
    ],
    Chart: HealthImpactChart,
  },
];

const HERO_HEALTH: Hero = {
  title: "Healthier Lives",
  intro:
    "Five FCS countries — Yemen, Sudan, Afghanistan, South Sudan and Myanmar — collectively account for ~37% of the FY25 HNP pipeline shortfall, all running below 50% of plan. Across the bottom-5, conflict-driven supply-chain disruption (38%) and health-worker shortages (27%) explain the bulk of the gap.",
  metric: {
    value: "32",
    caption: "UHC service coverage index in FCS / 100 (LIC avg: 49)",
    code: "SH_UHC_SRVS_CV_XD",
  },
};

const INDICATORS_HEALTH: IndicatorRow[] = [
  { code: "CSC_RES_HEA_SERV",         label: "Health services reach",        value: "370M / 425M" },
  { code: "CSC_RES_HEA_EMER_BENE",    label: "Emergency-health beneficiaries", value: "44M" },
  { code: "SH_STA_STNT_ME_ZS",        label: "Under-5 stunting (FCS)",       value: "33.6%" },
  { code: "SH_UHC_SRVS_CV_XD",        label: "UHC index — FCS",              value: "32 / 100" },
  { code: "SH_HEA_WORK_DENS",         label: "Health workforce density",     value: "0.8 / 1k" },
];

// Resolve all the per-flow content surfaced by the panel in one place. Adding
// a new flow just requires extending detectFlow + this lookup.
const CONTENT_BY_FLOW: Record<FlowId, NarrativeContent> = {
  "africa-poverty": {
    hero: HERO_AFRICA,
    sections: SECTIONS_AFRICA,
    indicators: INDICATORS_AFRICA,
    methodology: {
      title: "Outcome Area 1 · Protection for the Poorest methodology",
      href: "https://scorecard.worldbank.org/en/narratives/protection-for-the-poorest/results-narrative",
    },
  },
  "health-gap": {
    hero: HERO_HEALTH,
    sections: SECTIONS_HEALTH,
    indicators: INDICATORS_HEALTH,
    methodology: {
      title: "Outcome Area 3 · Healthier Lives methodology",
      href: "https://scorecard.worldbank.org/en/narratives/healthier-lives/results-narrative",
    },
  },
};

function HeroImageResolved({ onRemove }: { onRemove?: () => void }) {
  const [src, setSrc] = useState("/images/story-featured.jpg");
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSrc(url);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Narrative hero" className="w-full h-44 object-cover block" />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
        >
          <IconPhoto size={13} />
          Replace image
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-black/50 hover:bg-red-600/80 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
          >
            <IconX size={13} />
            Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
    </div>
  );
}

function VisualPlaceholder({ type, onRemove }: { type: string; onRemove?: () => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1800);
    return () => clearTimeout(t);
  }, []);

  // Phase 1 — shimmer skeleton for all types while "AI is adding".
  // Uses a white-sweep overlay on a gray base so the animation is clearly
  // visible (pure gray-on-gray gradients are nearly invisible on white bg).
  if (!loaded) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
          <div className="narrative-shimmer" />
        </div>
        <div className="px-3 py-2.5 flex flex-col gap-1.5 bg-gray-50">
          <div className="relative h-2.5 rounded-full bg-gray-200 w-2/3 overflow-hidden">
            <div className="narrative-shimmer" />
          </div>
          <div className="relative h-2.5 rounded-full bg-gray-200 w-1/2 overflow-hidden">
            <div className="narrative-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // Phase 2 — resolved content
  if (type === "hero-image") return <HeroImageResolved onRemove={onRemove} />;

  if (type === "extra-chart") {
    return (
      <div className="relative group rounded-xl border border-gray-100 bg-white p-1">
        <ImpactChart />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gray-800/70 hover:bg-red-600/80 px-2 py-1 rounded-full backdrop-blur-sm"
          >
            <IconX size={11} />
            Remove
          </button>
        )}
      </div>
    );
  }

  // callout quote
  return (
    <div className="relative group">
      <blockquote className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-[13px] text-gray-600 leading-relaxed italic">
          &ldquo;Across IDA countries, the most durable results come from operations that integrated delivery channels around the same beneficiary cohort — not from parallel, single-sector programs.&rdquo;
        </p>
        <footer className="mt-2 text-[11px] text-gray-400 font-medium">— WBG Results Narrative, FY25</footer>
      </blockquote>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gray-800/70 hover:bg-red-600/80 px-2 py-1 rounded-full backdrop-blur-sm"
        >
          <IconX size={11} />
          Remove
        </button>
      )}
    </div>
  );
}

const PATHWAY_STEPS: { key: keyof Pathways; label: string; labelColor: string; dotColor: string }[] = [
  { key: "challenge",      label: "Challenge",        labelColor: "text-rose-700 bg-rose-50 border-rose-200",    dotColor: "bg-rose-400"    },
  { key: "wbgApproach",   label: "WBG Approach",     labelColor: "text-blue-700 bg-blue-50 border-blue-200",    dotColor: "bg-blue-500"    },
  { key: "outcomes",      label: "Outcomes",         labelColor: "text-emerald-700 bg-emerald-50 border-emerald-200", dotColor: "bg-emerald-500" },
  { key: "longTermImpact",label: "Long-term Impact", labelColor: "text-violet-700 bg-violet-50 border-violet-200",  dotColor: "bg-violet-500"  },
];

function PathwaysCards({ pathways }: { pathways: Pathways }) {
  return (
    <div className="flex flex-col gap-2">
      {PATHWAY_STEPS.map(({ key, label, labelColor, dotColor }, i) => (
        <div key={key} className="relative pl-5">
          {/* Connector line between steps */}
          {i < PATHWAY_STEPS.length - 1 && (
            <div className="absolute left-[7px] top-[20px] bottom-[-8px] w-px bg-gray-200" />
          )}
          {/* Step dot */}
          <div className={`absolute left-0 top-[7px] w-3.5 h-3.5 rounded-full ${dotColor} ring-2 ring-white shrink-0`} />
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border mb-1.5 ${labelColor}`}>
              {label}
            </span>
            <p className="text-[12.5px] text-gray-800 leading-relaxed">{pathways[key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Tiny SVG thumbs that mirror the VisualSupportMessage tiles in the
// conversation thread — kept inline so the panel doesn't reach back into
// ConversationView for presentation-only helpers.
function HeroImageThumbSm({ active }: { active: boolean }) {
  const sky  = active ? "#7c3aed" : "#60a5fa";
  const land = active ? "#a78bfa" : "#34d399";
  return (
    <svg viewBox="0 0 60 36" className="w-full h-full" preserveAspectRatio="none" aria-hidden>
      <rect x={0} y={0}  width={60} height={22} fill={sky}  opacity={0.5} />
      <rect x={0} y={22} width={60} height={14} fill={land} opacity={0.45} />
      <circle cx={45} cy={9} r={4} fill={active ? "#c4b5fd" : "#fde68a"} opacity={0.9} />
      <ellipse cx={14} cy={24} rx={15} ry={6} fill={active ? "#7c3aed" : "#059669"} opacity={0.45} />
      <ellipse cx={44} cy={26} rx={12} ry={5} fill={active ? "#5b21b6" : "#065f46"} opacity={0.4} />
    </svg>
  );
}
function ChartThumbSm({ active }: { active: boolean }) {
  const rows = [
    { w: 40, c: active ? "#a78bfa" : "#2E8B57" },
    { w: 32, c: active ? "#7c3aed" : "#E88B2B" },
    { w: 22, c: active ? "#a78bfa" : "#E88B2B" },
    { w: 14, c: active ? "#7c3aed" : "#D04040" },
  ];
  return (
    <svg viewBox="0 0 60 36" className="w-full h-full" preserveAspectRatio="none" aria-hidden>
      {rows.map((r, i) => {
        const y = 6 + i * 7;
        return (
          <g key={i}>
            <rect x={5} y={y} width={50} height={3} rx={1.5} fill="#e2e8f0" />
            <rect x={5} y={y} width={r.w} height={3} rx={1.5} fill={r.c} />
          </g>
        );
      })}
    </svg>
  );
}
function QuoteThumbSm({ active }: { active: boolean }) {
  const c = active ? "#7c3aed" : "#94a3b8";
  const fill = active ? "rgba(124,58,237,0.08)" : "rgba(148,163,184,0.12)";
  return (
    <svg viewBox="0 0 60 36" className="w-full h-full" preserveAspectRatio="none" aria-hidden>
      <rect x={4} y={5} width={52} height={26} rx={3} fill={fill} />
      <text x={9} y={20} fontSize="12" fill={c} opacity={0.45} fontFamily="Georgia, serif">&ldquo;</text>
      <rect x={18} y={11} width={32} height={1.5} rx={0.75} fill={c} opacity={0.3} />
      <rect x={18} y={15} width={28} height={1.5} rx={0.75} fill={c} opacity={0.3} />
      <rect x={18} y={19} width={24} height={1.5} rx={0.75} fill={c} opacity={0.3} />
      <rect x={18} y={23} width={14} height={1.5} rx={0.75} fill={c} opacity={0.2} />
    </svg>
  );
}

const ADD_VISUAL_OPTIONS = [
  { id: "hero-image",  label: "Hero image",    Thumb: HeroImageThumbSm },
  { id: "extra-chart", label: "Another chart", Thumb: ChartThumbSm     },
  { id: "callout",     label: "Callout quote", Thumb: QuoteThumbSm     },
] as const;

// Dotted-box trigger that lets the user add a visual to the current
// section without going back to the conversation thread. Clicking expands
// to a small tile picker; picking a type fires onPick(type) and collapses.
function AddVisualInline({
  sectionTitle,
  takenTypes = [],
  onPick,
}: {
  sectionTitle: string;
  takenTypes?: string[];
  onPick: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className="mt-1">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-gray-300 bg-white text-[12px] font-medium text-gray-500 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50/40 transition-colors"
          aria-label={`Add visual to ${sectionTitle}`}
        >
          <IconPlus size={13} />
          Add visual
        </button>
      ) : (
        <div className="rounded-lg border border-dashed border-violet-300 bg-violet-50/30 p-2.5">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-violet-700">
              Add to {sectionTitle}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700"
              aria-label="Cancel"
            >
              <IconX size={12} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {ADD_VISUAL_OPTIONS.map(({ id, label, Thumb }) => {
              const disabled = takenTypes.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onPick(id); setOpen(false); }}
                  className={
                    "flex flex-col items-stretch text-left p-1.5 rounded-md border transition-colors " +
                    (disabled
                      ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                      : "bg-white border-gray-200 hover:border-violet-400 hover:bg-violet-50 cursor-pointer")
                  }
                >
                  <div className="h-9 rounded-sm overflow-hidden bg-gray-50 flex items-center justify-center">
                    <Thumb active={false} />
                  </div>
                  <span className="mt-1 text-[10.5px] font-semibold text-gray-700 leading-snug px-0.5">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Accordion({
  section,
  open,
  onToggle,
  enterDelay,
  geography,
  sectionVisuals = [],
  onRemoveVisual,
  onAddVisual,
  chartRemoved,
  onRemoveChart,
  isDragOver,
  isModifying,
  bodyOverride,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: {
  section: Section;
  open: boolean;
  onToggle: () => void;
  /** Optional CSS animation-delay (e.g. "120ms") applied to the
   * narrative-content-enter animation so accordions cascade in. */
  enterDelay?: string;
  /** Geography UI rendered above the chart in the Country Examples
   *  section. Null for all other sections. */
  geography?: React.ReactNode;
  sectionVisuals?: AddedVisual[];
  onRemoveVisual?: (id: string) => void;
  onAddVisual?: (type: string) => void;
  /** When true, the section's AI-baked Chart has been removed by the
   *  user; the accordion skips rendering it. */
  chartRemoved?: boolean;
  /** Called when the user clicks the Remove pill on the AI-baked chart. */
  onRemoveChart?: () => void;
  isDragOver?: boolean;
  isModifying?: boolean;
  bodyOverride?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      data-anchor={section.id}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`border-b border-gray-100 last:border-b-0 scroll-mt-12 narrative-content-enter transition-colors ${
        isDragOver ? "bg-blue-50/60 ring-2 ring-inset ring-blue-300" : "bg-gray-50"
      }`}
      style={enterDelay ? { animationDelay: enterDelay } : undefined}
    >
      <div className="flex items-stretch">
        {/* Drag handle — the only draggable element; keeps text inside
            the accordion body freely selectable. */}
        <div
          draggable
          onDragStart={onDragStart}
          className="flex items-center px-3 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors shrink-0 select-none"
          aria-hidden
        >
          <IconGripVertical size={15} />
        </div>
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between pr-5 py-3 text-left hover:bg-gray-100 transition-colors"
          aria-expanded={open}
        >
          <span className="text-[13.5px] font-semibold text-gray-900">{section.title}</span>
          <IconChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && (
        <div className="px-5 pb-4 pt-2 flex flex-col gap-3 bg-white border-t border-gray-100">
          {section.pathways ? (
            <PathwaysCards pathways={section.pathways} />
          ) : (
            <>
              {isModifying ? (
                <div className="flex flex-col gap-2 py-1" aria-busy="true" aria-label="Updating section">
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "100%" }} />
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "92%" }} />
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "85%" }} />
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "62%" }} />
                </div>
              ) : (
                <p className="text-[13px] text-gray-700 leading-relaxed">{bodyOverride ?? section.body}</p>
              )}
              {geography}
              {section.Chart && !chartRemoved && (
                <div className="relative group">
                  <section.Chart />
                  {onRemoveChart && (
                    <button
                      type="button"
                      onClick={onRemoveChart}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gray-800/70 hover:bg-red-600/80 px-2 py-1 rounded-full backdrop-blur-sm"
                      aria-label="Remove chart"
                    >
                      <IconX size={11} />
                      Remove
                    </button>
                  )}
                </div>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="flex flex-col gap-1.5 pl-4 list-disc text-[12.5px] text-gray-600">
                  {section.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
              {section.lessons && section.lessons.length > 0 && (
                <ol className="flex flex-col gap-3 mt-1">
                  {section.lessons.map((l, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold flex items-center justify-center tabular-nums"
                      >
                        {i + 1}
                      </span>
                      <p className="flex-1 text-[12.5px] text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">{l.lead}</span>{" "}
                        {l.body}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
          {section.countryStories && section.countryStories.length > 0 && (
            <ul className="flex flex-col gap-2 mt-1">
              {section.countryStories.map((s) => (
                <li
                  key={s.iso ?? s.name}
                  className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2.5"
                >
                  <span className="text-[20px] leading-none shrink-0" aria-hidden>
                    {s.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-gray-900">
                        {s.name}
                      </span>
                      {s.meta && (
                        <span className="text-[10.5px] text-gray-400 font-mono shrink-0">
                          {s.meta}
                        </span>
                      )}
                    </div>
                    {/* Body text + per-country locator map. Map sits on the
                        right (fixed width) so the prose flows naturally on
                        the left; on narrow viewports the column wraps under
                        the text. */}
                    <div className="mt-1 flex items-start gap-3 flex-wrap">
                      <p className="text-[12.5px] text-gray-700 leading-relaxed flex-1 min-w-[180px]">
                        {s.body}
                      </p>
                      <div className="w-[140px] h-[88px] shrink-0">
                        <CountryLocatorMap name={s.name} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {sectionVisuals.map((v) => (
            <VisualPlaceholder key={v.id} type={v.type} onRemove={() => onRemoveVisual?.(v.id)} />
          ))}
          {onAddVisual && (
            <AddVisualInline
              sectionTitle={section.title}
              takenTypes={sectionVisuals.map((v) => v.type)}
              onPick={(type) => onAddVisual(type)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Hero block — outcome title + intro + headline metric.
function NarrativeHero({ hero }: { hero: Hero }) {
  return (
    <section
      data-anchor="hero"
      className="flex flex-col gap-3 scroll-mt-12 narrative-content-enter pb-4"
    >
      <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
        {hero.title}
      </h2>
      <p className="text-[13px] text-gray-700 leading-relaxed">{hero.intro}</p>
      <div className="mt-1 flex items-end gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[28px] font-bold text-gray-900 leading-none tabular-nums">
            {hero.metric.value}
          </span>
          <span className="mt-2 text-[10.5px] font-mono text-gray-400">
            {hero.metric.code}
          </span>
        </div>
        <p className="flex-1 text-[12px] text-gray-600 leading-relaxed pb-0.5">
          {hero.metric.caption}
        </p>
      </div>
    </section>
  );
}

// Related Indicators — a compact stat list rendered after the accordions.
function RelatedIndicators({ rows }: { rows: IndicatorRow[] }) {
  return (
    <section
      data-anchor="indicators"
      className="flex flex-col gap-2 scroll-mt-12 narrative-content-enter"
    >
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Related indicators
      </h3>
      <ul className="flex flex-col rounded-lg border border-gray-200 overflow-hidden">
        {rows.map((r, i) => (
          <li
            key={r.code}
            className={
              "flex items-baseline justify-between gap-3 px-3 py-2 bg-white" +
              (i < rows.length - 1 ? " border-b border-gray-100" : "")
            }
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] text-gray-800 truncate">{r.label}</span>
              <span className="text-[10px] font-mono text-gray-400 truncate">{r.code}</span>
            </div>
            <span className="text-[12.5px] font-semibold text-gray-900 tabular-nums shrink-0">
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Methodology footer — link to the corresponding scorecard page.
function MethodologyFootnote({ title, href }: { title: string; href: string }) {
  return (
    <section
      data-anchor="methodology"
      className="flex flex-col gap-1 scroll-mt-12 narrative-content-enter text-[11px] text-gray-500"
    >
      <span className="font-semibold uppercase tracking-wider text-gray-400">
        Methodology
      </span>
      <p>
        Indicator definitions and computation rules come from the World Bank
        Scorecard methodology note. Source figures: IDA Results data ·
        FY2025 (Time_Period == 2025-06-30).
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start mt-1 text-violet-600 hover:text-violet-700 underline"
      >
        {title} ↗
      </a>
    </section>
  );
}

// ─── Narrative-generation loading state ─────────────────────────────────────
// Two-phase loader: first shows agentic reasoning steps appearing one by
// one (so the user reads "what the AI is doing"), then transitions to a
// skeleton with an animated geography placeholder while final content is
// "drafted." Total feel ~2.5s before real content lands.

interface ReasoningStep {
  label: string;
  detail?: string;
}

const REASONING_STEPS: Record<FlowId, ReasoningStep[]> = {
  "africa-poverty": [
    { label: "Reading conversation context",          detail: "1 prompt · IDA · poverty signal" },
    { label: "Indexing relevant indicators",          detail: "7 Results indicators matched" },
    { label: "Determining regional scope",            detail: "Sub-Saharan Africa (AFE + AFW)" },
    { label: "Pulling FY25 portfolio aggregates",     detail: "Time_Period == 2025-06-30" },
    { label: "Cross-referencing context indicators",  detail: "5 Client Context series paired" },
    { label: "Drafting structured narrative sections",detail: "The Challenge · Pathways to Outcomes · Country Examples · Lessons Learned" },
  ],
  "health-gap": [
    { label: "Reading conversation context",          detail: "1 prompt · health · FCS" },
    { label: "Filtering to FCV-flagged projects",     detail: "874 projects in fragile/conflict states" },
    { label: "Computing achievement ratios per country", detail: "Achieved vs. target by country" },
    { label: "Ranking bottom-5 performers",           detail: "5 countries below 50% of plan" },
    { label: "Decomposing gap by driver",             detail: "Conflict supply · workforce · access" },
    { label: "Drafting structured narrative sections",detail: "The Challenge · Pathways to Outcomes · Country Examples · Lessons Learned" },
  ],
};

function NarrativeReasoning({ flow }: { flow: FlowId }) {
  const steps = REASONING_STEPS[flow];
  // Reveal one step every ~360ms — slow enough that the user can read
  // each line. Final tick advances past the last step (so all rows show
  // their checkmark) before the parent flips to the skeleton phase.
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i >= steps.length ? i : i + 1));
    }, 360);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="px-5 py-6 flex flex-col gap-4" aria-busy="true">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
          <IconSparkles size={13} className="text-blue-600 animate-pulse" />
        </span>
        <span className="text-[12.5px] font-semibold text-gray-700">
          Generating narrative
        </span>
      </div>

      <ol className="flex flex-col gap-2.5 relative pl-5">
        {/* Connector line — sits behind the marker icons */}
        <span
          aria-hidden
          className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-gray-200"
        />
        {steps.map((step, i) => {
          const done    = i < activeIdx;
          const active  = i === activeIdx;
          const pending = i > activeIdx;
          return (
            <li
              key={i}
              className="relative flex items-start gap-2 transition-all duration-300 ease-out"
              style={{
                opacity: pending ? 0.3 : 1,
                transform: pending ? "translateX(-4px)" : "translateX(0)",
              }}
            >
              {/* Marker — sits on the connector line */}
              <span
                aria-hidden
                className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-white border ${
                  done    ? "border-emerald-500" :
                  active  ? "border-blue-500"   : "border-gray-300"
                }`}
              >
                {done ? (
                  <IconCheck size={9} className="text-emerald-600" stroke={3} />
                ) : active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                )}
              </span>
              <div className="flex-1 min-w-0 pl-1">
                <div className={`text-[12.5px] leading-snug transition-colors ${
                  done   ? "text-gray-700" :
                  active ? "text-gray-900 font-medium" : "text-gray-400"
                }`}>
                  {step.label}
                  {active && (
                    <span className="inline-block w-1 ml-1 stream-cursor">·</span>
                  )}
                </div>
                {step.detail && !pending && (
                  <div className="mt-0.5 text-[10.5px] text-gray-500 font-mono leading-snug">
                    → {step.detail}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Skeleton phase ─────────────────────────────────────────────────────────
// Comes after reasoning. Geography slot gets the animated globe + orbital
// dots; everything else falls back to standard pulsing skeleton bars.

const NARRATIVE_LOADING_STAGES = [
  "Mapping geographic scope",
  "Pulling FY25 portfolio data",
  "Drafting The Challenge · Pathways to Outcomes · Country Examples · Lessons Learned",
  "Finalizing summary",
];

function GeographyLoader() {
  // Cycle the status copy so the loader feels active even though it's only
  // a brief placeholder. Stage interval is faster than the actual mock
  // generation timeout so the user sees at least 2–3 messages.
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setStage((s) => (s + 1) % NARRATIVE_LOADING_STAGES.length),
      650
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/40 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center"
      style={{ aspectRatio: "2 / 1" }}
      aria-label="Generating geography"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 z-10">
        {/* Globe + orbiting dots */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <IconWorld
            size={44}
            className="text-gray-300"
            stroke={1.5}
          />
          {/* Six dots evenly spaced around the globe; staggered animation
              delays make them pulse in sequence (clockwise sweep). */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <span
              key={deg}
              className="geography-orbit-dot absolute w-1.5 h-1.5 rounded-full bg-emerald-500"
              style={{
                top: "50%",
                left: "50%",
                marginTop: -3,
                marginLeft: -3,
                transform: `rotate(${deg}deg) translateY(-30px)`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div className="text-[10.5px] text-gray-500 font-mono tabular-nums tracking-tight transition-opacity duration-300">
          {NARRATIVE_LOADING_STAGES[stage]}
          <span className="inline-block w-2 ml-0.5 stream-cursor">·</span>
        </div>
      </div>

      {/* Light shimmer sweeping across the placeholder map area */}
      <div className="narrative-shimmer" />
    </div>
  );
}

function SkelBar({ width = "100%", height = 10, className = "" }: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}

function NarrativeLoading() {
  return (
    <div className="px-5 py-5 flex flex-col gap-5" aria-busy="true">
      {/* Summary — leads, mirrors the real content order */}
      <section className="flex flex-col gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Summary
        </h3>
        <div className="flex flex-col gap-2">
          <SkelBar width="100%" />
          <SkelBar width="95%" />
          <SkelBar width="88%" />
          <SkelBar width="60%" />
        </div>
      </section>

      {/* Geography */}
      <section className="flex flex-col gap-2.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <IconMapPin size={12} className="text-gray-400" />
          Geography in scope
        </h3>
        <GeographyLoader />

        {/* Region tile placeholders */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 p-2 rounded-md border border-gray-100 bg-white"
              >
                <SkelBar width="40%" height={6} />
                <SkelBar width="80%" height={8} />
                <SkelBar width="50%" height={12} className="mt-0.5" />
                <SkelBar width="100%" height={3} className="mt-1" />
              </div>
            ))}
          </div>
          {/* Live readout placeholder */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <SkelBar width={28} height={8} />
              <SkelBar width={120} height={10} />
            </div>
            <SkelBar width={80} height={20} />
            <SkelBar width="100%" height={6} />
            <SkelBar width="55%" height={8} />
          </div>
        </div>
      </section>

      {/* Accordions — collapsed skeletons */}
      <section className="flex flex-col -mx-5">
        {["The Challenge", "Pathways to Outcomes", "Country Examples", "Lessons Learned"].map((title, i) => (
          <div
            key={title}
            className="bg-gray-50 border-b border-gray-100 last:border-b-0 px-5 py-3 flex items-center justify-between"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <span className="text-[13.5px] font-semibold text-gray-300 animate-pulse">
              {title}
            </span>
            <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </section>
    </div>
  );
}

// ─── Scroll-linked stepper ───────────────────────────────────────────────────
// Vertically-centered dot column floating on the panel's right edge. The
// active step grows + reveals its label; inactive dots stay subtle. Hover
// previews the label without changing the active step. Fades in only after
// the user has begun scrolling so it feels reactive instead of permanent
// chrome.
function ScrollStepper({
  anchors,
  activeId,
  visible,
  onJump,
}: {
  anchors: { id: string; label: string }[];
  activeId: string;
  visible: boolean;
  onJump: (id: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const activeIdx = Math.max(0, anchors.findIndex((a) => a.id === activeId));

  return (
    <div
      aria-label="Section navigation"
      className={`absolute top-1/2 right-2 -translate-y-1/2 z-30 flex flex-col items-end gap-3 py-2 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-1 pointer-events-none"
      }`}
    >
      {/* Connector line behind the dots */}
      <span
        aria-hidden
        className="absolute right-[7px] top-3 bottom-3 w-px bg-gray-200"
      />

      {anchors.map((a, i) => {
        const isActive = i === activeIdx;
        const isPast   = i < activeIdx;
        const isHover  = hover === a.id;
        const showLabel = isActive || isHover;
        return (
          // Button is just the dot — its hit area is bounded to a tight
          // 16×16 square so the label area on the left doesn't catch
          // hovers and block content underneath. The label is positioned
          // absolutely to the left with pointer-events-none.
          <button
            key={a.id}
            onClick={() => onJump(a.id)}
            onMouseEnter={() => setHover(a.id)}
            onMouseLeave={() => setHover(null)}
            aria-label={`Jump to ${a.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex items-center justify-center cursor-pointer w-4 h-4"
          >
            <span
              aria-hidden
              className={`absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 text-[10.5px] font-medium whitespace-nowrap transition-opacity duration-300 px-2 py-0.5 rounded-md pointer-events-none ${
                showLabel ? "opacity-100" : "opacity-0"
              } ${
                isActive
                  ? "text-gray-900 font-semibold bg-white shadow-sm border border-gray-200"
                  : "text-gray-600 bg-white/95 border border-gray-150"
              }`}
            >
              {a.label}
            </span>
            <span
              className={`shrink-0 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-2.5 h-2.5 bg-gray-900 ring-4 ring-gray-100"
                  : isPast
                    ? "w-1.5 h-1.5 bg-gray-400 group-hover:bg-gray-700"
                    : "w-1.5 h-1.5 bg-gray-300 group-hover:bg-gray-500"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export default function NarrativePanel({ open, prompt, onClose, width, onResize, onGenerate, loading, generatedKinds = [], skeletonId = null, extraCountryApplied = false, addedVisuals = [], onRemoveVisual, onAddVisual, onModifyContent, contentModifySignal }: Props) {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const flow = useMemo(() => detectFlow(prompt), [prompt]);
  const content = CONTENT_BY_FLOW[flow];
  const { hero, indicators, methodology } = content;
  // When a skeleton is selected, the Country Examples section is rebuilt
  // from the skeleton's own countryExamples (so the countries match the
  // chosen angle exactly — no leftover Kenya/Niger/etc. from the static
  // SECTIONS_* arrays). The extraCountryExample is appended when the user
  // has applied the post-draft "add one more country example" refinement.
  // Falls back to the base sections when no skeleton is selected.
  const sections = useMemo(() => {
    if (!skeletonId) return content.sections;
    const skeleton = FLOW_SKELETONS[flow].find((s) => s.id === skeletonId);
    if (!skeleton) return content.sections;

    // Always patch pathways to outcomes from the chosen skeleton angle.
    let patched = content.sections.map((s) =>
      s.id === "intervention" ? { ...s, pathways: skeleton.pathways } : s,
    );

    // Replace the evidence section's countryStories with the skeleton's
    // own examples (description → body) so the panel reflects the chosen
    // angle's actual countries. Append the extra country when refined.
    const baseExamples = skeleton.countryExamples.map<CountryStory>((c) => ({
      flag: c.flag,
      name: c.name,
      iso: c.name.toUpperCase().slice(0, 3),
      body: c.description,
    }));
    const skeletonStories: CountryStory[] =
      extraCountryApplied && skeleton.extraCountryExample
        ? [
            ...baseExamples,
            {
              flag: skeleton.extraCountryExample.flag,
              name: skeleton.extraCountryExample.name,
              iso: skeleton.extraCountryExample.name.toUpperCase().slice(0, 3),
              body: skeleton.extraCountryExample.description,
            },
          ]
        : baseExamples;
    patched = patched.map((s) =>
      s.id === "evidence" ? { ...s, countryStories: skeletonStories } : s,
    );

    return patched;
  }, [content.sections, extraCountryApplied, skeletonId, flow]);
  // Scroll-linked stepper: tracks the section currently in view and which
  // accordions are open. The stepper fades in once the user begins scrolling
  // so it feels reactive rather than chrome.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [activeAnchor, setActiveAnchor] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // ── Section drag-to-reorder state ──────────────────────────────────────
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => sections.map(s => s.id));
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceIdRef = useRef<string | null>(null);

  // ── Content-modify state ────────────────────────────────────────────────
  const [sectionBodyOverrides, setSectionBodyOverrides] = useState<Record<string, string>>({});
  const [modifyingSectionId, setModifyingSectionId] = useState<string | null>(null);

  // ── Chart removal — tracks which AI-baked charts the user has dismissed.
  // Keyed by section.id; once removed, the Accordion skips rendering its
  // Chart. State is per-panel so it persists across accordion open/close
  // cycles within the same conversation.
  const [removedCharts, setRemovedCharts] = useState<Set<string>>(new Set());
  const removeChart = (sectionId: string) =>
    setRemovedCharts((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });

  // Keep sectionOrder in sync when the sections list changes (flow switch or
  // extraCountryApplied). Preserves any manual reorder the user made.
  useEffect(() => {
    setSectionOrder(prev => {
      const newIds = sections.map(s => s.id);
      const ordered = prev.filter(id => newIds.includes(id));
      const added = newIds.filter(id => !ordered.includes(id));
      return [...ordered, ...added];
    });
  }, [sections]);

  const orderedSections = useMemo(
    () => sectionOrder.map(id => sections.find(s => s.id === id)).filter((s): s is Section => !!s),
    [sectionOrder, sections],
  );

  // Anchor order: hero leads the document, sections follow, related
  // indicators + methodology close it out.
  const anchors = useMemo(
    () => [
      { id: "hero", label: "Overview" },
      ...orderedSections.map((s) => ({ id: s.id, label: s.title })),
      { id: "methodology", label: "Methodology" },
    ],
    [orderedSections]
  );

  // Two-phase loader. When `loading` flips true we start in the "reasoning"
  // phase (~2.5s, long enough for the user to read each step), then move
  // to "skeleton" (~1.5s) before the real content mounts. When loading
  // flips false we land directly in "ready".
  const [loadPhase, setLoadPhase] = useState<"reasoning" | "skeleton" | "ready">("ready");
  useEffect(() => {
    if (!loading) { setLoadPhase("ready"); return; }
    setLoadPhase("reasoning");
    const t = window.setTimeout(() => setLoadPhase("skeleton"), 2500);
    return () => window.clearTimeout(t);
  }, [loading]);

  // Expand the first accordion as soon as the draft narrative mounts so
  // the user lands on visible content rather than a stack of collapsed
  // headers. Re-runs when the flow changes (different sections list).
  useEffect(() => {
    if (loadPhase !== "ready") return;
    const first = sections[0]?.id;
    if (!first) return;
    setOpenSections((prev) => (prev.has(first) ? prev : new Set(prev).add(first)));
  }, [loadPhase, sections]);

  // When a new visual is added, open its target accordion and scroll to it
  // so the shimmer is immediately visible. Using a short timeout instead of
  // rAF because setOpenSections triggers a re-render that needs to complete
  // (and paint) before the accordion DOM node exists to scroll to.
  const prevVisualCountRef = useRef(addedVisuals.length);
  useEffect(() => {
    if (addedVisuals.length <= prevVisualCountRef.current) return;
    prevVisualCountRef.current = addedVisuals.length;
    const latest = addedVisuals[addedVisuals.length - 1];
    const match = sections.find((s) => s.title === latest.section);
    if (!match) return;
    setOpenSections((prev) =>
      prev.has(match.id) ? prev : new Set([...prev, match.id])
    );
    const t = setTimeout(() => {
      const node = bodyRef.current?.querySelector(`[data-anchor="${match.id}"]`);
      if (node) (node as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, [addedVisuals, sections]);
  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const scrollToAnchor = (id: string) => {
    // Open the accordion first so its body is laid out before we scroll.
    if (sections.some((s) => s.id === id)) {
      setOpenSections((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
    setActiveAnchor(id);
    requestAnimationFrame(() => {
      const node = bodyRef.current?.querySelector(`[data-anchor="${id}"]`);
      if (node) (node as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Track which section is in view to drive the stepper's active dot.
  // rootMargin biases toward the upper portion of the panel so a section
  // becomes active just as its heading enters view.
  useEffect(() => {
    if (!open) return;
    const root = bodyRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-anchor]");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.offsetTop - b.offsetTop);
        const id = visible[0]?.getAttribute("data-anchor");
        if (id) setActiveAnchor(id);
      },
      { root, rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [open, anchors]);

  // Fade the stepper in once the user starts scrolling. Resets when the
  // panel is closed so the next open feels fresh.
  useEffect(() => {
    if (!open) { setScrolled(false); return; }
    const root = bodyRef.current;
    if (!root) return;
    const onScroll = () => setScrolled(root.scrollTop > 24);
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [open]);

  // ── Highlight-to-modify ──────────────────────────────────────────────
  // When the user selects text inside the draft body, surface a small
  // "Modify this" pill anchored to the selection. Click clears the menu
  // (deeper integration — actually rewriting the passage — is a later
  // step; this commits to the gesture).
  const [selectionAnchor, setSelectionAnchor] = useState<
    { top: number; left: number; text: string; sectionId: string | null } | null
  >(null);

  useEffect(() => {
    if (!open) { setSelectionAnchor(null); return; }
    const root = bodyRef.current;
    if (!root) return;
    const compute = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelectionAnchor(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) {
        setSelectionAnchor(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) { setSelectionAnchor(null); return; }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setSelectionAnchor(null);
        return;
      }
      const anchorNode = range.commonAncestorContainer;
      const anchorEl =
        (anchorNode instanceof Element ? anchorNode : anchorNode.parentElement)
          ?.closest("[data-anchor]");
      const sectionId = anchorEl?.getAttribute("data-anchor") ?? null;
      setSelectionAnchor({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        text,
        sectionId,
      });
    };
    const onMouseUp = () => window.setTimeout(compute, 0);
    const onScroll = () => setSelectionAnchor(null);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", compute);
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", compute);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const dismissSelectionMenu = () => {
    window.getSelection()?.removeAllRanges();
    setSelectionAnchor(null);
  };

  // When the parent fires a contentModifySignal, show a violet skeleton in
  // the target section for ~2.2s, then resolve to a lightly-modified body.
  useEffect(() => {
    if (!contentModifySignal) return;
    const { sectionId, instruction, nonce } = contentModifySignal;
    void nonce;
    setModifyingSectionId(sectionId);
    const t = setTimeout(() => {
      setModifyingSectionId(null);
      if (sectionId) {
        const sec = sections.find(s => s.id === sectionId);
        const original = sec?.body ?? "";
        setSectionBodyOverrides(prev => ({
          ...prev,
          [sectionId]: instruction
            ? `${original} Updated to reflect: ${instruction.charAt(0).toUpperCase() + instruction.slice(1)}${instruction.endsWith(".") ? "" : "."}`
            : original,
        }));
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [contentModifySignal, sections]);

  // ── Section drag-to-reorder handlers ───────────────────────────────────
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    dragSourceIdRef.current = sectionId;
    e.dataTransfer.effectAllowed = "move";
    // Use the full accordion row as the drag ghost image.
    const row = (e.currentTarget as HTMLElement).closest("[data-anchor]");
    if (row) e.dataTransfer.setDragImage(row, 24, 20);
  };
  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== sectionId) setDragOverId(sectionId);
  };
  const handleSectionDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragSourceIdRef.current;
    dragSourceIdRef.current = null;
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) return;
    setSectionOrder(prev => {
      const next = [...prev];
      const fromIdx = next.indexOf(sourceId);
      const toIdx = next.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, sourceId);
      return next;
    });
  };
  const handleSectionDragEnd = () => {
    dragSourceIdRef.current = null;
    setDragOverId(null);
  };

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
          aria-label="Resize panel"
          role="separator"
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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
            <IconNotebook size={15} className="text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Draft</span>
            <span className="text-[14px] font-semibold text-gray-900 leading-none">Narrative</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Close panel"
        >
          <IconX size={16} />
        </button>
      </header>

      {/* Scroll-linked stepper — vertically centered on the panel edge. Fades
          in once the user scrolls; the active dot expands to reveal its
          section label. Hidden while loading (no sections to anchor yet). */}
      <ScrollStepper
        anchors={anchors}
        activeId={activeAnchor}
        visible={scrolled && loadPhase === "ready"}
        onJump={scrollToAnchor}
      />

      {/* Body — beam lives here so it appears below the "Draft Narrative" header */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {(loadPhase === "reasoning" || loadPhase === "skeleton") && (
          <>
            <div
              aria-hidden
              className="prompt-stroke absolute left-0 right-0 pointer-events-none"
              style={{ top: 0, height: 3, zIndex: 65 }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute overflow-hidden"
              style={{ top: 0, left: 0, right: 0, height: 300, zIndex: 64 }}
            >
              <div
                className="prompt-beam absolute"
                style={{
                  top: 0,
                  left: "50%",
                  width: "min(900px, 200%)",
                  height: 240,
                  transform: "translateX(-50%)",
                  borderRadius: "50%",
                }}
              />
            </div>
          </>
        )}

        <div ref={bodyRef} className="flex-1 overflow-y-auto scrollbar-auto-hide">
        {loadPhase === "reasoning" ? (
          <NarrativeReasoning flow={flow} />
        ) : loadPhase === "skeleton" ? (
          <NarrativeLoading />
        ) : (
        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Hero — outcome title + intro + headline metric */}
          <NarrativeHero hero={hero} />

          {/* Accordions — each cascades in after the hero lands. The
              Country Examples section gets a Geography block (WorldMap +
              region tiles) rendered above its chart, plus a list of
              named country case-study blocks below. */}
          <section className="flex flex-col -mx-5">
            {orderedSections.map((s, i) => (
              <Accordion
                key={s.id}
                section={s}
                open={openSections.has(s.id)}
                onToggle={() => toggleSection(s.id)}
                enterDelay={`${260 + i * 70}ms`}
                sectionVisuals={addedVisuals.filter(v => v.section === s.title)}
                onRemoveVisual={onRemoveVisual}
                onAddVisual={
                  onAddVisual
                    ? (type) =>
                        onAddVisual({
                          id: `${type}-${Date.now()}`,
                          type,
                          section: s.title,
                        })
                    : undefined
                }
                chartRemoved={removedCharts.has(s.id)}
                onRemoveChart={() => removeChart(s.id)}
                isDragOver={dragOverId === s.id}
                isModifying={modifyingSectionId === s.id}
                bodyOverride={sectionBodyOverrides[s.id]}
                onDragStart={(e) => handleSectionDragStart(e, s.id)}
                onDragOver={(e) => handleSectionDragOver(e, s.id)}
                onDragLeave={() => setDragOverId(null)}
                onDragEnd={handleSectionDragEnd}
                onDrop={(e) => handleSectionDrop(e, s.id)}
              />
            ))}
          </section>

          {/* Methodology footer */}
          <MethodologyFootnote title={methodology.title} href={methodology.href} />
        </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <NarrativeFooter onGenerate={onGenerate} generatedKinds={generatedKinds} />

      {/* Selection-driven contextual menu. Rendered via portal so that
          position:fixed works relative to the viewport — the aside's
          transform would otherwise create a new containing block. */}
      {selectionAnchor && typeof document !== "undefined" && createPortal(
        <div
          role="menu"
          style={{
            position: "fixed",
            top: selectionAnchor.top,
            left: selectionAnchor.left,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
          }}
          className="pointer-events-auto"
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onModifyContent?.({ text: selectionAnchor.text, sectionId: selectionAnchor.sectionId });
              setSelectionAnchor(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white text-[12px] font-medium shadow-lg ring-1 ring-black/10 hover:bg-gray-800 transition-colors"
          >
            <IconSparkles size={12} />
            Modify content
          </button>
        </div>,
        document.body
      )}
    </aside>
  );
}

// ─── Footer with Generate menu ───────────────────────────────────────────────

const GENERATE_OPTIONS = [
  { id: "infographic", label: "Infographic",  desc: "Single-page visual summary",   icon: IconInfographic },
  { id: "powerpoint",      label: "PowerPoint deck",   desc: "Editable slides for briefings", icon: IconPresentationAnalytics },
  { id: "word",            label: "Word document",     desc: "Long-form narrative document",   icon: IconFileTypeDoc },
] as const;

function NarrativeFooter({
  onGenerate,
  generatedKinds = [],
}: {
  onGenerate?: (kind: string) => void;
  generatedKinds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const pick = (id: string) => { setOpen(false); onGenerate?.(id); };

  return (
    <footer className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50">
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <IconWand size={14} />
          Generate
          {open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 right-0 bottom-[calc(100%+8px)] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-10"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Generate as
              </span>
            </div>
            <ul>
              {GENERATE_OPTIONS.map((o, i) => {
                const Icon = o.icon;
                const generated = generatedKinds.includes(o.id);
                return (
                  <li key={o.id}>
                    <button
                      role="menuitem"
                      onClick={() => pick(o.id)}
                      className={`w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors ${
                        i < GENERATE_OPTIONS.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        generated ? "bg-emerald-50" : "bg-blue-50"
                      }`}>
                        <Icon size={14} className={generated ? "text-emerald-600" : "text-blue-600"} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-900">
                          {o.label}
                          {generated && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Generated
                            </span>
                          )}
                        </span>
                        <span className="block text-[10.5px] text-gray-500 mt-0.5">
                          {generated ? "Click to regenerate (replaces existing)" : o.desc}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

    </footer>
  );
}

