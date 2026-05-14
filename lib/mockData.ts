// ─────────────────────────────────────────────────────────────────────────────
// WBG Scorecard – Mock Data
// All data is illustrative and editorial in nature.
// ─────────────────────────────────────────────────────────────────────────────

export interface Author {
  initials: string;
  name: string;
  color: string;
}

export interface StoryTag {
  label: string;
  variant: "structural-break" | "peer-divergence" | "methodology-gap" | "concentration-risk" | "trend" | "signal" | "evidence-gap";
}

export type ThumbVariant = "people" | "digital" | "planet" | "fcs";

export interface DrivingIndicator {
  label: string;
  achieved: string;
  percentOfTarget: string;
  color: string;
}

export interface Story {
  id: string;
  tag: StoryTag;
  headline: string;
  description?: string;
  workspaceType: string;
  workspaceIcon: "chart-line" | "access-point" | "bar-chart";
  institutions: string[];
  author: Author;
  ctaLabel: string;
  ctaHref: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  thumbVariant?: ThumbVariant;
  lastUpdated?: string;
  upvotes?: number;
  downvotes?: number;
  connectors?: number;
  /** When set, clicking the story opens the shared-link viewer with this
   * prompt as the underlying artefact — turning the story card into an
   * entry point to a published insightographic. */
  viewerPrompt?: string;
  drivingIndicators?: DrivingIndicator[];
  narrativeUrl?: string;
}

export interface FeaturedStory extends Story {
  description: string;
}

export interface Indicator {
  id: string;
  label: string;
  achieved: string;
  target: string;
  exceeded?: boolean;
  methodologyNote?: string;
  methodologyUrl?: string;
}

// ─── Topics Trending ─────────────────────────────────────────────────────────

export const featuredStory: FeaturedStory = {
  id: "featured-1",
  tag: { label: "Peer Divergence · FCS Focus", variant: "peer-divergence" },
  headline: "IDA countries in FCS delivering 2.3× more health coverage per dollar than non-FCS IDA peers",
  description:
    "Targeted health systems investments in fragile states are showing outsized efficiency gains — 370M people reached against a 425M pipeline. Reform sequencing, not aid volume, appears to be the primary driver.",
  workspaceType: "Trend",
  workspaceIcon: "chart-line",
  institutions: ["IDA", "FCS"],
  author: { initials: "KR", name: "Kofi Rana", color: "#2563eb" },
  ctaLabel: "View FCS health coverage analysis",
  ctaHref: "#",
  imageSrc: "/images/IDA-1.png",
  imageAlt: "Health workers in a fragile-states clinic",
  lastUpdated: "Mar 19, 2025",
  upvotes: 312,
  downvotes: 11,
  connectors: 9,
};

