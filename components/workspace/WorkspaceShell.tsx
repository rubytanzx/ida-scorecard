"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Node } from "reactflow";
import CanvasLoader from "./CanvasLoader";
import FloatingSidebar from "./FloatingSidebar";
import FloatingTitle from "./FloatingTitle";
import FloatingActions from "./FloatingActions";
import FloatingControls from "./FloatingControls";
import RightNavDots from "./RightNavDots";
import PromptBar from "./PromptBar";
import AIChatPanel from "./AIChatPanel";
import { USER_MESSAGE, TYPING_MESSAGE, AI_MESSAGE } from "@/data/mockInteraction";
import type { Message } from "@/data/mockInteraction";

const CARD_NAME_MAP: Record<string, string> = {
  "card-overview": "Overview",
  "card-narrative": "AI Narrative Assistant",
  "card-news": "News",
};

// Outcome area cards — placed in a column to the right of the OverviewCard (x:80, w:1200)
const OUTCOME_X = 1360;
// Data drill-down cards — placed to the right of the outcome column
const DATA_CARD_X = 1860;

const DATA_CARDS = [
  {
    id: "data-social-protection",
    chartType: "socialProtection",
    title: "Percentage of people covered by social protection and labor programs in the total population and in the poorest quintile",
    description: "People covered by social protection and labor programs (SPL) refers to members of a household where at least one member received benefits. SPL includes social assistance, social insurance, and labor market programs.",
    category: "Protection for the Poorest",
    y: 40,
  },
  {
    id: "data-financial-accounts",
    chartType: "financialAccounts",
    title: "Population that own a financial account, total (% population ages 15+) and female (% female population ages 15+)",
    description: "Percentage of population that own a financial account. For women, the share is relative to total female population.",
    category: "Gender Equality",
    y: 820,
  },
  {
    id: "data-safety-net",
    chartType: "safetyNet",
    title: "Beneficiaries of social safety net programs",
    description: "The number of people benefiting from safety net programs supported by World Bank operations, including cash-based interventions, public works and workfare programs, fee waivers, and in-kind assistance.",
    category: "Protection for the Poorest",
    portfolioText: "More than <strong>230</strong> projects in <strong>91</strong> countries/economies",
    y: 1600,
  },
  {
    id: "data-financial-services",
    chartType: "financialServices",
    title: "People and businesses using financial services, including the number of women",
    description: "Financial services include transaction accounts, deposit accounts, mobile money accounts, savings, loans, insurance, pensions, factoring, leasing, and investment products.",
    category: "Protection for the Poorest",
    portfolioText: "More than <strong>210</strong> projects in <strong>88</strong> countries/economies",
    y: 2380,
  },
  {
    id: "data-gender-equality",
    chartType: "genderEquality",
    title: "People benefiting from actions to advance gender equality, and the number benefitting from actions that expand and enable economic opportunities",
    description: "Gender equality outcomes include ending gender-based violence, building and protecting human capital, accessing more and better jobs, expanding ownership and use of assets, expanding access and use of services that enable economic participation and advancing women's leadership.",
    category: "Gender Equality",
    portfolioText: "More than <strong>830</strong> projects in <strong>121</strong> countries/economies",
    y: 3160,
  },
  {
    id: "data-private-capital",
    chartType: "privateCapital",
    title: "Total private capital enabled",
    description: "Value of private investments resulting from WBG programs expected to materialize within three years of a project's closure.",
    category: "More Private Investments",
    portfolioText: "More than <strong>150</strong> projects in <strong>100</strong> countries/economies",
    y: 4040,
  },
];

