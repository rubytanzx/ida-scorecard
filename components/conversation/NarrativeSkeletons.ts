// components/conversation/NarrativeSkeletons.ts
//
// Per-flow 4-angle skeleton data shown in the skeleton-ready phase of the
// narrative-creation flow. Each angle carries enough content for both the
// compact card (challenge + intervention fade + countries) and the expanded
// preview panel (challenge + intervention + country examples + pathways +
// lessons). Mirrors the FLOW_CONTENT pattern in ConversationView.tsx.

import type { FlowId } from "./ConversationView";

export type SkeletonMarker = "I" | "II" | "III" | "IV";

/** A single country case-study entry inside a skeleton's countryExamples. */
export interface CountryExample {
  name: string;
  flag: string;
  /** 1–2 sentence project-style description naming a real WB project ID
   *  and the specific intervention. Surfaces in the SkeletonPreviewPanel
   *  and SkeletonRefinedMessage. */
  description: string;
}

/** Pathways to Outcomes — structured as the WBG prompt format requires:
 *  four labelled sub-bullets describing the project's theory of change. */
export interface Pathways {
  /** The specific bottleneck or issue. */
  challenge: string;
  /** The overarching WBG strategy or intervention applied. */
  wbgApproach: string;
  /** Immediate / medium-term measurable results expected. */
  outcomes: string;
  /** Broader, sustained benefits over the long term. */
  longTermImpact: string;
}

/** Which of the 15 Scorecard outcome areas this narrative angle belongs to.
 *  Rendered as a small tag on the skeleton card + preview so the user can
 *  see the OA scope before opening the angle. */
export interface OutcomeAreaTag {
  /** Short code (e.g. "OA-1") used as the leading chip text. */
  code: string;
  /** Full OA title used as the trailing text on the chip. */
  label: string;
}

export interface NarrativeSkeleton {
  id: string;
  marker: SkeletonMarker;            // ordering only — not rendered on the card
  title: string;                     // short headline, 3–5 words
  outcomeArea: OutcomeAreaTag;       // primary OA for this angle
  challengeText: string;             // full Challenge paragraph
  interventionText: string;          // full Intervention paragraph
  countryExamples: readonly [CountryExample, CountryExample];
  /** Optional third country case study. Surfaced only when the user
   *  asks for "one more country example" in the post-draft refinement
   *  step — the conversation then echoes back this addition and the
   *  narrative panel appends it to its Country Examples section. */
  extraCountryExample: CountryExample;
  /** AI-authored rationale for why the extraCountryExample specifically
   *  was added — surfaced inside SkeletonRefinedMessage so the user sees
   *  the angle that the added country brings, not just "narrative updated".
   *  Tailored per skeleton to reference the existing two countries. */
  extraCountryReasoning: string;
  /** Pathways to Outcomes — 4-bullet structured breakdown per the WBG
   *  PAD-synthesis prompt format. */
  pathways: Pathways;
  lessonsText: string;               // Lessons Learned — preview only
  sourceCounts: { pads: number; isrs: number; icrs: number };
}

export type NarrativeSkeletonSet = readonly [
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
];