export const secondaryStories: Story[] = [
  {
    id: "story-1",
    tag: { label: "Peer Divergence · Sub-Saharan Africa", variant: "peer-divergence" },
    headline: "FY25 IDA delivery reaches 939M in extreme-poverty countries — Infrastructure and Planet trail plan most",
    workspaceType: "Insightographic",
    workspaceIcon: "bar-chart",
    institutions: ["IDA", "AFE", "AFW"],
    author: { initials: "RT", name: "Ruby Tan", color: "#0891b2" },
    ctaLabel: "Open shared insightographic",
    ctaHref: "#",
    imageSrc: "/images/IDA-2.png",
    imageAlt: "Cross-pillar IDA delivery in Sub-Saharan Africa",
    lastUpdated: "May 5, 2026",
    upvotes: 184, downvotes: 4, connectors: 6,
    viewerPrompt:
      "Is IDA making a difference for people in extreme poverty in Sub-Saharan Africa?",
  },
  {
    id: "story-2",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "Digital connectivity surge — but 62% of LIC countries still unmapped for broadband reach",
    workspaceType: "Trend",
    workspaceIcon: "chart-line",
    institutions: ["IDA", "AFW"],
    author: { initials: "DN", name: "Dina N.", color: "#0891b2" },
    ctaLabel: "View broadband mapping gaps",
    ctaHref: "#",
    imageSrc: "/images/IDA-3.png",
    imageAlt: "Global network connectivity from space",
    lastUpdated: "Mar 9, 2025",
    upvotes: 156, downvotes: 23, connectors: 6,
    narrativeUrl: "https://scorecard.worldbank.org/en/narratives/digital-connectivity/results-narrative",
    drivingIndicators: [
      { label: "People Using Broadband Internet", achieved: "176.6M", percentOfTarget: "41%", color: "#00A0DF" },
    ],
  },
  {
    id: "story-3",
    tag: { label: "Emerging Signal", variant: "signal" },
    headline: "Climate resilience targets at 57% of pipeline — LDCs outpacing middle-income IDA borrowers",
    workspaceType: "Trend",
    workspaceIcon: "chart-line",
    institutions: ["IDA", "EAP"],
    author: { initials: "CS", name: "Carlos S.", color: "#a101a1" },
    ctaLabel: "View LDC climate analysis",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/story/story-3",
    imageSrc: "/images/IDA-4.png",
    imageAlt: "Climate-resilient infrastructure in an LDC setting",
    lastUpdated: "Mar 17, 2025",
    upvotes: 231, downvotes: 5, connectors: 7,
    narrativeUrl: "https://scorecard.worldbank.org/en/narratives/green-and-blue-planet/results-narrative",
    drivingIndicators: [
      { label: "Hectares of Conserved Land and Water", achieved: "92.7M", percentOfTarget: "75%", color: "#2E8B57" },
      { label: "Beneficiaries of Better Climate Risk Resilience", achieved: "136M", percentOfTarget: "32%", color: "#00A0DF" },
      { label: "Greenhouse Gas Emissions", achieved: "—", percentOfTarget: "—", color: "#6B4FA0" },
    ],
  },
];

// ─── What's Changing Right Now ────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface ChangingCard {
  id: string;
  tag: StoryTag;
  headline: string;
  workspaceType: string;
  institutions: string[];
  ctaLabel: string;
  ctaHref: string;
  chartType: "grouped-bar" | "area" | "multi-area";
  chartData: ChartDataPoint[];
  legend: { label: string; color: string }[];
  /** When set, clicking the card opens the shared-link viewer for this
   * prompt — wiring the home-page card to a pre-generated artefact. */
  viewerPrompt?: string;
}

export const changingCards: ChangingCard[] = [
  {
    id: "changing-1",
    tag: { label: "Concentration Risk · FCS", variant: "concentration-risk" },
    headline: "5 IDA-FCS countries account for ~37% of FY25 health-services shortfall",
    workspaceType: "Insightographic",
    institutions: ["IDA", "FCS", "MENAAP"],
    ctaLabel: "Open shared insightographic",
    ctaHref: "#",
    chartType: "grouped-bar",
    chartData: [
      { label: "Yemen",   value: 1.2, secondary: 3.2 },
      { label: "Sudan",   value: 1.7, secondary: 4.1 },
      { label: "Afgh.",   value: 2.4, secondary: 5.5 },
      { label: "S.Sudan", value: 0.6, secondary: 1.3 },
      { label: "Myanmar", value: 1.5, secondary: 3.1 },
    ],
    legend: [
      { label: "FY25 achieved (M people)", color: "#dc2626" },
      { label: "FY25 target (M people)",   color: "#fca5a5" },
    ],
    viewerPrompt:
      "Which countries are furthest behind on health services targets in FY25 — and what's driving the gap?",
  },
  {
    id: "changing-2",
    tag: { label: "Methodology Gap", variant: "methodology-gap" },
    headline: "Gender equality results rising — but beneficiary counting methodology varies across 14 IDA projects",
    workspaceType: "Signal",
    institutions: ["IDA", "IBRD", "MIGA"],
    ctaLabel: "Review gender inclusion methodology",
    ctaHref: "#",
    chartType: "multi-area",
    chartData: [
      { label: "Q1", value: 42, secondary: 61 },
      { label: "Q2", value: 48, secondary: 58 },
      { label: "Q3", value: 53, secondary: 67 },
      { label: "Q4", value: 58, secondary: 71 },
      { label: "Q5", value: 62, secondary: 75 },
      { label: "Q6", value: 69, secondary: 78 },
    ],
    legend: [
      { label: "Global Average", color: "#94a3b8" },
      { label: "LCR (flat)", color: "#3b82f6" },
    ],
  },
  {
    id: "changing-3",
    tag: { label: "Stalling", variant: "peer-divergence" },
    headline: "6 Scorecard indicators stalling across LCR — no advancement in 24 months",
    workspaceType: "Signal",
    institutions: ["IDA", "LCR"],
    ctaLabel: "View LCR stalled indicators",
    ctaHref: "#",
    chartType: "area",
    chartData: [
      { label: "FY21", value: 72 },
      { label: "FY22", value: 69 },
      { label: "FY23", value: 71 },
      { label: "FY24", value: 68 },
      { label: "FY25", value: 67 },
    ],
    legend: [
      { label: "Stalling Indicators", color: "#f97316" },
    ],
  },
];

