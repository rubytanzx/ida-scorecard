// components/conversation/NarrativeSkeletons.ts
//
// Per-flow 4-angle skeleton data shown in the skeleton-ready phase of the
// narrative-creation flow. Each angle carries enough content for both the
// compact card (challenge + intervention fade + countries) and the expanded
// preview panel (challenge + intervention + country examples + pathways +
// lessons). Mirrors the FLOW_CONTENT pattern in ConversationView.tsx.

import type { FlowId } from "./ConversationView";

export type SkeletonMarker = "I" | "II" | "III" | "IV";

export interface NarrativeSkeleton {
  id: string;
  marker: SkeletonMarker;            // ordering only — not rendered on the card
  title: string;                     // short headline, 3–5 words
  challengeText: string;             // full Challenge paragraph
  interventionText: string;          // full Intervention paragraph
  countryExamples: [string, string]; // names
  countryFlags: [string, string];    // emoji flags aligned 1:1 with countryExamples
  pathwaysText: string;              // Pathways to Outcomes — preview only
  lessonsText: string;               // Lessons Learned — preview only
  sourceCounts: { pads: number; isrs: number; icrs: number };
}

export type NarrativeSkeletonSet = readonly [
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
];

export const FLOW_SKELETONS = {
  "africa-poverty": [
    {
      id: "africa-poverty-climate-safety-nets",
      marker: "I",
      title: "Climate Shocks & Social Safety Nets",
      challengeText:
        "Across the Sahel and East Africa, recurrent droughts and floods erode household resilience faster than recovery transfers can scale. Each shock pushes vulnerable families back into extreme poverty, eroding the gains of prior interventions and leaving the poorest exposed to repeated, compounding crises.",
      interventionText:
        "IDA operations deploy shock-responsive cash transfers paired with adaptive social registries, climate-indexed insurance, and public works that double as community-asset builders. Programs prioritise digital payment rails and biometric ID so transfers can scale within days of a verified shock trigger.",
      countryExamples: ["Ethiopia", "Niger"],
      countryFlags: ["🇪🇹", "🇳🇪"],
      pathwaysText:
        "Anticipatory transfers stabilise consumption during the lean season, preventing distress sales of productive assets. As registries mature, coverage expands from chronic-poor households to a wider climate-vulnerable cohort, building a permanent social-protection floor that the government can scale during future crises.",
      lessonsText:
        "Programs work when the trigger mechanism, registry quality, and payment infrastructure are co-invested from the start. Pilots that scaled cash without simultaneously strengthening the registry stalled at low coverage; conversely, registry investments without a clear payout pathway delivered no measurable consumption smoothing.",
      sourceCounts: { pads: 218, isrs: 1842, icrs: 41 },
    },
    {
      id: "africa-poverty-learning-teacher-capacity",
      marker: "II",
      title: "Learning Poverty & Teacher Capacity",
      challengeText:
        "70% of primary-age children in IDA countries cannot read a simple passage by age 10. The binding constraint is rarely textbooks or classrooms — it is a teaching workforce trained in outdated, theoretical methods, with weak in-service coaching and minimal access to structured pedagogy.",
      interventionText:
        "Operations roll out structured pedagogy packages — scripted lessons, decodable readers, and termly diagnostic assessments — tied to an in-service coaching cadence. The deepest impact comes when the package is integrated into national curricula and teacher promotion pathways, not delivered as a side-track program.",
      countryExamples: ["Madagascar", "Kenya"],
      countryFlags: ["🇲🇬", "🇰🇪"],
      pathwaysText:
        "Coaching cycles raise instructional quality in target grades within 2–3 academic terms; diagnostic data shifts classroom time onto the weakest students. Over a project lifecycle, foundational literacy gains compound across cohorts and ease the transition pressure on lower-secondary.",
      lessonsText:
        "Decoupling pedagogy reform from teacher career incentives produces transient gains that decay once project supervision ends. The most durable results come from operations that package classroom-level coaching with civil-service reform.",
      sourceCounts: { pads: 174, isrs: 1612, icrs: 38 },
    },
    {
      id: "africa-poverty-fiscal-space-revenue",
      marker: "III",
      title: "Fiscal Space & Domestic Revenue",
      challengeText:
        "56 IDA economies collect less than 15% of GDP in tax revenue — well below the threshold associated with sustained public-service delivery. Narrow bases, large informal sectors, and weak administration limit the fiscal room to invest in human capital, even as poverty deepens.",
      interventionText:
        "Operations combine DPF reforms (VAT modernisation, excise rebalancing, taxpayer registries) with revenue-administration capacity programs — risk-based audit, e-filing, and large-taxpayer units. Programmatic series sustain reforms across political cycles.",
      countryExamples: ["Sierra Leone", "Rwanda"],
      countryFlags: ["🇸🇱", "🇷🇼"],
      pathwaysText:
        "Administrative tightening lifts compliance among the largest taxpayers within 12–18 months, generating early wins that build political space for broader base-broadening. Reform momentum is then redirected toward equity — reducing exemptions and shifting toward progressive rates.",
      lessonsText:
        "Tax administration reforms move faster than policy reforms because they require fewer veto-point negotiations. Operations that sequenced admin-then-policy outperformed simultaneous-track programs in both ICR ratings and outturn revenue.",
      sourceCounts: { pads: 152, isrs: 1287, icrs: 29 },
    },
    {
      id: "africa-poverty-fragility-displacement",
      marker: "IV",
      title: "Fragility, Conflict & Displacement",
      challengeText:
        "Extreme poverty in IDA countries is now concentrated in FCS contexts, where active conflict destroys services, displaces populations for years, and pushes whole regions outside the reach of normal project supervision. Standard delivery models fail in this environment.",
      interventionText:
        "Operations use third-party monitoring, community-driven development modalities, and contingency emergency response components (CERCs) to deliver in active-conflict districts. Multi-Donor Trust Funds and UN-implemented windows extend the operational footprint where direct IDA implementation is infeasible.",
      countryExamples: ["South Sudan", "Yemen"],
      countryFlags: ["🇸🇸", "🇾🇪"],
      pathwaysText:
        "Hybrid delivery channels keep basic services running through active hostilities. As security windows open, operations layer in capacity transfer to host-country institutions so that the long-term system rebuilds even while emergency delivery continues.",
      lessonsText:
        "Operations that built in flexibility upfront — pre-approved CERCs, scenario-tagged disbursement triggers, and pre-qualified implementing partners — adapted faster to security shocks than those that retrofitted flexibility mid-implementation.",
      sourceCounts: { pads: 242, isrs: 2104, icrs: 47 },
    },
  ],
  "health-gap": [
    {
      id: "health-gap-workforce-density",
      marker: "I",
      title: "Health Workforce Density in FCS",
      challengeText:
        "FCS countries average 0.8 health workers per 1,000 people — a quarter of WHO's threshold for basic service delivery. Migration of trained staff to higher-income markets and to safer regions within-country compounds the gap, leaving frontline facilities chronically understaffed.",
      interventionText:
        "Operations finance scaled pre-service training, accelerated certification of community health workers, and rural retention packages (housing, hardship pay, rotational promotions). Public-financial-management reforms ringfence the wage bill so payroll stays current even during fiscal stress.",
      countryExamples: ["Yemen", "Afghanistan"],
      countryFlags: ["🇾🇪", "🇦🇫"],
      pathwaysText:
        "Within 24 months, accelerated CHW certification adds frontline capacity in the highest-need districts; rural retention shifts net deployment toward underserved regions. Over a 5-year horizon, training-pipeline investments produce a sustainable replacement rate.",
      lessonsText:
        "Workforce expansion without simultaneous payroll-management reform reverses within two budget cycles. Operations that paired training with PFM strengthening retained their staffing gains; those that didn't watched the workforce shrink back as wage arrears accumulated.",
      sourceCounts: { pads: 196, isrs: 1748, icrs: 39 },
    },
    {
      id: "health-gap-primary-care-last-mile",
      marker: "II",
      title: "Primary-Care Access at the Last Mile",
      challengeText:
        "Remote and pastoralist communities sit beyond functional referral catchments — so even fully-funded clinics fail to convert into service contacts. Distance, road condition, and the absence of communication channels mean that primary care does not reach those most in need.",
      interventionText:
        "Operations deploy outreach teams on rotational schedules, mobile clinics tied to community health posts, and digital triage tools that let CHWs escalate severe cases to nearby facilities. Performance-based financing redirects resources to underperforming catchments.",
      countryExamples: ["Mozambique", "Sudan"],
      countryFlags: ["🇲🇿", "🇸🇩"],
      pathwaysText:
        "Outreach schedules raise the proportion of pregnancies under skilled supervision and routine immunisation coverage in the targeted districts. As digital triage matures, the system learns where stationary investments would now pay off — informing the next infrastructure cycle.",
      lessonsText:
        "Mobile-only delivery hits a coverage ceiling without a corresponding stationary backbone. The most cost-effective configurations layered outreach onto a thin but functional facility network; pure mobile programs cost more per contact and produced weaker continuity-of-care.",
      sourceCounts: { pads: 168, isrs: 1492, icrs: 32 },
    },
    {
      id: "health-gap-stunting-nutrition",
      marker: "III",
      title: "Stunting & Nutrition in Children Under-5",
      challengeText:
        "Under-5 stunting in FCS countries sits at 33.6% — locking in cognitive and economic losses that no later-life intervention can fully reverse. The window for prevention is narrow: 1,000 days from conception. After it closes, the deficit becomes permanent.",
      interventionText:
        "Operations integrate growth monitoring, micronutrient supplementation, infant-and-young-child feeding counselling, and WASH improvements at the village level. Cash transfers conditional on growth-monitoring attendance create a steady demand signal for frontline services.",
      countryExamples: ["Pakistan", "Bangladesh"],
      countryFlags: ["🇵🇰", "🇧🇩"],
      pathwaysText:
        "Multi-sectoral packages move stunting prevalence within 3–5 years in the targeted districts. As the system matures, attention shifts toward fortification, biofortified staples, and IYCF social-behaviour change for the next cohort.",
      lessonsText:
        "Single-sector nutrition programs underperform; the durable gains come from operations that wired together health, WASH, and social-protection delivery channels around the same beneficiary cohort.",
      sourceCounts: { pads: 134, isrs: 1183, icrs: 26 },
    },
    {
      id: "health-gap-emergency-response",
      marker: "IV",
      title: "Emergency Health Response Capacity",
      challengeText:
        "Recurrent disease outbreaks and crisis episodes overwhelm fragile health systems, eroding gains made during stable years. Without standing surge capacity, each emergency consumes resources that would otherwise fund routine care, generating a long-term coverage deficit.",
      interventionText:
        "Operations finance national emergency operations centres, pre-positioned commodity stockpiles, and pre-approved CERCs that activate within 72 hours of a verified trigger. Training rotations build the surge workforce in advance of need.",
      countryExamples: ["Myanmar", "South Sudan"],
      countryFlags: ["🇲🇲", "🇸🇸"],
      pathwaysText:
        "Pre-positioning shortens the response curve so that the first 30 days of an outbreak don't consume the next 12 months of routine budget. Over time, the EOC becomes the institutional home for outbreak preparedness, surveillance, and cross-border coordination.",
      lessonsText:
        "Standing pre-approved instruments outperformed bespoke per-outbreak programs on both response time and ICR ratings. The lead time saved by avoiding fresh approval processes was decisive in containing emerging outbreaks.",
      sourceCounts: { pads: 212, isrs: 1893, icrs: 35 },
    },
  ],
  "electricity-fcs": [
    {
      id: "electricity-fcs-grid-extension",
      marker: "I",
      title: "Grid Extension to Remote Settlements",
      challengeText:
        "78 million households in IDA FCS countries remain unconnected. Last-mile grid economics fall apart at low population densities, and insecurity premiums on construction contracts often double the per-connection cost — so each new kilometre of line covers fewer households than budgeted.",
      interventionText:
        "Operations finance medium-voltage backbone investments paired with prepaid metering rollouts and densification programs to make new connections financially sustainable. Risk-mitigation guarantees attract private contractors into high-insecurity districts.",
      countryExamples: ["DRC", "Chad"],
      countryFlags: ["🇨🇩", "🇹🇩"],
      pathwaysText:
        "Backbone extension creates the technical precondition for densification, where the bulk of connection-volume gains accumulate. Prepaid metering makes the connection commercially sustainable for the utility, which in turn finances the next round of densification.",
      lessonsText:
        "Connection-rate programs that skipped densification — leaving the new backbone underused — failed to recover costs. The operations that paired extension with active densification investments closed the per-connection cost gap within 3–4 years.",
      sourceCounts: { pads: 184, isrs: 1568, icrs: 31 },
    },
    {
      id: "electricity-fcs-off-grid-solar",
      marker: "II",
      title: "Off-Grid & Mini-Grid Solar",
      challengeText:
        "Distributed solar can leapfrog the grid for scattered settlements, but financing, maintenance, and tariff models stall pilots before they scale. Most pilots prove technical feasibility and then collapse as soon as project subsidies end and a real cost-recovery model is required.",
      interventionText:
        "Operations underwrite results-based subsidies tied to verified connections, blended finance for mini-grid developers, and consumer-finance instruments that move solar systems out of cash-only sale. Regulatory work codifies mini-grid tariff structures and arrival-of-grid compensation rules.",
      countryExamples: ["Nigeria", "Burkina Faso"],
      countryFlags: ["🇳🇬", "🇧🇫"],
      pathwaysText:
        "Standardised tariff and grid-arrival regulation reduces developer risk, opening private capital flow into the segment. As markets mature, operations shift from results-based subsidy to risk-sharing — eventually exiting the financing role entirely.",
      lessonsText:
        "Pilots without a tariff and grid-arrival regulatory framework died on contact with the grid. The successful programs front-loaded the regulatory work so private developers had a predictable exit path before sinking capital.",
      sourceCounts: { pads: 162, isrs: 1432, icrs: 28 },
    },
    {
      id: "electricity-fcs-affordability-tariff",
      marker: "III",
      title: "Affordability & Tariff Reform",
      challengeText:
        "Cost-recovery tariffs price the poorest customers out, while subsidised tariffs hollow out utility balance sheets — and neither path delivers the connection-rate targets the country is committed to. Tariff reform sits at the centre of every sector recovery program but is politically the hardest piece.",
      interventionText:
        "Operations design lifeline-block tariffs, targeted social tariffs delivered via the social registry, and explicit subsidy budgeting through the public-financial-management system. Communications campaigns prepare the political ground before published-tariff increases.",
      countryExamples: ["Mali", "Madagascar"],
      countryFlags: ["🇲🇱", "🇲🇬"],
      pathwaysText:
        "Targeted protection for low-income households makes the politically necessary average-tariff increases feasible. Within 18–24 months the utility's working capital position stabilises, freeing it to invest in service quality.",
      lessonsText:
        "Tariff reforms that bundled poor-household protection with the price increase passed; those that proposed naked cost-recovery reform without targeted offsets were reversed at the first political pressure point.",
      sourceCounts: { pads: 147, isrs: 1289, icrs: 24 },
    },
    {
      id: "electricity-fcs-climate-resilient-generation",
      marker: "IV",
      title: "Climate-Resilient Generation Capacity",
      challengeText:
        "Hydro-dependent grids face dry-season collapse and flood damage to dam and transmission infrastructure. Climate variability — both droughts and intense storms — is now the dominant risk to generation reliability, even more than fuel-price volatility.",
      interventionText:
        "Operations diversify generation toward solar-and-storage and run-of-river hydro paired with storage; harden transmission corridors against flood and wind; and finance regional interconnections so that dry-season deficits in one country can be covered by neighbouring surpluses.",
      countryExamples: ["Mozambique", "Zambia"],
      countryFlags: ["🇲🇿", "🇿🇲"],
      pathwaysText:
        "Diversification reduces the seasonal generation gap; interconnections turn the gap from a national crisis into a regional trade flow. Storage investments make the variable-renewable share manageable for the system operator.",
      lessonsText:
        "Operations that financed only generation without simultaneously upgrading transmission and interconnection capacity saw new capacity stranded behind congested corridors. The most resilient grids invested in generation, transmission, and storage as a single integrated portfolio.",
      sourceCounts: { pads: 209, isrs: 1856, icrs: 38 },
    },
  ],
} as const satisfies Record<FlowId, NarrativeSkeletonSet>;
