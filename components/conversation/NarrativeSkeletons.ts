// components/conversation/NarrativeSkeletons.ts
//
// Per-flow 4-angle skeleton data shown in the skeleton-ready phase of the
// narrative-creation flow. Each angle is one analytical framing the user can
// pick. Mirrors the FLOW_CONTENT pattern in ConversationView.tsx.

import type { FlowId } from "./ConversationView";

export type SkeletonMarker = "I" | "II" | "III" | "IV";

export interface NarrativeSkeleton {
  id: string;
  marker: SkeletonMarker;
  title: string;
  challengeTeaser: string;
  countryExamples: [string, string];
  sourceCounts: { pads: number; isrs: number; icrs: number };
}

export type NarrativeSkeletonSet = readonly [
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
];

export const FLOW_SKELETONS: Record<FlowId, NarrativeSkeletonSet> = {
  "africa-poverty": [
    {
      id: "africa-poverty-climate-safety-nets",
      marker: "I",
      title: "Climate Shocks & Social Safety Nets",
      challengeTeaser:
        "Recurrent droughts and floods erode household resilience faster than recovery transfers can scale, leaving the poorest exposed to repeated shocks.",
      countryExamples: ["Ethiopia", "Niger"],
      sourceCounts: { pads: 11, isrs: 8, icrs: 3 },
    },
    {
      id: "africa-poverty-learning-teacher-capacity",
      marker: "II",
      title: "Learning Poverty & Teacher Capacity",
      challengeTeaser:
        "70% of primary-age children cannot read a simple passage, while a teaching workforce trained in outdated, theoretical methods perpetuates the gap.",
      countryExamples: ["Madagascar", "Kenya"],
      sourceCounts: { pads: 9, isrs: 7, icrs: 4 },
    },
    {
      id: "africa-poverty-fiscal-space-revenue",
      marker: "III",
      title: "Fiscal Space & Domestic Revenue",
      challengeTeaser:
        "56 economies collect less than 15% tax-to-GDP, limiting public investment in human capital and basic services even as poverty deepens.",
      countryExamples: ["Sierra Leone", "Rwanda"],
      sourceCounts: { pads: 8, isrs: 6, icrs: 2 },
    },
    {
      id: "africa-poverty-fragility-displacement",
      marker: "IV",
      title: "Fragility, Conflict & Displacement",
      challengeTeaser:
        "Extreme poverty is now concentrated in FCS contexts where conflict destroys services and forced displacement disrupts livelihoods for years.",
      countryExamples: ["South Sudan", "Yemen"],
      sourceCounts: { pads: 12, isrs: 9, icrs: 5 },
    },
  ],
  "health-gap": [
    {
      id: "health-gap-workforce-density",
      marker: "I",
      title: "Health Workforce Density in FCS",
      challengeTeaser:
        "FCS countries average 0.8 health workers per 1,000 people — a quarter of WHO's threshold for basic service delivery and the binding constraint on coverage.",
      countryExamples: ["Yemen", "Afghanistan"],
      sourceCounts: { pads: 10, isrs: 8, icrs: 4 },
    },
    {
      id: "health-gap-primary-care-last-mile",
      marker: "II",
      title: "Primary-Care Access at the Last Mile",
      challengeTeaser:
        "Remote and pastoralist communities sit beyond functional referral catchments, so even funded clinics fail to convert into service contacts.",
      countryExamples: ["Mozambique", "Sudan"],
      sourceCounts: { pads: 9, isrs: 7, icrs: 3 },
    },
    {
      id: "health-gap-stunting-nutrition",
      marker: "III",
      title: "Stunting & Nutrition in Children Under-5",
      challengeTeaser:
        "Under-5 stunting in FCS sits at 33.6% — locking in cognitive and economic losses that no later-life intervention can fully reverse.",
      countryExamples: ["Pakistan", "Bangladesh"],
      sourceCounts: { pads: 8, isrs: 6, icrs: 4 },
    },
    {
      id: "health-gap-emergency-response",
      marker: "IV",
      title: "Emergency Health Response Capacity",
      challengeTeaser:
        "Recurrent disease outbreaks and crisis episodes overwhelm fragile health systems, eroding the gains made during stable years.",
      countryExamples: ["Myanmar", "South Sudan"],
      sourceCounts: { pads: 11, isrs: 9, icrs: 3 },
    },
  ],
  "electricity-fcs": [
    {
      id: "electricity-fcs-grid-extension",
      marker: "I",
      title: "Grid Extension to Remote Settlements",
      challengeTeaser:
        "78M households in FCS countries remain unconnected, and last-mile grid economics fall apart at low population densities and high insecurity costs.",
      countryExamples: ["DRC", "Chad"],
      sourceCounts: { pads: 10, isrs: 7, icrs: 3 },
    },
    {
      id: "electricity-fcs-off-grid-solar",
      marker: "II",
      title: "Off-Grid & Mini-Grid Solar",
      challengeTeaser:
        "Distributed solar can leapfrog the grid for scattered settlements, but financing, maintenance, and tariff models stall pilots before they scale.",
      countryExamples: ["Nigeria", "Burkina Faso"],
      sourceCounts: { pads: 9, isrs: 8, icrs: 4 },
    },
    {
      id: "electricity-fcs-affordability-tariff",
      marker: "III",
      title: "Affordability & Tariff Reform",
      challengeTeaser:
        "Cost-recovery tariffs price the poorest out, while subsidised tariffs hollow out utility balance sheets — neither path serves connection targets.",
      countryExamples: ["Mali", "Madagascar"],
      sourceCounts: { pads: 8, isrs: 6, icrs: 2 },
    },
    {
      id: "electricity-fcs-climate-resilient-generation",
      marker: "IV",
      title: "Climate-Resilient Generation Capacity",
      challengeTeaser:
        "Hydro-dependent grids face dry-season collapse and flood damage; diversification into renewables with storage is the resilience path.",
      countryExamples: ["Mozambique", "Zambia"],
      sourceCounts: { pads: 11, isrs: 9, icrs: 5 },
    },
  ],
};