// ─── Counter Intuitive Findings ───────────────────────────────────────────────

export interface CounterIntuitiveCard {
  id: string;
  tag: StoryTag;
  headline: string;
  workspaceType: string;
  institutions: string[];
  ctaLabel: string;
  ctaHref: string;
  chartType: "bar" | "donut" | "area-annotated";
  chartData: ChartDataPoint[];
  donutData?: { label: string; value: number; color: string }[];
  annotation?: string;
  legend?: { label: string; color: string }[];
}

export const counterIntuitiveCards: CounterIntuitiveCard[] = [
  {
    id: "counter-1",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Few large IDA projects ≠ portfolio strength",
    workspaceType: "Robust",
    institutions: ["IDA", "AFE", "AFW"],
    ctaLabel: "View concentration risk across 14 indicators",
    ctaHref: "#",
    chartType: "bar",
    chartData: [
      { label: "1–2", value: 38 },
      { label: "3–5", value: 62 },
      { label: "6–10", value: 55 },
      { label: "11+", value: 29 },
    ],
    legend: [
      { label: "PCE Score", color: "#3b82f6" },
      { label: "Benchmark", color: "#e2e8f0" },
    ],
  },
  {
    id: "counter-2",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Gender equality rising — methodology questions persist",
    workspaceType: "Trend",
    institutions: ["IDA", "IBRD", "MIGA"],
    ctaLabel: "View mapping gaps",
    ctaHref: "#",
    chartType: "donut",
    chartData: [],
    donutData: [
      { label: "62% mapped", value: 62, color: "#3b82f6" },
      { label: "38% unmapped", value: 38, color: "#e2e8f0" },
    ],
  },
  {
    id: "counter-3",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Client context gains ≠ WBG impact in IDA countries",
    workspaceType: "Trend",
    institutions: ["IDA", "LCR"],
    ctaLabel: "View context vs intervention attribution",
    ctaHref: "#",
    chartType: "area-annotated",
    chartData: [
      { label: "FY21", value: 55, secondary: 38 },
      { label: "FY22", value: 59, secondary: 44 },
      { label: "FY23", value: 64, secondary: 51 },
      { label: "FY24", value: 61, secondary: 58 },
      { label: "FY25", value: 68, secondary: 63 },
    ],
    annotation: "GDP Growth",
    legend: [
      { label: "GDP Growth", color: "#94a3b8" },
      { label: "WBG Results", color: "#3b82f6" },
    ],
  },
];

// ─── Explore by Patterns ─────────────────────────────────────────────────────

export interface PatternCard {
  id: string;
  headline: string;
  description: string;
  href: string;
}