// bodyMinHeight pre-reserves the paragraph height so the card doesn't grow during
// streaming and overlap the card below. Uses ceil(chars / 40) * 24px (conservative:
// 40 chars/line at 16px Open Sans across 361px text width).
// Card total height = 209 + titleLines*28 + bodyMinHeight (includes nav buttons row).
// Y positions = y_prev + cardHeight + 60px gap.
const OUTCOME_DATA = [
  {
    id: "outcome-1",
    title: "Protection for Poorest\n(Financial Inclusion / Social Protection)",
    body: "Mexico has the widest financial inclusion gap in the peer group, with only 53% of adults owning a financial account against Chile's 85% and Brazil's 86%. The gender gap is acute — female ownership sits at 47%, nearly 36 points below Chile. On social protection, Mexico covers just 48% of its total population and 54% of its poorest quintile, compared to 96% in both Chile and Peru. Despite the scale of these gaps, the WB portfolio in Mexico records zero contribution to social safety net outcomes and zero results on financial services — the sole active vehicle, the Mexico DPF (P503988), shows no achieved values on any related indicator. This is the highest-priority gap both structurally and in terms of portfolio absence.",
    bodyMinHeight: 432, // 18 lines × 24px
    y: 40,             // card height ≈ 756px (182+56+432+86nav)
    navLabels: {
      left:  "Back to scorecard overview",
      down:  "Why is learning poverty so high?",
      right: "Unpack Mexico's DPF results",
    },
  },
  {
    id: "outcome-2",
    title: "No Learning Poverty",
    body: "Mexico's learning poverty rate of 47.6% places nearly half of all primary-age children below reading proficiency — a 20-point gap to Chile (27.2%) and 5 points worse than the peer average of 42.5%. Given Mexico's population of ~130 million, this translates into the largest absolute number of affected children among all comparators. The data is from 2019 and may understate post-pandemic deterioration. Critically, the WB has no active operations in Mexico contributing to this outcome area — zero projects, zero students supported — while Brazil alone has 6 education projects with 48 million students in scope.",
    bodyMinHeight: 384, // 16 lines × 24px
    y: 880,            // 40 + 756 + 84 gap
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "Financial inclusion & social protection",
      down:  "How does Mexico's health coverage compare?",
      right: "See how Brazil's education portfolio scales",
    },
  },
  {
    id: "outcome-3",
    title: "Healthier Lives (UHC + Stunting)",
    body: "Mexico's UHC Service Coverage Index of 75 sits 7 points below Chile and 5 points below both Brazil and Colombia, placing it near the bottom of the peer group. More starkly, Mexico's child stunting rate of 13.1% is the highest in the group by a significant margin — more than 11 points above Chile (1.7%) and 4 points above Brazil (8.9%) — a figure that is anomalous for an upper-middle-income country. As with education, the WB holds no active operations contributing to health outcomes in Mexico under FY25 Scorecard reporting, while Colombia's 2 health projects are delivering results to over 760,000 people. The combination of a weak UHC index, high stunting, and zero portfolio engagement makes this a significant gap.",
    bodyMinHeight: 432, // 18 lines × 24px
    y: 1680,           // 880 + 714 + 86 gap
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "Learning poverty & education gap",
      down:  "Is Mexico's climate portfolio heading the right way?",
      right: "Break down stunting by region",
    },
  },
  {
    id: "outcome-4",
    title: "Climate / Green Planet\n(GHG + Protected Areas)",
    body: "Mexico's protected area coverage of 19.9% lags Chile (37.9%), Brazil (29.4%), and Colombia (26.4%), though Peru (16.8%) is lower. The more acute concern is the direction of Mexico's climate portfolio: Mexico is the only country in the peer group with a net emissions-increasing portfolio expectation (+19 MtCO2eq/year), driven by a single large project — Water Security for the Valley of Mexico — which offsets reductions from forestry and energy efficiency operations. All peers show net reductions, with Brazil at −323 MtCO2eq/year across 19 projects. On the positive side, Mexico's terrestrial conservation results are among the strongest delivered in the portfolio, with three projects meeting or exceeding targets. The critical gap is on renewable energy: Mexico has zero operations in this space while Brazil, Chile, and Peru all have active projects.",
    bodyMinHeight: 480, // 20 lines × 24px
    y: 2520,           // 1680 + 762 + 78 gap
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "UHC, stunting & health outcomes",
      down:  "What's driving the digital exclusion gap?",
      right: "Map the renewable energy gap",
    },
  },
  {
    id: "outcome-5",
    title: "Digital / Financial Services",
    body: "Mexico's internet penetration of 81.2% is below Chile (94.5%) but broadly comparable to Brazil and Peru, suggesting digital infrastructure is not the binding constraint. The more significant finding is the disconnect between relatively high connectivity and very low financial account ownership (53%) — a 28-point gap — which points to barriers of product design, trust, or formal sector access rather than infrastructure. The WB portfolio has no active operations contributing to digital services or broadband outcomes in Mexico, while Brazil and Peru both have projects in scope. The Mexico DPF nominally covers financial services but has recorded no results to date.",
    bodyMinHeight: 384, // 16 lines × 24px
    y: 3440,           // 2520 + 838 + 82 gap
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "Climate portfolio & protected areas",
      right: "Map digital wallet adoption by state",
    },
  },
];