const BASE_FLOW_SKELETONS = {
  "africa-poverty": [
    {
      id: "africa-poverty-climate-safety-nets",
      marker: "I",
      title: "Climate Shocks & Social Safety Nets",
      outcomeArea: { code: "OA-1", label: "Protection for the Poorest" },
      challengeText:
        "Across the Sahel and East Africa, recurrent droughts and floods erode household resilience faster than recovery transfers can scale. Each shock pushes vulnerable families back into extreme poverty, eroding the gains of prior interventions and leaving the poorest exposed to repeated, compounding crises.",
      interventionText:
        "IDA operations deploy shock-responsive cash transfers paired with adaptive social registries, climate-indexed insurance, and public works that double as community-asset builders. Programs prioritise digital payment rails and biometric ID so transfers can scale within days of a verified shock trigger.",
      countryExamples: [
        {
          name: "Ethiopia",
          flag: "🇪🇹",
          description:
            "The Productive Safety Net Programme (P163438) reached 9.5M households during the 2024 drought, with shock-responsive cash transfers triggered within 14 days of a verified climate-index breach. Anticipatory payouts replaced distress sales as the primary household coping strategy.",
        },
        {
          name: "Niger",
          flag: "🇳🇪",
          description:
            "The Adaptive Social Safety Nets Project (P166602) layered drought-indexed transfers onto an adaptive social registry; biometric-ID payment rails compressed onboarding time from six weeks to under seven days during lean-season activation.",
        },
      ],
      extraCountryExample: {
        name: "Mozambique",
        flag: "🇲🇿",
        description:
          "The Social Protection Project (P171280) layered cyclone-indexed transfers onto INAS's national registry; biometric verification disbursed top-ups to 1.8M people inside 21 days of Cyclone Idai's verified landfall trigger.",
      },
      extraCountryReasoning:
        "Ethiopia and Niger anchor the Sahel-and-Horn climate corridor — Mozambique brings a coastal-cyclone exposure profile to the same shock-responsive design, so the angle covers all three climate-hazard contexts (drought, lean season, cyclone) without doubling up on geography.",
      pathways: {
        challenge:
          "Climate shocks push vulnerable households into distress sales of productive assets, eroding recovery faster than humanitarian aid can scale.",
        wbgApproach:
          "Shock-responsive cash transfers triggered by climate indices, layered onto adaptive social registries with biometric payment rails.",
        outcomes:
          "Consumption smoothing during the lean season; coverage expanding from chronic-poor to wider climate-vulnerable cohorts within 24 months.",
        longTermImpact:
          "A permanent, government-owned social-protection floor that scales automatically during future crises without standing up new delivery systems.",
      },
      lessonsText:
        "Programs work when the trigger mechanism, registry quality, and payment infrastructure are co-invested from the start. Pilots that scaled cash without simultaneously strengthening the registry stalled at low coverage; conversely, registry investments without a clear payout pathway delivered no measurable consumption smoothing.",
      sourceCounts: { pads: 218, isrs: 1842, icrs: 41 },
    },
    {
      id: "africa-poverty-learning-teacher-capacity",
      marker: "II",
      title: "Learning Poverty & Teacher Capacity",
      outcomeArea: { code: "OA-2", label: "No Learning Poverty" },
      challengeText:
        "70% of primary-age children in IDA countries cannot read a simple passage by age 10. The binding constraint is rarely textbooks or classrooms — it is a teaching workforce trained in outdated, theoretical methods, with weak in-service coaching and minimal access to structured pedagogy.",
      interventionText:
        "Operations roll out structured pedagogy packages — scripted lessons, decodable readers, and termly diagnostic assessments — tied to an in-service coaching cadence. The deepest impact comes when the package is integrated into national curricula and teacher promotion pathways, not delivered as a side-track program.",
      countryExamples: [
        {
          name: "Madagascar",
          flag: "🇲🇬",
          description:
            "The Basic Education Support Project (P166520) rolled out structured pedagogy with scripted Malagasy-language readers and termly diagnostic assessments to 12,000 primary teachers, paired with an in-service coaching cadence run by regional inspectorates.",
        },
        {
          name: "Kenya",
          flag: "🇰🇪",
          description:
            "The Secondary Education Quality Improvement Project (P160083) tied teacher promotion paths to TPD module completion and embedded School-Based Teacher Support Systems across 1,400 secondary schools.",
        },
      ],
      extraCountryExample: {
        name: "Rwanda",
        flag: "🇷🇼",
        description:
          "The Quality Basic Education for Human Capital Development Project (P168697) embedded structured pedagogy in the national curriculum and tied teacher promotion to TPD module completion across 2,500 primary schools.",
      },
      extraCountryReasoning:
        "Madagascar and Kenya show the playbook working at sub-national scale — Rwanda's structured-pedagogy roll-out hit national coverage inside one project cycle, a useful contrast case that demonstrates how the same WBG approach lands when the political ceiling is higher.",
      pathways: {
        challenge:
          "Primary-age children cannot read by age 10 because teachers lack structured pedagogy training and in-service coaching.",
        wbgApproach:
          "Scripted lessons, decodable readers, and termly diagnostics tied to coaching cycles and teacher-promotion pathways.",
        outcomes:
          "Instructional quality lifts in 2–3 academic terms; classroom time redirects toward the weakest readers based on diagnostic data.",
        longTermImpact:
          "Foundational literacy gains compound across cohorts, easing transition pressure on lower-secondary and lifting human-capital outcomes through adulthood.",
      },
      lessonsText:
        "Decoupling pedagogy reform from teacher career incentives produces transient gains that decay once project supervision ends. The most durable results come from operations that package classroom-level coaching with civil-service reform.",
      sourceCounts: { pads: 174, isrs: 1612, icrs: 38 },
    },
    {
      id: "africa-poverty-fiscal-space-revenue",
      marker: "III",
      title: "Fiscal Space & Domestic Revenue",
      outcomeArea: { code: "OA-13", label: "Macroeconomic & Fiscal Mgmt" },
      challengeText:
        "56 IDA economies collect less than 15% of GDP in tax revenue — well below the threshold associated with sustained public-service delivery. Narrow bases, large informal sectors, and weak administration limit the fiscal room to invest in human capital, even as poverty deepens.",
      interventionText:
        "Operations combine DPF reforms (VAT modernisation, excise rebalancing, taxpayer registries) with revenue-administration capacity programs — risk-based audit, e-filing, and large-taxpayer units. Programmatic series sustain reforms across political cycles.",
      countryExamples: [
        {
          name: "Sierra Leone",
          flag: "🇸🇱",
          description:
            "The Domestic Revenue Mobilisation DPF series (P168842) modernised VAT and stood up a large-taxpayer unit; risk-based audit lifted compliance among the top-100 taxpayers by 18 percentage points within 12 months.",
        },
        {
          name: "Rwanda",
          flag: "🇷🇼",
          description:
            "The Public Finance Modernisation Project (P175736) deployed e-filing for SMEs in parallel with excise rebalancing, broadening the base before politically harder progressive-rate reforms were attempted.",
        },
      ],
      extraCountryExample: {
        name: "Senegal",
        flag: "🇸🇳",
        description:
          "The Public Finance for Sustainable Development DPF series (P176456) overhauled the taxpayer registry and rolled out e-filing for medium enterprises; VAT compliance among registered firms climbed 14 percentage points in 18 months.",
      },
      extraCountryReasoning:
        "Sierra Leone is the post-conflict starting point; Rwanda the mid-cycle reformer. Senegal closes the maturation curve — its rebased VAT regime sits alongside active tax-administration TA, so the three together trace a full domestic-revenue ramp from baseline to sustained collection.",
      pathways: {
        challenge:
          "IDA economies collect under 15% of GDP in tax revenue, starving public-service delivery despite deepening poverty.",
        wbgApproach:
          "DPF reforms (VAT modernisation, excise rebalancing, taxpayer registries) paired with revenue-administration capacity-building.",
        outcomes:
          "Compliance lifts among the largest taxpayers within 12–18 months; revenue gains create early political wins.",
        longTermImpact:
          "Broader base-broadening and progressive-rate shifts become feasible, lifting tax-to-GDP toward the 15% threshold associated with sustained service delivery.",
      },
      lessonsText:
        "Tax administration reforms move faster than policy reforms because they require fewer veto-point negotiations. Operations that sequenced admin-then-policy outperformed simultaneous-track programs in both ICR ratings and outturn revenue.",
      sourceCounts: { pads: 152, isrs: 1287, icrs: 29 },
    },
    {
      id: "africa-poverty-fragility-displacement",
      marker: "IV",
      title: "Fragility, Conflict & Displacement",
      outcomeArea: { code: "OA-14", label: "Better Lives in FCV" },
      challengeText:
        "Extreme poverty in IDA countries is now concentrated in FCS contexts, where active conflict destroys services, displaces populations for years, and pushes whole regions outside the reach of normal project supervision. Standard delivery models fail in this environment.",
      interventionText:
        "Operations use third-party monitoring, community-driven development modalities, and contingency emergency response components (CERCs) to deliver in active-conflict districts. Multi-Donor Trust Funds and UN-implemented windows extend the operational footprint where direct IDA implementation is infeasible.",
      countryExamples: [
        {
          name: "South Sudan",
          flag: "🇸🇸",
          description:
            "The Productive Safety Net Project (P171177) used third-party monitoring and a community-driven development modality to deliver cash transfers in active-conflict districts beyond the reach of normal IDA supervision.",
        },
        {
          name: "Yemen",
          flag: "🇾🇪",
          description:
            "The Emergency Crisis Response Project (P168538) ran through a UN-implemented window with pre-approved CERCs that activated inside 72 hours of verified humanitarian-access triggers, keeping basic services running through active hostilities.",
        },
      ],
      extraCountryExample: {
        name: "DRC",
        flag: "🇨🇩",
        description:
          "The Eastern Recovery Project (P145196) used third-party monitoring across North Kivu and Ituri; community-driven sub-projects sustained delivery to 720,000 displaced people through repeated security disruptions.",
      },
      extraCountryReasoning:
        "South Sudan and Yemen frame the angle as a Horn-of-Africa / MENAAP story — DRC adds the largest active-conflict portfolio in IDA plus the eastern-Congo IDP corridor, broadening the geographic spread so the angle doesn't read as a single-region case.",
      pathways: {
        challenge:
          "Active conflict destroys services and displaces populations, pushing whole regions outside normal IDA supervision.",
        wbgApproach:
          "Third-party monitoring, community-driven development modalities, and pre-approved CERCs; UN-implemented windows extend the operational footprint.",
        outcomes:
          "Basic services keep running through active hostilities; cash and emergency support reach displaced populations beyond direct IDA reach.",
        longTermImpact:
          "As security windows open, host-country institutions absorb delivery capacity; the long-term system rebuilds even while emergency delivery continues.",
      },
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
      outcomeArea: { code: "OA-3", label: "Healthier Lives" },
      challengeText:
        "FCS countries average 0.8 health workers per 1,000 people — a quarter of WHO's threshold for basic service delivery. Migration of trained staff to higher-income markets and to safer regions within-country compounds the gap, leaving frontline facilities chronically understaffed.",
      interventionText:
        "Operations finance scaled pre-service training, accelerated certification of community health workers, and rural retention packages (housing, hardship pay, rotational promotions). Public-financial-management reforms ringfence the wage bill so payroll stays current even during fiscal stress.",
      countryExamples: [
        {
          name: "Yemen",
          flag: "🇾🇪",
          description:
            "The Emergency Health and Nutrition Project (P161809) accelerated CHW certification across 12 governorates; rural retention packages with hardship pay and rotational promotions added 4,200 net frontline workers across two project cycles.",
        },
        {
          name: "Afghanistan",
          flag: "🇦🇫",
          description:
            "The Sehatmandi Project (P160615) ringfenced the wage bill through PFM-tagged disbursement triggers, so payroll stayed current through the 2021 regime change and the subsequent 18 months of fiscal stress.",
        },
      ],
      extraCountryExample: {
        name: "South Sudan",
        flag: "🇸🇸",
        description:
          "The Provision of Essential Health Services Project (P171821) accelerated CHW certification across Greater Equatoria; rural retention bonuses kept frontline staff in the highest-risk counties through repeated displacement cycles.",
      },
      extraCountryReasoning:
        "Yemen and Afghanistan sit at the bottom of the workforce ladder. South Sudan's 0.3-per-1k density is the most extreme reading in IDA — adding it shows where rural-retention packages held a baseline even when Yemen's collapsed, sharpening the diagnostic.",
      pathways: {
        challenge:
          "FCS countries average 0.8 health workers per 1,000 people; migration of trained staff to higher-income markets compounds the shortfall.",
        wbgApproach:
          "Scaled pre-service training, accelerated CHW certification, rural retention packages, and PFM reforms that ringfence the wage bill.",
        outcomes:
          "Frontline capacity rises in the highest-need districts within 24 months; rural retention shifts net deployment toward underserved regions.",
        longTermImpact:
          "Training-pipeline investments produce a sustainable replacement rate over a 5-year horizon, with payroll discipline preventing workforce attrition.",
      },
      lessonsText:
        "Workforce expansion without simultaneous payroll-management reform reverses within two budget cycles. Operations that paired training with PFM strengthening retained their staffing gains; those that didn't watched the workforce shrink back as wage arrears accumulated.",
      sourceCounts: { pads: 196, isrs: 1748, icrs: 39 },
    },
    {
      id: "health-gap-primary-care-last-mile",
      marker: "II",
      title: "Primary-Care Access at the Last Mile",
      outcomeArea: { code: "OA-3", label: "Healthier Lives" },
      challengeText:
        "Remote and pastoralist communities sit beyond functional referral catchments — so even fully-funded clinics fail to convert into service contacts. Distance, road condition, and the absence of communication channels mean that primary care does not reach those most in need.",
      interventionText:
        "Operations deploy outreach teams on rotational schedules, mobile clinics tied to community health posts, and digital triage tools that let CHWs escalate severe cases to nearby facilities. Performance-based financing redirects resources to underperforming catchments.",
      countryExamples: [
        {
          name: "Mozambique",
          flag: "🇲🇿",
          description:
            "The Primary Health Care Strengthening Project (P163541) deployed rotational outreach teams and mobile clinics tied to community health posts in Niassa and Cabo Delgado, lifting skilled-pregnancy supervision by 22 percentage points in the targeted districts.",
        },
        {
          name: "Sudan",
          flag: "🇸🇩",
          description:
            "The Basic Service Recovery Project (P176919) used performance-based-financing contracts that redirected resources to underperforming catchments and integrated digital triage so CHWs could escalate severe cases inside the existing facility network.",
        },
      ],
      extraCountryExample: {
        name: "Madagascar",
        flag: "🇲🇬",
        description:
          "The Improving Nutrition Outcomes Project (P160848) deployed mobile clinics tied to community health posts in remote highland districts, lifting routine immunisation coverage by 18 percentage points in the targeted catchments.",
      },
      extraCountryReasoning:
        "Mozambique and Sudan are mainland last-mile patterns. Madagascar layered mobile-health-team coverage onto a remote-island geography — distinct logistics constraint, same outcome model, useful third case to show the design's portability.",
      pathways: {
        challenge:
          "Remote and pastoralist communities sit beyond functional referral catchments, so funded clinics fail to convert into service contacts.",
        wbgApproach:
          "Outreach teams on rotational schedules, mobile clinics tied to community health posts, and performance-based financing for underperforming catchments.",
        outcomes:
          "Skilled-pregnancy supervision and routine immunisation coverage rise in the targeted districts.",
        longTermImpact:
          "Digital triage data informs the next infrastructure cycle, converting outreach gains into permanent stationary capacity in newly viable catchments.",
      },
      lessonsText:
        "Mobile-only delivery hits a coverage ceiling without a corresponding stationary backbone. The most cost-effective configurations layered outreach onto a thin but functional facility network; pure mobile programs cost more per contact and produced weaker continuity-of-care.",
      sourceCounts: { pads: 168, isrs: 1492, icrs: 32 },
    },
    {
      id: "health-gap-stunting-nutrition",
      marker: "III",
      title: "Stunting & Nutrition in Children Under-5",
      outcomeArea: { code: "OA-7", label: "Sustainable Food Systems" },
      challengeText:
        "Under-5 stunting in FCS countries sits at 33.6% — locking in cognitive and economic losses that no later-life intervention can fully reverse. The window for prevention is narrow: 1,000 days from conception. After it closes, the deficit becomes permanent.",
      interventionText:
        "Operations integrate growth monitoring, micronutrient supplementation, infant-and-young-child feeding counselling, and WASH improvements at the village level. Cash transfers conditional on growth-monitoring attendance create a steady demand signal for frontline services.",
      countryExamples: [
        {
          name: "Pakistan",
          flag: "🇵🇰",
          description:
            "The National Nutrition Programme (P176497) ran growth monitoring, IYCF counselling, and conditional cash transfers in food-insecure districts of Sindh and Balochistan; stunting prevalence in the targeted districts moved 4.2 percentage points in three years.",
        },
        {
          name: "Bangladesh",
          flag: "🇧🇩",
          description:
            "The Bangladesh Health, Population and Nutrition Sector Programme (P160846) wired together health, WASH, and social-protection delivery channels around the same beneficiary cohort, with fortification embedded in the public distribution system.",
        },
      ],
      extraCountryExample: {
        name: "Yemen",
        flag: "🇾🇪",
        description:
          "The Emergency Health and Nutrition Project (P161809) embedded growth monitoring and IYCF counselling alongside conditional cash transfers in food-insecure governorates; severe acute malnutrition admissions dropped 19% across pilot districts.",
      },
      extraCountryReasoning:
        "Pakistan and Bangladesh trace the chronic-but-improving stunting baseline. Yemen anchors the conflict end of the gradient at 45% prevalence — adding it shows how the same nutrition program design holds even in active-emergency contexts.",
      pathways: {
        challenge:
          "Stunting in FCS sits at 33.6% — inside a narrow 1,000-day prevention window that, once closed, locks in cognitive and economic deficits for life.",
        wbgApproach:
          "Integrated growth monitoring, micronutrient supplementation, IYCF counselling, and village-level WASH — paired with conditional cash transfers.",
        outcomes:
          "Stunting prevalence drops in targeted districts within 3–5 years; growth-monitoring attendance climbs through CCT-driven demand.",
        longTermImpact:
          "Fortification, biofortified staples, and IYCF social-behaviour change embed permanent nutrition gains for successive cohorts.",
      },
      lessonsText:
        "Single-sector nutrition programs underperform; the durable gains come from operations that wired together health, WASH, and social-protection delivery channels around the same beneficiary cohort.",
      sourceCounts: { pads: 134, isrs: 1183, icrs: 26 },
    },
    {
      id: "health-gap-emergency-response",
      marker: "IV",
      title: "Emergency Health Response Capacity",
      outcomeArea: { code: "OA-3", label: "Healthier Lives" },
      challengeText:
        "Recurrent disease outbreaks and crisis episodes overwhelm fragile health systems, eroding gains made during stable years. Without standing surge capacity, each emergency consumes resources that would otherwise fund routine care, generating a long-term coverage deficit.",
      interventionText:
        "Operations finance national emergency operations centres, pre-positioned commodity stockpiles, and pre-approved CERCs that activate within 72 hours of a verified trigger. Training rotations build the surge workforce in advance of need.",
      countryExamples: [
        {
          name: "Myanmar",
          flag: "🇲🇲",
          description:
            "The Essential Health Services Access Project (P165859) pre-positioned commodity stockpiles in five state-level Emergency Operations Centres; surge-workforce training kept response times under 14 days during dengue and cholera outbreaks.",
        },
        {
          name: "South Sudan",
          flag: "🇸🇸",
          description:
            "The Provision of Essential Health Services Project (P171821) standardised pre-approved CERCs across humanitarian partners, so each outbreak response activated inside 72 hours of trigger rather than requiring fresh approval.",
        },
      ],
      extraCountryExample: {
        name: "Afghanistan",
        flag: "🇦🇫",
        description:
          "The Sehatmandi Project (P160615) standardised pre-approved CERCs with humanitarian partners; the 2022 Helmand cholera response activated inside 96 hours rather than the typical multi-week lead time.",
      },
      extraCountryReasoning:
        "Myanmar and South Sudan are failed-state responses where direct delivery broke down. Afghanistan's post-2021 third-party-monitored model is the direct contrast case — shows emergency continuity is achievable when IDA can route around the sovereign.",
      pathways: {
        challenge:
          "Recurrent outbreaks and crises overwhelm fragile health systems, consuming routine budget and eroding gains made during stable years.",
        wbgApproach:
          "National emergency operations centres, pre-positioned commodity stockpiles, pre-approved CERCs, and standing surge-workforce training.",
        outcomes:
          "Response times drop from weeks to under 96 hours; outbreaks no longer cannibalise routine-care budgets.",
        longTermImpact:
          "EOCs evolve into institutional homes for outbreak preparedness, surveillance, and cross-border coordination.",
      },
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
      outcomeArea: { code: "OA-9", label: "Energy for All" },
      challengeText:
        "78 million households in IDA FCS countries remain unconnected. Last-mile grid economics fall apart at low population densities, and insecurity premiums on construction contracts often double the per-connection cost — so each new kilometre of line covers fewer households than budgeted.",
      interventionText:
        "Operations finance medium-voltage backbone investments paired with prepaid metering rollouts and densification programs to make new connections financially sustainable. Risk-mitigation guarantees attract private contractors into high-insecurity districts.",
      countryExamples: [
        {
          name: "DRC",
          flag: "🇨🇩",
          description:
            "The Electricity Access and Services Expansion Project (P166143) financed medium-voltage backbone investment paired with densification across Kinshasa peri-urban; risk-mitigation guarantees attracted private contractors into Kasai districts otherwise priced out by insecurity premiums.",
        },
        {
          name: "Chad",
          flag: "🇹🇩",
          description:
            "The Chad Electricity Sector Reform Project (P170305) bundled prepaid metering rollout with backbone extension to make new connections cost-recoverable for the utility; the per-connection cost gap closed within four years.",
        },
      ],
      extraCountryExample: {
        name: "Niger",
        flag: "🇳🇪",
        description:
          "The Niger Solar Electricity Access Project (P160796) financed peri-urban backbone extension into Niamey's eastern districts; densification investments closed the per-connection cost gap inside three years.",
      },
      extraCountryReasoning:
        "DRC and Chad are central-Africa grid extensions. Niger's Kandadji corridor brings a Sahelian utility profile to the angle — completes the geographic spread for utility-led IDA energy operations in fragile states.",
      pathways: {
        challenge:
          "78M FCS households remain unconnected; last-mile grid economics break down at low density and insecurity premiums double per-connection cost.",
        wbgApproach:
          "Medium-voltage backbone investment paired with densification programs, prepaid metering rollouts, and risk-mitigation guarantees for contractors.",
        outcomes:
          "Connection volumes climb in peri-urban densification zones; per-connection cost gaps close within 3–4 years.",
        longTermImpact:
          "Utility commercial viability funds the next round of densification autonomously; connection-rate trajectories become self-sustaining.",
      },
      lessonsText:
        "Connection-rate programs that skipped densification — leaving the new backbone underused — failed to recover costs. The operations that paired extension with active densification investments closed the per-connection cost gap within 3–4 years.",
      sourceCounts: { pads: 184, isrs: 1568, icrs: 31 },
    },
    {
      id: "electricity-fcs-off-grid-solar",
      marker: "II",
      title: "Off-Grid & Mini-Grid Solar",
      outcomeArea: { code: "OA-9", label: "Energy for All" },
      challengeText:
        "Distributed solar can leapfrog the grid for scattered settlements, but financing, maintenance, and tariff models stall pilots before they scale. Most pilots prove technical feasibility and then collapse as soon as project subsidies end and a real cost-recovery model is required.",
      interventionText:
        "Operations underwrite results-based subsidies tied to verified connections, blended finance for mini-grid developers, and consumer-finance instruments that move solar systems out of cash-only sale. Regulatory work codifies mini-grid tariff structures and arrival-of-grid compensation rules.",
      countryExamples: [
        {
          name: "Nigeria",
          flag: "🇳🇬",
          description:
            "The Nigeria Electrification Project (P161885) underwrote results-based subsidies tied to verified household connections, paired with consumer-finance instruments that moved solar systems out of cash-only sale across 250,000 households.",
        },
        {
          name: "Burkina Faso",
          flag: "🇧🇫",
          description:
            "The Yeleen Rural Electrification Project (P164451) standardised mini-grid tariff structures and grid-arrival compensation rules; private developers signed in once the regulatory exit path was predictable.",
        },
      ],
      extraCountryExample: {
        name: "Madagascar",
        flag: "🇲🇬",
        description:
          "The Madagascar Least-Cost Electrification Project (P163870) standardised mini-grid tariff and concession rules; private developers signed nine concessions in the year after the regulatory framework was adopted.",
      },
      extraCountryReasoning:
        "Nigeria covers the dense-distribution model; Burkina Faso the Sahelian-village pattern. Madagascar scales the off-grid model to an island geography — so the angle covers all three off-grid contexts.",
      pathways: {
        challenge:
          "Distributed solar pilots prove technical feasibility but collapse when project subsidies end and real cost-recovery is required.",
        wbgApproach:
          "Results-based subsidies tied to verified connections, blended finance for mini-grid developers, and standardised tariff + grid-arrival regulation.",
        outcomes:
          "Private developers commit capital once the regulatory exit path is predictable; verified connections scale across hundreds of thousands of households per program.",
        longTermImpact:
          "WBG financing shifts from subsidy to risk-sharing and eventually exits the segment; private capital sustains delivery without concessional support.",
      },
      lessonsText:
        "Pilots without a tariff and grid-arrival regulatory framework died on contact with the grid. The successful programs front-loaded the regulatory work so private developers had a predictable exit path before sinking capital.",
      sourceCounts: { pads: 162, isrs: 1432, icrs: 28 },
    },
    {
      id: "electricity-fcs-affordability-tariff",
      marker: "III",
      title: "Affordability & Tariff Reform",
      outcomeArea: { code: "OA-9", label: "Energy for All" },
      challengeText:
        "Cost-recovery tariffs price the poorest customers out, while subsidised tariffs hollow out utility balance sheets — and neither path delivers the connection-rate targets the country is committed to. Tariff reform sits at the centre of every sector recovery program but is politically the hardest piece.",
      interventionText:
        "Operations design lifeline-block tariffs, targeted social tariffs delivered via the social registry, and explicit subsidy budgeting through the public-financial-management system. Communications campaigns prepare the political ground before published-tariff increases.",
      countryExamples: [
        {
          name: "Mali",
          flag: "🇲🇱",
          description:
            "The Mali Electricity Sector Improvement DPF series (P166796) introduced lifeline-block tariffs delivered via the social registry; politically necessary average-tariff increases passed once household protection was visible to constituents.",
        },
        {
          name: "Madagascar",
          flag: "🇲🇬",
          description:
            "The Madagascar Electricity Sector Operations Project (P163870) explicitly budgeted the cross-subsidy through the PFM system, stabilising utility working capital within 18 months and freeing reinvestment into service quality.",
        },
      ],
      extraCountryExample: {
        name: "Senegal",
        flag: "🇸🇳",
        description:
          "The Senegal Electricity Sector Support DPF (P162289) introduced targeted lifeline-block tariffs via the social registry; politically necessary cost-recovery increases passed once household protection was visible to constituents.",
      },
      extraCountryReasoning:
        "Mali and Madagascar are mid-reform — tariff structures still in flux. Senegal's lifeline-tariff cross-subsidy is the most mature pro-poor design in IDA energy — adding it shows what the destination state looks like once the reform lands.",
      pathways: {
        challenge:
          "Cost-recovery tariffs price the poorest out; subsidised tariffs hollow out utility balance sheets — neither path hits connection-rate targets.",
        wbgApproach:
          "Lifeline-block tariffs and social-registry-delivered targeted subsidies, with cross-subsidy budgeting through the PFM system.",
        outcomes:
          "Politically necessary cost-recovery increases pass once household protection is visible; utility working capital stabilises within 18–24 months.",
        longTermImpact:
          "Healthier utility balance sheets fund service-quality investments, breaking the affordability/sustainability bind that previously stalled sector recovery.",
      },
      lessonsText:
        "Tariff reforms that bundled poor-household protection with the price increase passed; those that proposed naked cost-recovery reform without targeted offsets were reversed at the first political pressure point.",
      sourceCounts: { pads: 147, isrs: 1289, icrs: 24 },
    },
    {
      id: "electricity-fcs-climate-resilient-generation",
      marker: "IV",
      title: "Climate-Resilient Generation Capacity",
      outcomeArea: { code: "OA-5", label: "Green & Blue Planet" },
      challengeText:
        "Hydro-dependent grids face dry-season collapse and flood damage to dam and transmission infrastructure. Climate variability — both droughts and intense storms — is now the dominant risk to generation reliability, even more than fuel-price volatility.",
      interventionText:
        "Operations diversify generation toward solar-and-storage and run-of-river hydro paired with storage; harden transmission corridors against flood and wind; and finance regional interconnections so that dry-season deficits in one country can be covered by neighbouring surpluses.",
      countryExamples: [
        {
          name: "Mozambique",
          flag: "🇲🇿",
          description:
            "The Mozambique Energy for All Project (P172409) diversified generation toward solar-with-storage paired with run-of-river hydro; transmission hardening against cyclonic flood became a portfolio-wide standard after Cyclones Idai and Kenneth.",
        },
        {
          name: "Zambia",
          flag: "🇿🇲",
          description:
            "The Zambia Electricity Service Access Project (P162760) financed regional interconnection so dry-season hydro deficits could be covered by neighbouring surpluses through the Southern African Power Pool.",
        },
      ],
      extraCountryExample: {
        name: "Malawi",
        flag: "🇲🇼",
        description:
          "The Malawi Electricity Access Project (P164242) diversified generation toward solar-with-storage; transmission corridors were hardened against cyclonic flood after Cyclone Freddy exposed system-wide vulnerabilities.",
      },
      extraCountryReasoning:
        "Mozambique's coastal grid and Zambia's drought-affected mix frame the cyclone and rainfall lenses. Malawi adds the hydropower-resilience case — together the three give a clear gradient of climate-vulnerability profiles for the same generation problem.",
      pathways: {
        challenge:
          "Hydro-dependent grids face dry-season collapse and flood damage; climate variability now drives generation risk more than fuel-price swings.",
        wbgApproach:
          "Solar-and-storage diversification, hardened transmission corridors, and regional interconnections so dry-season deficits become tradable surpluses.",
        outcomes:
          "Seasonal generation gaps shrink; interconnections convert national crises into regional trade flows.",
        longTermImpact:
          "Storage investments make a high variable-renewable share manageable for system operators, locking in long-term grid resilience against climate volatility.",
      },
      lessonsText:
        "Operations that financed only generation without simultaneously upgrading transmission and interconnection capacity saw new capacity stranded behind congested corridors. The most resilient grids invested in generation, transmission, and storage as a single integrated portfolio.",
      sourceCounts: { pads: 209, isrs: 1856, icrs: 38 },
    },
  ],
} as const;

// New non-narrative flows (Compare results / Explore an indicator) reuse the
// closest existing skeleton set so the "Create narrative" path still works
// from these conversations without requiring four fully-authored angles per
// new flow. fy24-fy25-delta is people-pillar oriented → africa-poverty.
// hnp-measurement is health-domain oriented → health-gap.
export const FLOW_SKELETONS = {
  ...BASE_FLOW_SKELETONS,
  "fy24-fy25-delta": BASE_FLOW_SKELETONS["africa-poverty"],
  "hnp-measurement": BASE_FLOW_SKELETONS["health-gap"],
} satisfies Record<FlowId, NarrativeSkeletonSet>;