export const patternCards: PatternCard[] = [
  {
    id: "pattern-1",
    headline: "Indicators flat for 2+ years",
    description:
      "Scorecard indicators with no advancement over 24 months, suggesting structural barriers rather than cyclical dips.",
    href: "#",
  },
  {
    id: "pattern-2",
    headline: "Peer groups with mismatched contexts",
    description:
      "IDA countries benchmarked against peers with fundamentally different income levels, fragility status, or portfolio size.",
    href: "#",
  },
  {
    id: "pattern-3",
    headline: "Projects contributing to 4+ indicators",
    description:
      "Multi-indicator IDA projects that could be replicated or scaled — high-leverage portfolio positions.",
    href: "#",
  },
];

// ─── Story-3 notebook boards ──────────────────────────────────────────────────

export const story3Notebooks: Story[] = [
  {
    id: "nb-1",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "Mexico Country Scorecard",
    workspaceType: "Scorecard Overview",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IFC", "IDA"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "View full Mexico FY25 outcome analysis",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-1.jpg",
    imageAlt: "Mexico Country Scorecard",
    lastUpdated: "Mar 12, 2025",
    upvotes: 142, downvotes: 8, connectors: 5,
  },
  {
    id: "nb-2",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Mexico DPF Results Analysis",
    workspaceType: "Portfolio Deep-dive",
    workspaceIcon: "bar-chart",
    institutions: ["IBRD"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "Unpack P503988 indicator gaps",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-2.jpg",
    imageAlt: "Mexico DPF Results Analysis",
    lastUpdated: "Feb 28, 2025",
    upvotes: 87, downvotes: 21, connectors: 3,
  },
  {
    id: "nb-3",
    tag: { label: "Structural Break", variant: "structural-break" },
    headline: "Education & Safety Net Gap — Mexico",
    workspaceType: "Gap Analysis",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IDA"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "See why Mexico records zero WB contribution",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-3.jpg",
    imageAlt: "Education & Safety Net Gap — Mexico",
    lastUpdated: "Mar 5, 2025",
    upvotes: 113, downvotes: 14, connectors: 7,
  },
  {
    id: "nb-4",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "LAC Social Protection Benchmarks",
    workspaceType: "Regional Benchmark",
    workspaceIcon: "bar-chart",
    institutions: ["IDA", "IBRD", "LCR"],
    author: { initials: "DS", name: "Dina El-Sayed", color: "#0891b2" },
    ctaLabel: "Compare coverage across 5 LAC peers",
    ctaHref: "/workspace/lac-regional-fy25",
    href: "/workspace/lac-regional-fy25",
    imageSrc: "/images/nb-4.jpg",
    imageAlt: "LAC social protection recipients in a community setting",
    lastUpdated: "Mar 1, 2025",
    upvotes: 64, downvotes: 31, connectors: 2,
  },
  {
    id: "nb-5",
    tag: { label: "Concentration Risk", variant: "concentration-risk" },
    headline: "Financial Inclusion Gap — LAC Region",
    workspaceType: "Indicator Analysis",
    workspaceIcon: "access-point",
    institutions: ["IFC", "MIGA"],
    author: { initials: "AO", name: "Amara Osei", color: "#2563eb" },
    ctaLabel: "Map the 28-point account ownership gap",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-5.jpg",
    imageAlt: "Woman using mobile banking in Latin America",
    lastUpdated: "Feb 14, 2025",
    upvotes: 113, downvotes: 14, connectors: 4,
  },
  {
    id: "nb-6",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "Learning Poverty: LAC Peer Comparison",
    workspaceType: "Peer Analysis",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IDA"],
    author: { initials: "RK", name: "Rajiv Khanna", color: "#7c3aed" },
    ctaLabel: "Explore the 20-point gap to Chile",
    ctaHref: "/workspace/chile-education",
    href: "/workspace/chile-education",
    imageSrc: "/images/nb-6.jpg",
    imageAlt: "Primary school children in a Latin American classroom",
    lastUpdated: "Mar 18, 2025",
    upvotes: 198, downvotes: 3, connectors: 6,
  },
];

export const story3PeerBoards: Story[] = [
  {
    id: "pb-1",
    tag: { label: "Trend", variant: "trend" },
    headline: "Brazil LAC Portfolio Review",
    workspaceType: "Portfolio Review",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IFC"],
    author: { initials: "AO", name: "Amara Osei", color: "#2563eb" },
    ctaLabel: "See how 6 education projects reach 48M students",
    ctaHref: "/workspace/brazil-lac-fy25",
    href: "/workspace/brazil-lac-fy25",
    imageSrc: "/images/pb-1.jpg",
    imageAlt: "Schoolchildren in a Brazilian classroom",
    lastUpdated: "Mar 10, 2025",
    upvotes: 113, downvotes: 14, connectors: 8,
  },
  {
    id: "pb-2",
    tag: { label: "Signal", variant: "signal" },
    headline: "Chile Education Outcomes",
    workspaceType: "Scorecard Overview",
    workspaceIcon: "bar-chart",
    institutions: ["IBRD"],
    author: { initials: "DS", name: "Dina El-Sayed", color: "#0891b2" },
    ctaLabel: "Explore Chile's 27.2% learning poverty rate",
    ctaHref: "/workspace/chile-education",
    href: "/workspace/chile-education",
    imageSrc: "/images/pb-2.jpg",
    imageAlt: "Students reading in a Chilean school",
    lastUpdated: "Mar 3, 2025",
    upvotes: 87, downvotes: 21, connectors: 3,
  },
  {
    id: "pb-3",
    tag: { label: "Signal", variant: "signal" },
    headline: "Colombia UHC Assessment",
    workspaceType: "Health Outcomes",
    workspaceIcon: "access-point",
    institutions: ["IBRD", "IDA"],
    author: { initials: "RK", name: "Rajiv Khanna", color: "#7c3aed" },
    ctaLabel: "Unpack 760K+ health results from 2 projects",
    ctaHref: "/workspace/colombia-uhc",
    href: "/workspace/colombia-uhc",
    imageSrc: "/images/pb-3.jpg",
    imageAlt: "Healthcare worker with patients in Colombia",
    lastUpdated: "Feb 20, 2025",
    upvotes: 142, downvotes: 8, connectors: 5,
  },
  {
    id: "pb-4",
    tag: { label: "Trend", variant: "trend" },
    headline: "Peru Climate Portfolio",
    workspaceType: "Climate Analysis",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IFC"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "Map Peru's net emissions reduction strategy",
    ctaHref: "/workspace/peru-climate",
    href: "/workspace/peru-climate",
    imageSrc: "/images/pb-4.jpg",
    imageAlt: "Andean forest and renewable energy infrastructure in Peru",
    lastUpdated: "Mar 15, 2025",
    upvotes: 64, downvotes: 31, connectors: 4,
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export interface PulseMetric {
  id: string;
  value: string;
  delta: string;
  deltaDirection: "up" | "down" | "warning";
  label: string;
}

export const pulseMetrics: PulseMetric[] = [
  { id: "pm-1", value: "325M", delta: "12%", deltaDirection: "up", label: "Students supported through WBG education programs" },
  { id: "pm-2", value: "244M", delta: "12%", deltaDirection: "up", label: "People benefiting from social safety nets" },
  { id: "pm-3", value: "215M", delta: "576M expected", deltaDirection: "warning", label: "People connected to electricity" },
  { id: "pm-4", value: "244M", delta: "425M Expected", deltaDirection: "warning", label: "People with strengthened climate resilience" },
];

export const trackingMetrics: PulseMetric[] = [
  { id: "tm-1", value: "370M", delta: "12%", deltaDirection: "up", label: "People accessing health services" },
  { id: "tm-2", value: "217M", delta: "2x vs FY24", deltaDirection: "up", label: "People with broadband access" },
  { id: "tm-3", value: "56", delta: "Persists", deltaDirection: "warning", label: "Countries collecting below 15% tax-to-GDP" },
  { id: "tm-4", value: "93M ha", delta: "12%", deltaDirection: "up", label: "Hectares under improved conservation" },
];

export interface BiggestMover {
  id: string;
  label: string;
  sublabel: string;
  delta: string;
  deltaDirection: "up" | "down" | "new";
}

export const biggestMovers: BiggestMover[] = [
  {
    id: "bm-1",
    label: "Broadband Access",
    sublabel: "Guinea-Bissau digital reforms; IDA + IFC push",
    delta: "+108%",
    deltaDirection: "up",
  },
  {
    id: "bm-2",
    label: "Renewable Electricity Capacity",
    sublabel: "Surged from 20 GW to 34 GW in one year",
    delta: "+75%",
    deltaDirection: "up",
  },
  {
    id: "bm-3",
    label: "Private capital enabled - fragile states",
    sublabel: "IDA countries seeing minimal PCE pipeline for FY27",
    delta: "-18%",
    deltaDirection: "down",
  },
  {
    id: "bm-4",
    label: "Jobs Indicator",
    sublabel: "Final Methodology Under Consultation – First report expected FY26",
    delta: "New",
    deltaDirection: "new",
  },
];

export interface ScorecardVertical {
  id: string;
  label: string;
  value: number;
  color: string;
}

export const scorecardVerticals: ScorecardVertical[] = [
  { id: "sv-1", label: "People",         value: 68, color: "#00c853" },
  { id: "sv-2", label: "Prosperity",     value: 52, color: "#f57c00" },
  { id: "sv-3", label: "Planet",         value: 45, color: "#f57c00" },
  { id: "sv-4", label: "Infrastructure", value: 41, color: "#d84315" },
  { id: "sv-5", label: "Digital",        value: 50, color: "#f57c00" },
];

// ─── Results Band Indicators ──────────────────────────────────────────────────

export const indicators: Indicator[] = [
  {
    id: "ind-food-security",
    label: "People With Improved Food Security",
    achieved: "208.8M",
    target: "of 175.6M",
    exceeded: true,
    methodologyNote: "People with improved food security outcomes through IDA agriculture, nutrition, and resilient food systems investments.",
  },
  {
    id: "ind-wash",
    label: "People Provided With Water, Sanitation, and/or Hygiene",
    achieved: "75.5M",
    target: "of 175.6M",
    methodologyNote: "People with access to improved water supply, sanitation, and hygiene through IDA WASH investments.",
  },
  {
    id: "ind-hectares",
    label: "Hectares of Conserved Land and Water",
    achieved: "92.7M",
    target: "of 124.1M",
    methodologyNote: "Land area brought under improved natural resource management, including forests, wetlands, and protected marine areas.",
  },
  {
    id: "ind-ghg",
    label: "Greenhouse Gas Emissions",
    achieved: "-331.8MtCO₂eq",
    target: "reduction target",
    methodologyNote: "Net greenhouse gas emission reductions attributable to IDA-financed climate mitigation projects, measured over project lifetime.",
  },
  {
    id: "ind-climate-resilience",
    label: "Beneficiaries of Better Climate Risk Resilience",
    achieved: "136M",
    target: "of 424.5M",
    methodologyNote: "People with strengthened climate resilience through IDA adaptation projects, early warning systems, and climate-smart infrastructure.",
  },
  {
    id: "ind-safety-nets",
    label: "Beneficiaries of Social Safety Net Programs",
    achieved: "244.1M",
    target: "of 251.4M",
    methodologyNote: "People benefiting from social protection programs including cash transfers, food vouchers, and social insurance schemes.",
  },
  {
    id: "ind-students",
    label: "Students Supported With Better Education",
    achieved: "324.5M",
    target: "of 406.2M",
    methodologyNote: "Students benefiting from WBG education investments across primary, secondary, and tertiary levels in IDA countries.",
  },
  {
    id: "ind-health-services",
    label: "People Receiving Quality Health Services",
    achieved: "378.9M",
    target: "of 466.5M",
    methodologyNote: "People accessing health services through IDA-supported projects. Includes primary care, maternal health, and community health workers.",
  },
  {
    id: "ind-health-emergencies",
    label: "Countries With Stronger Responses to Health Emergencies",
    achieved: "21",
    target: "of 66",
    methodologyNote: "Countries that have strengthened their capacity to prepare for and respond to health emergencies through IDA-financed programs.",
  },
  {
    id: "ind-displaced-people",
    label: "Displaced People Provided With Services",
    achieved: "12.1M",
    target: "of 575.6M",
    methodologyNote: "Forcibly displaced people and host communities supported through IDA projects addressing protection, livelihoods, and durable solutions.",
  },
  {
    id: "ind-gender-equality",
    label: "People Benefiting From Advances in Gender Equality",
    achieved: "256.7M",
    target: "of 575.6M",
    methodologyNote: "Women and girls benefiting from programs explicitly targeting gender gaps in education, health, finance, and labor markets.",
  },
  {
    id: "ind-private-capital-enabled",
    label: "Private Capital Enabled",
    achieved: "$161.7B",
    target: "target",
    methodologyNote: "Total private capital enabled through IDA-supported projects. Includes IFC upstream work and WBG advisory engagements that facilitate private investment.",
  },
  {
    id: "ind-financial-services",
    label: "People and Businesses Using Financial Services",
    achieved: "141.8M",
    target: "of 575.6M",
    methodologyNote: "People and businesses accessing financial services in IDA countries through IFC and IDA-supported financial sector projects.",
  },
  {
    id: "ind-private-capital-mobilized",
    label: "Private Capital Mobilized",
    achieved: "$241.6B",
    target: "target",
    methodologyNote: "Private capital mobilized by IFC and MIGA in IDA-eligible countries, measured at commitment. Excludes sub-national guarantees.",
  },
  {
    id: "ind-broadband",
    label: "People Using Broadband Internet",
    achieved: "176.6M",
    target: "of 430.8M",
    methodologyNote: "People with improved broadband access through IDA digital infrastructure projects. Includes mobile broadband where fixed broadband is unavailable.",
  },
  {
    id: "ind-digital-services",
    label: "People Using Digitally Enabled Services",
    achieved: "216.8M",
    target: "of 430.8M",
    methodologyNote: "People using government or commercial services delivered through digital platforms supported by IDA-financed digital economy projects.",
  },
  {
    id: "ind-electricity",
    label: "People Provided With Electricity",
    achieved: "214.5M",
    target: "of 575.6M",
    methodologyNote: "People gaining first-time or improved electricity access through IDA energy projects, including grid and off-grid solutions.",
  },
  {
    id: "ind-renewable-energy",
    label: "Renewable Energy Enabled",
    achieved: "33.82GW",
    target: "of 108.89GW",
    methodologyNote: "Gigawatts of renewable energy capacity enabled through IDA-financed energy projects, including solar, wind, hydro, and geothermal.",
  },
  {
    id: "ind-transport",
    label: "People With Improved Access to Transportation",
    achieved: "176.3M",
    target: "of 523.5M",
    methodologyNote: "People benefiting from improved transport infrastructure and services through IDA-financed sustainable transport projects.",
  },
  {
    id: "ind-tax",
    label: "Countries With Increased Tax Collections, Considering Equity",
    achieved: "20",
    target: "of 34",
    methodologyNote: "IDA countries that have increased tax-to-GDP ratios through WBG-supported fiscal reform programs, with equity considerations applied.",
  },
  {
    id: "ind-debt",
    label: "Countries in or at High Risk of Debt Distress That Implemented Reforms",
    achieved: "60.3%",
    target: "of 65.5%",
    methodologyNote: "Share of IDA countries in or at high risk of debt distress that have implemented debt sustainability reforms supported by WBG programs.",
  },
];