interface Props {
  empty?: boolean;
  prebuilt?: boolean;
}

function buildAllNodes(onShowOutcomeAreas: () => void, onShowDataCards?: () => void): Node[] {
  const overviewNode: Node = {
    id: "card-overview", type: "overview", position: { x: 80, y: 40 },
    data: { onShowOutcomeAreas }, draggable: true, selectable: true,
  };
  const narrativeNode: Node = {
    id: "card-narrative", type: "narrative", position: { x: 80, y: 760 },
    data: {}, draggable: true, selectable: true,
  };
  const newsNode: Node = {
    id: "card-news", type: "news", position: { x: 540, y: 760 },
    data: {}, draggable: true, selectable: true,
  };
  const outcomeNodes: Node[] = OUTCOME_DATA.map((item, i) => ({
    id: item.id,
    type: "outcomeArea",
    position: { x: OUTCOME_X, y: item.y },
    data: {
      title: item.title,
      body: item.body,
      bodyMinHeight: item.bodyMinHeight,
      streamDelay: 0,
      index: i,
      totalCards: OUTCOME_DATA.length,
      navLabels: item.navLabels,
      ...(item.id === "outcome-1" ? { onNavDown: onShowDataCards } : {}),
    },
    draggable: true,
    selectable: false,
  }));
  return [overviewNode, narrativeNode, newsNode, ...outcomeNodes];
}

