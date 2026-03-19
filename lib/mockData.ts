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
  lastUpdated?: string;
  upvotes?: number;
  downvotes?: number;
  connectors?: number;
}

export interface FeaturedStory extends Story {
  description: string;
}

// ─── Topics Trending ─────────────────────────────────────────────────────────

export const featuredStory: FeaturedStory = {
  id: "featured-1",
  tag: { label: "Trend", variant: "trend" },
  headline: "ECA reform-driven PCE outpacing EAP by 2.1x despite lower investment volume",
  description:
    "Regulatory and governance reforms in ECA are converting to Private Capital Enabled results at more than double the rate of infrastructure-led approaches in EAP. Suggests reform type — not investment scale — is the primary driver.",
  workspaceType: "Trend",
  workspaceIcon: "chart-line",
  institutions: ["IFC", "MIGA"],
  author: { initials: "AO", name: "Amara Osei", color: "#2563eb" },
  ctaLabel: "View ECA vs EAP PCE Reform Analysis",
  ctaHref: "#",
  imageSrc: "/images/story-featured.jpg",
  imageAlt: "Collapsed bridge infrastructure",
  lastUpdated: "Mar 19, 2025",
  upvotes: 312,
  downvotes: 11,
  connectors: 9,
};

export const secondaryStories: Story[] = [
  {
    id: "story-1",
    tag: { label: "Structural Break", variant: "structural-break" },
    headline: "Q2 disbursements missed target in 9 IDA countries that met Q1",
    workspaceType: "Trend",
    workspaceIcon: "chart-line",
    institutions: ["IFC", "MIGA"],
    author: { initials: "RK", name: "Rajiv Khanna", color: "#7c3aed" },
    ctaLabel: "View Q1 vs Q2 Disbursement Analysis",
    ctaHref: "#",
    imageSrc: "/images/story-1.jpg",
    imageAlt: "Collapsed bridge infrastructure",
    lastUpdated: "Mar 14, 2025",
    upvotes: 94, downvotes: 7, connectors: 4,
  },
  {
    id: "story-2",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "MENAAP CMU contributing to 40% fewer indicators than regional average",
    workspaceType: "Trend",
    workspaceIcon: "chart-line",
    institutions: ["IFC", "MIGA"],
    author: { initials: "DS", name: "Dina El-Sayed", color: "#0891b2" },
    ctaLabel: "View MENAAP Regional Benchmarks",
    ctaHref: "#",
    imageSrc: "/images/story-2.jpg",
    imageAlt: "Global network connectivity from space",
    lastUpdated: "Mar 9, 2025",
    upvotes: 156, downvotes: 23, connectors: 6,
  },
  {
    id: "story-3",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "Mexico falling behind LAC peers on education and safety nets — 4 projects contributing but 2 are stalling",
    workspaceType: "Trend",
    workspaceIcon: "chart-line",
    institutions: ["IFC", "MIGA"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "View Peer Gap Analysis",
    ctaHref: "/workspace/mexico-fy25",
    href: "/story/story-3",
    imageSrc: "/images/story-3.jpg",
    imageAlt: "Healthcare worker with patients",
    lastUpdated: "Mar 17, 2025",
    upvotes: 231, downvotes: 5, connectors: 7,
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
}

export const changingCards: ChangingCard[] = [
  {
    id: "changing-1",
    tag: { label: "Concentration Risk", variant: "concentration-risk" },
    headline: "Jobs Indicator Surging in ECA — But 80% Driven by Indirect Employment",
    workspaceType: "Signal",
    institutions: ["IFC", "ECA"],
    ctaLabel: "View ECA jobs breakdown by project",
    ctaHref: "#",
    chartType: "grouped-bar",
    chartData: [
      { label: "FY23", value: 57, secondary: 23 },
      { label: "FY24", value: 93, secondary: 42 },
      { label: "FY25", value: 113, secondary: 68 },
    ],
    legend: [
      { label: "Jobs", color: "#3b82f6" },
      { label: "Indirect Unemployment", color: "#f9a8d4" },
    ],
  },
  {
    id: "changing-2",
    tag: { label: "Methodology Gap", variant: "methodology-gap" },
    headline: "Gender Equality Results Rising — But Methodology Questions Persist",
    workspaceType: "Signal",
    institutions: ["IBRD", "IFC", "MIGA"],
    ctaLabel: "Review Gender Inclusion Methodology",
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
      { label: "LCR (7M)", color: "#3b82f6" },
    ],
  },
  {
    id: "changing-3",
    tag: { label: "Stalling", variant: "peer-divergence" },
    headline: "6 Scorecard Indicators Stalling Across LCR — No Advancement in 24 Months",
    workspaceType: "Signal",
    institutions: ["IBRD", "IDA", "LCR"],
    ctaLabel: "View LCR stalled indicators by country",
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
    headline: "Few Large Projects = Portfolio Strength",
    workspaceType: "Robust",
    institutions: ["IFC", "ECA"],
    ctaLabel: "View Concentration Risk across 14 ind…",
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
    headline: "Gender Equality Results Rising — But Methodology Questions Persist",
    workspaceType: "Trend",
    institutions: ["IBRD", "IFC", "MIGA"],
    ctaLabel: "View mapping gaps",
    ctaHref: "#",
    chartType: "donut",
    chartData: [],
    donutData: [
      { label: "42% mapped", value: 42, color: "#3b82f6" },
      { label: "58% unmapped", value: 58, color: "#e2e8f0" },
    ],
  },
  {
    id: "counter-3",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Client Context Gains = WBG Impact",
    workspaceType: "Trend",
    institutions: ["IBRD", "IDA", "LCR"],
    ctaLabel: "View Context vs Intervention attribution",
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
      "Scorecard indicators showing no advancement over 24 months, suggesting structural barriers rather than cyclical dips",
    href: "#",
  },
  {
    id: "pattern-2",
    headline: "Peer groups with mismatched contexts",
    description:
      "Countries being benchmarked against peers with fundamentally different income levels, fragility status, or portfolio size",
    href: "#",
  },
  {
    id: "pattern-3",
    headline: "Projects contributing to 4+ indicators",
    description:
      "Multi-indicator projects that could be replicated or scaled — high-leverage portfolio positions",
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
    ctaHref: "/workspace/mexico-fy25",
    href: "/workspace/mexico-fy25",
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
    ctaHref: "/workspace/mexico-fy25",
    href: "/workspace/mexico-fy25",
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
    ctaHref: "/workspace/mexico-fy25",
    href: "/workspace/mexico-fy25",
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
    ctaHref: "/workspace/mexico-fy25",
    href: "/workspace/mexico-fy25",
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