export default function WorkspaceShell({ empty = false, prebuilt = false }: Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(prebuilt ? [USER_MESSAGE, AI_MESSAGE] : []);
  const [canvasNodes, setCanvasNodes] = useState<Node[]>([]);
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const [canvasLoading, setCanvasLoading] = useState(false);
  const [promptBarHeight, setPromptBarHeight] = useState(56); // single-line default
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [outcomeCardsShown, setOutcomeCardsShown] = useState(prebuilt);
  const [dataCardsShown, setDataCardsShown] = useState(prebuilt);
  const ran = useRef(prebuilt);

  const handleCardSelect = (nodeId: string | null) => {
    setSelectedCard(nodeId ? (CARD_NAME_MAP[nodeId] ?? null) : null);
  };

  const handleShowOutcomeAreas = useCallback(() => {
    setOutcomeCardsShown(true);
  }, []);

  const handleShowDataCards = useCallback(() => {
    setDataCardsShown(true);
  }, []);

  // Seed all nodes immediately when prebuilt
  useEffect(() => {
    if (!prebuilt) return;
    setCanvasNodes(buildAllNodes(handleShowOutcomeAreas, handleShowDataCards));
    setFitViewTrigger((t) => t + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prebuilt]);

  // Add outcome area nodes when triggered
  useEffect(() => {
    if (!outcomeCardsShown) return;
    const outcomeNodes: Node[] = OUTCOME_DATA.map((item, i) => ({
      id: item.id,
      type: "outcomeArea",
      position: { x: OUTCOME_X, y: item.y },
      data: {
        title: item.title,
        body: item.body,
        bodyMinHeight: item.bodyMinHeight,
        streamDelay: i * 300,
        index: i,
        totalCards: OUTCOME_DATA.length,
        navLabels: item.navLabels,
        // Wire "down" nav on outcome-1 (Protection for Poorest) to reveal data cards
        ...(item.id === "outcome-1" ? { onNavDown: handleShowDataCards } : {}),
      },
      draggable: true,
      selectable: false,
    }));
    setCanvasNodes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNodes = outcomeNodes.filter((n) => !existingIds.has(n.id));
      return newNodes.length > 0 ? [...prev, ...newNodes] : prev;
    });
  }, [outcomeCardsShown, handleShowDataCards]);

  // Add data drill-down cards when triggered
  useEffect(() => {
    if (!dataCardsShown) return;
    const dataNodes: Node[] = DATA_CARDS.map((card) => ({
      id: card.id,
      type: "dataCard",
      position: { x: DATA_CARD_X, y: card.y },
      data: {
        title: card.title,
        description: card.description,
        category: card.category,
        chartType: card.chartType,
        portfolioText: card.portfolioText,
      },
      draggable: true,
      selectable: false,
    }));
    setCanvasNodes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNodes = dataNodes.filter((n) => !existingIds.has(n.id));
      return newNodes.length > 0 ? [...prev, ...newNodes] : prev;
    });
  }, [dataCardsShown]);

  // chatBottom = PROMPT_BOTTOM(22) + promptBarHeight + PILLS_GAP(30) + pills_h(34) + PILLS_GAP(30)
  // Equal 30px gaps above and below pills. Add BANNER_H(48) when a card is selected.
  const chatBottom = promptBarHeight + 116 + (selectedCard ? 48 : 0);

  const handleUserSubmit = (text: string) => {
    if (ran.current) return;
    ran.current = true;

    const userMsg: Message = { ...USER_MESSAGE, content: text };

    setChatOpen(true);
    setMessages([userMsg]);

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Typing/reasoning starts immediately
    setMessages((m) => [...m, TYPING_MESSAGE]);
    setCanvasLoading(true);

    const overviewNode: Node = {
      id: "card-overview", type: "overview", position: { x: 80, y: 40 },
      data: { onShowOutcomeAreas: handleShowOutcomeAreas }, draggable: true, selectable: true,
    };
    const narrativeNode: Node = {
      id: "card-narrative", type: "narrative", position: { x: 80, y: 760 },
      data: {}, draggable: true, selectable: true,
    };
    const newsNode: Node = {
      id: "card-news", type: "news", position: { x: 540, y: 760 },
      data: {}, draggable: true, selectable: true,
    };

    // Cards appear after reasoning completes (~2200ms into ReasoningAnimation)
    timers.push(setTimeout(() => setCanvasNodes([overviewNode]),                              2300));
    timers.push(setTimeout(() => setCanvasNodes([overviewNode, narrativeNode]),              2600));
    timers.push(setTimeout(() => setCanvasNodes([overviewNode, narrativeNode, newsNode]),    2900));

    timers.push(setTimeout(() => {
      setFitViewTrigger((t) => t + 1);
      setCanvasLoading(false);
    }, 3200));

    // AI response replaces reasoning
    timers.push(setTimeout(() => {
      setMessages((m) => [...m.filter((msg) => msg.role !== "typing"), AI_MESSAGE]);
    }, 3800));

    return () => timers.forEach(clearTimeout);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        fontFamily: "'Open Sans', sans-serif",
        background: "#FFFFFF",
      }}
    >
      <CanvasLoader nodes={canvasNodes} fitViewTrigger={fitViewTrigger} loading={canvasLoading} onCardSelect={handleCardSelect} />
      <FloatingSidebar />
      <FloatingTitle initialTitle={empty ? "" : undefined} />
      <FloatingActions />
      <FloatingControls />
      <RightNavDots />
      <PromptBar onSubmit={handleUserSubmit} onHeightChange={setPromptBarHeight} selectedCard={selectedCard} onClearSelection={() => setSelectedCard(null)} />
      <AIChatPanel open={chatOpen} messages={messages} chatBottom={chatBottom} />
    </div>
  );
}
