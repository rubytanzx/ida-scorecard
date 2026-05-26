"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconSparkles, IconX, IconArrowUp, IconPlus,
  IconPaperclip, IconPhoto, IconPlugConnected,
  IconChevronRight, IconSettings, IconTool,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { MCP_CONNECTORS } from "@/data/mockInteraction";
import AppHeader from "@/components/AppHeader";
import SearchHero from "@/components/SearchHero";
import AppFooter from "@/components/AppFooter";
import StoryDetailModal from "@/components/StoryDetailModal";
import ConversationView from "@/components/conversation/ConversationView";
import NarrativePanel, { NARRATIVE_PANEL_DEFAULT_WIDTH } from "@/components/conversation/NarrativePanel";
import InfographicPanel from "@/components/conversation/InfographicPanel";
import SkeletonPreviewPanel from "@/components/conversation/SkeletonPreviewPanel";
import { detectFlow } from "@/components/conversation/ConversationView";
import { FLOW_SKELETONS } from "@/components/conversation/NarrativeSkeletons";
import ViewerView from "@/components/conversation/ViewerView";
import WorkspaceView from "@/components/conversation/WorkspaceView";
import PromptBar from "@/components/PromptBar";
import IndicatorTicker from "@/components/IndicatorTicker";
import TrendingAcrossIDA from "@/components/TrendingAcrossIDA";
import MomentumGroups from "@/components/MomentumGroups";
import FeaturedNarratives from "@/components/FeaturedNarratives";
import CounterIntuitiveFindings from "@/components/CounterIntuitiveTextCard";
import OutcomeAreaGrid from "@/components/SystemPatternTile";

import { indicators, secondaryStories } from "@/lib/mockData";

// First ~6 words of the prompt as a working title.
function deriveArtefactTitle(prompt: string): string {
  if (!prompt.trim()) return "";
  const words = prompt.trim().replace(/[?!.]+$/g, "").split(/\s+/).slice(0, 7);
  let t = words.join(" ");
  if (t.length > 56) t = t.slice(0, 56) + "…";
  return t;
}

// ─── Chat menu helpers ────────────────────────────────────────────────────────

const F = "'Open Sans', sans-serif";

const CONNECTOR_META: Record<string, { color: string; initial: string }> = {
  "wbg-scorecard": { color: "#003366", initial: "WB"  },
  "ifc":           { color: "#F5A623", initial: "IFC" },
  "miga":          { color: "#1565C0", initial: "M"   },
  "wb-operations": { color: "#0288D1", initial: "OP"  },
  "wdi":           { color: "#2E7D32", initial: "WD"  },
  "cpf":           { color: "#6A1B9A", initial: "CP"  },
  "open-data":     { color: "#C62828", initial: "OD"  },
};

const menuShell: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

const menuRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "9px 14px", cursor: "pointer",
  transition: "background 0.1s", userSelect: "none",
};

function ChatToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? "#0b6fd3" : "#D1D5DB",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background 0.18s",
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.18s",
      }} />
    </div>
  );
}

function ChatConnectorIcon({ id }: { id: string }) {
  const meta = CONNECTOR_META[id] ?? { color: "#616161", initial: "?" };
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 7, background: meta.color,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontFamily: F, fontSize: 8, fontWeight: 700, color: "#FFFFFF", letterSpacing: 0.2 }}>
        {meta.initial}
      </span>
    </div>
  );
}

// ─── Fade-in on scroll ────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AI_SUGGESTIONS = [
  "Which outcome areas have the biggest gaps vs. LAC peers?",
  "What's driving Mexico's learning poverty rate?",
  "Show me WB projects contributing to health outcomes",
];

// State machine for the narrative creation flow:
//   idle              — nothing happening yet
//   planning          — AI thinking; planning steps animate in
//   skeleton-ready    — 4 angle cards shown; user picks one
//   refining          — user clicked "Make changes" in preview; prompt-bar
//                       shows a reference chip and accepts feedback
//   refined-ready     — refined-skeleton widget shown inline; user can
//                       Proceed or iterate ("Make changes" again)
//   interactive-choice — AI asks which interactive elements to include;
//                       user multi-selects chips, then Proceeds
//   generating        — opening the final NarrativePanel
export type NarrativePhase =
  | "idle"
  | "planning"
  | "skeleton-ready"
  | "refining"
  | "refined-ready"
  | "interactive-choice"
  | "generating";

export type InteractiveElement = "map" | "charts" | "tables" | "timeline";

export default function HomePage() {
  const [modalStory, setModalStory] = useState<(typeof secondaryStories)[0] | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  // Conversation flow: "home" → user submits → 3s beam → "conversation".
  // The shared PromptBar stays mounted; only its `mode` prop changes, so
  // it animates from hero-center to bottom-fixed.
  const [view, setView] = useState<"home" | "conversation" | "workspace" | "viewer">("home");
  const [conversationPrompt, setConversationPrompt] = useState("");
  const [promptValue, setPromptValue] = useState("");
  // Single discriminator for which right-side artefact pane is open.
  // null = closed; only one pane can be visible at a time.
  type RightPane = "narrative" | "infographic" | "skeleton-preview" | null;
  const [rightPane, setRightPane] = useState<RightPane>(null);
  const [rightPaneWidth, setRightPaneWidth] = useState(NARRATIVE_PANEL_DEFAULT_WIDTH);
  const [rightPaneDragging, setRightPaneDragging] = useState(false);
  const [narrativePhase, setNarrativePhase] = useState<NarrativePhase>("idle");
  const [selectedSkeletonId, setSelectedSkeletonId] = useState<string | null>(null);
  // Which skeleton is being previewed in the right pane (null when no preview open).
  const [previewSkeletonId, setPreviewSkeletonId] = useState<string | null>(null);
  // Which skeleton the user is currently refining via "Make changes". Drives
  // both the reference chip in the prompt bar and the refined-widget content.
  const [refiningSkeletonId, setRefiningSkeletonId] = useState<string | null>(null);
  // History of refinement turns — each entry is the text the user submitted.
  // Renders as user-bubble + AI-response + refined-skeleton widget per turn.
  const [refinementTurns, setRefinementTurns] = useState<string[]>([]);
  // Interactive-elements multi-select. Persists after Proceed so generated
  // narratives could (later) branch on it.
  const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([]);
  // True when the user clicked "Create a narrative" on the landing page —
  // adds a tag to the prompt bar and routes submits straight into the
  // narrative-creation flow (skipping the AI Q&A response in conversation).
  const [createNarrativeMode, setCreateNarrativeMode] = useState(false);
  // Conversation ids that bypass the AI Q&A response and start directly in
  // the planning phase (landing-page "Create a narrative" entry point).
  const [narrativeDirectConversations, setNarrativeDirectConversations] = useState<Set<string>>(
    new Set(),
  );
  const [narrativePanelLoading, setNarrativePanelLoading] = useState(false);
  // True for ~3.5s after the user picks "Generate · Infographic" —
  // drives the beam + cycling text loader inside the infographic pane.
  const [infographicGenerating, setInfographicGenerating] = useState(false);
  // When a kind that already exists is picked from the Generate menu, we
  // open a confirm dialog instead of regenerating immediately. null = no
  // dialog open; otherwise the kind being asked about.
  const [regenerateConfirm, setRegenerateConfirm] = useState<string | null>(null);
  const [homeScrolled, setHomeScrolled] = useState(false);
  const homeScrollRef = useRef<HTMLDivElement>(null);
  // Stored handle for the post-confirm animation delay so future readers
  // know it's intentional and can cancel if navigation patterns change.
  const narrativeConfirmTimerRef = useRef<number | null>(null);

  // Track home-page scroll so the prompt bar can dock at the bottom once the
  // user moves past the hero. Listen on both the inner overflow-y-auto
  // container and the window so it works regardless of the scroll target.
  useEffect(() => {
    if (view !== "home") return;
    const THRESHOLD = 80;
    const check = () => {
      const inner = homeScrollRef.current;
      const innerTop = inner?.scrollTop ?? 0;
      const winTop = typeof window !== "undefined"
        ? (window.scrollY || document.documentElement.scrollTop || 0)
        : 0;
      setHomeScrolled(Math.max(innerTop, winTop) > THRESHOLD);
    };
    check();
    const inner = homeScrollRef.current;
    inner?.addEventListener("scroll", check, { passive: true });
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      inner?.removeEventListener("scroll", check);
      window.removeEventListener("scroll", check);
    };
  }, [view]);

  // Conversations + artefacts — each conversation owns its own artefacts list.
  // `kind` discriminates which right-side pane to open when re-selected.
  interface Artefact {
    id: string;
    kind: "narrative" | "infographic";
    title: string;
    prompt: string;
    createdAt: number;
    /** Which narrative-angle skeleton the user picked (narrative artefacts only). */
    skeletonId?: string;
  }
  interface Conversation {
    id: string;
    title: string;
    prompt: string;
    createdAt: number;
    artefacts: Artefact[];
  }
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const currentArtefacts = currentConversation?.artefacts ?? [];

  const handleSearchComplete = (text: string) => {
    const id = Date.now().toString();
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: deriveArtefactTitle(text) || "Untitled query",
        prompt: text,
        createdAt: Date.now(),
        artefacts: [],
      },
    ]);
    setCurrentConversationId(id);
    setConversationPrompt(text);
    setPromptValue("");        // empty the bar for follow-up questions
    setView("conversation");
    setHomeScrolled(false);    // reset for when we return home
  };

  // Landing-page "Create a narrative" pill → arms the create-narrative tag
  // on the prompt bar so the next submit routes through the direct path.
  const handleArmCreateNarrative = () => {
    setCreateNarrativeMode(true);
  };

  // The user submitted while the create-narrative tag was on. Skip the AI
  // Q&A response in the conversation thread and start the planning phase
  // immediately. We mark this conversation as narrative-direct so the
  // ConversationView knows to suppress the Q&A block.
  const handleCreateNarrativeSubmit = (text: string) => {
    const id = Date.now().toString();
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: deriveArtefactTitle(text) || "Untitled narrative",
        prompt: text,
        createdAt: Date.now(),
        artefacts: [],
      },
    ]);
    setNarrativeDirectConversations((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setCurrentConversationId(id);
    setConversationPrompt(text);
    setPromptValue("");
    setCreateNarrativeMode(false);
    setHomeScrolled(false);
    setSelectedSkeletonId(null);
    setView("conversation");
    setNarrativePhase("planning");
  };

  const handleCreateNarrative = () => {
    if (!currentConversationId) return;
    // One narrative per conversation — if one already exists, just re-open the panel.
    const existing = currentConversation?.artefacts.find((a) => a.kind === "narrative");
    if (existing) {
      setRightPane("narrative");
      return;
    }
    setSelectedSkeletonId(null);
    setNarrativePhase("planning");
  };

  const handleNarrativePlanningComplete = () => {
    setNarrativePhase("skeleton-ready");
  };

  // The original prompt-bar "Yes, create narrative" path. Instead of jumping
  // straight to generation, route through the interactive-elements question
  // so both this path and the preview-panel Proceed path converge.
  const handleNarrativeConfirm = () => {
    if (!currentConversationId || selectedSkeletonId == null) return;
    setNarrativePhase("interactive-choice");
  };

  // "Make changes" from the prompt-bar pill in skeleton-ready phase. The
  // pill only renders when a card is selected, so selectedSkeletonId is
  // guaranteed non-null here. Opens the preview for the selected angle and
  // switches to refining mode (chip in prompt bar).
  const handleNarrativeMakeChanges = () => {
    if (selectedSkeletonId == null) return;
    enterRefiningMode(selectedSkeletonId);
  };

  // Opens the skeleton-preview panel for a given angle. If another pane is
  // already open we replace it — only one right pane at a time.
  const handlePreviewSkeleton = (id: string) => {
    setPreviewSkeletonId(id);
    setRightPane("skeleton-preview");
  };

  // Preview-panel "Proceed to Create Full Narrative" — commits this angle
  // as the selection, closes the panel, and advances to the
  // interactive-elements question.
  const handleProceedFromPreview = (id: string) => {
    setSelectedSkeletonId(id);
    setRightPane(null);
    setPreviewSkeletonId(null);
    setRefiningSkeletonId(null);
    setRefinementTurns([]);
    setNarrativePhase("interactive-choice");
  };

  // Preview-panel "Make changes" — keeps the preview open so the user can
  // reference the full skeleton while writing their feedback, and switches
  // the prompt bar into refining mode.
  const handleMakeChangesFromPreview = (id: string) => {
    enterRefiningMode(id);
  };

  // Shared implementation: both "Make changes" entry points (prompt-bar pill
  // and preview-panel button) land here. Preview panel stays open; chip
  // appears in the prompt bar; refinement history resets.
  const enterRefiningMode = (id: string) => {
    setRefiningSkeletonId(id);
    setSelectedSkeletonId(id);
    setPreviewSkeletonId(id);
    setRightPane("skeleton-preview");
    setRefinementTurns([]);
    setNarrativePhase("refining");
  };

  // User submitted feedback while in the refining phase. Append the turn
  // and advance to refined-ready so the AI response + widget render.
  const handleSubmitRefinement = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRefinementTurns((prev) => [...prev, trimmed]);
    setPromptValue("");
    setNarrativePhase("refined-ready");
  };

  // Inline refined-widget "Make changes" — loop back into refining mode
  // and reopen the preview panel so the user can reference the original
  // skeleton while writing the next refinement. History stays so the
  // conversation thread keeps the previous turns.
  const handleMakeChangesFromRefined = () => {
    if (refiningSkeletonId == null) {
      setNarrativePhase("refining");
      return;
    }
    setPreviewSkeletonId(refiningSkeletonId);
    setRightPane("skeleton-preview");
    setNarrativePhase("refining");
  };

  // Inline refined-widget "Proceed to Create Full Narrative" — advances
  // to the interactive-elements question.
  const handleProceedFromRefined = () => {
    setNarrativePhase("interactive-choice");
  };

  // Cancel the refining session entirely (user dismissed the chip). Returns
  // to skeleton-ready with the original selection cleared.
  const handleCancelRefining = () => {
    setRefiningSkeletonId(null);
    setRefinementTurns([]);
    setNarrativePhase("skeleton-ready");
  };

  // Multi-select toggle for the interactive-elements picker.
  const handleToggleInteractiveElement = (el: InteractiveElement) => {
    setInteractiveElements((prev) =>
      prev.includes(el) ? prev.filter((x) => x !== el) : [...prev, el],
    );
  };

  // Final "Proceed" — runs the same path as the old narrative-confirm:
  // creates the artefact, opens NarrativePanel, fires the beam.
  const handleProceedFromInteractive = () => {
    if (!currentConversationId) return;
    setNarrativePhase("generating");
    const a: Artefact = {
      id: Date.now().toString(),
      kind: "narrative",
      title: deriveArtefactTitle(conversationPrompt) || "Untitled narrative",
      prompt: conversationPrompt,
      createdAt: Date.now(),
      skeletonId: selectedSkeletonId ?? undefined,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId ? { ...c, artefacts: [...c.artefacts, a] } : c
      )
    );
    narrativeConfirmTimerRef.current = window.setTimeout(() => {
      setRightPane("narrative");
      setNarrativePanelLoading(true);
      setNarrativePhase("idle");
      window.setTimeout(() => setNarrativePanelLoading(false), 4500);
    }, 500);
  };

  // Generate format from the narrative panel. Only "infographic" is
  // wired up to a real pane today — the other formats stay as no-ops until
  // their respective views are built.
  // Internal — runs the mock generation pass for the infographic.
  // `replace` removes any existing infographic before adding the new
  // one, preserving the "one per conversation" rule when regenerating.
  const runInfographicGeneration = (replace: boolean) => {
    if (!currentConversationId) return;
    if (replace) {
      setConversations((prev) =>
        prev.map((c) => c.id === currentConversationId
          ? { ...c, artefacts: c.artefacts.filter((a) => a.kind !== "infographic") }
          : c
        )
      );
    }
    setInfographicGenerating(true);
    setRightPane("infographic");
    window.setTimeout(() => {
      const baseTitle = deriveArtefactTitle(conversationPrompt) || "Infographic";
      const a: Artefact = {
        id: Date.now().toString(),
        kind: "infographic",
        title: `${baseTitle} · Infographic`,
        prompt: conversationPrompt,
        createdAt: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) => c.id === currentConversationId ? { ...c, artefacts: [...c.artefacts, a] } : c)
      );
      setInfographicGenerating(false);
    }, 3500);
  };

  const handleGenerate = (kind: string) => {
    if (kind !== "infographic") return;
    if (!currentConversationId) return;
    const existing = currentConversation?.artefacts.find((a) => a.kind === "infographic");
    if (existing) {
      // Existing artefact — ask before regenerating.
      setRegenerateConfirm(kind);
      return;
    }
    runInfographicGeneration(false);
  };

  const confirmRegenerate = () => {
    const kind = regenerateConfirm;
    setRegenerateConfirm(null);
    if (kind === "infographic") runInfographicGeneration(true);
  };

  const handleSelectArtefact = (a: Artefact) => {
    setRightPane(a.kind);
  };

  // Open the shared-link viewer for a home-page card (e.g. a featured
  // narrative). If a conversation for that prompt already exists, jump
  // back into it; otherwise fabricate a stub conversation with a
  // pre-generated infographic artefact attached.
  const handleOpenViewer = (prompt: string, fallbackTitle: string) => {
    const existing = conversations.find((c) => c.prompt === prompt);
    if (existing) {
      setCurrentConversationId(existing.id);
      setConversationPrompt(prompt);
      setView("viewer");
      return;
    }
    const id = `seed-${Date.now()}`;
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const baseTitle = deriveArtefactTitle(prompt) || fallbackTitle;
    const insight: Artefact = {
      id: `${id}-insight`,
      kind: "infographic",
      title: `${baseTitle} · Infographic`,
      prompt,
      createdAt: yesterday,
    };
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: baseTitle,
        prompt,
        createdAt: yesterday,
        artefacts: [insight],
      },
    ]);
    setCurrentConversationId(id);
    setConversationPrompt(prompt);
    setView("viewer");
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    setCurrentConversationId(id);
    setConversationPrompt(conv.prompt);
    setRightPane(null);
    setView("conversation");
  };

  // + button menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [mainMenuLeft, setMainMenuLeft] = useState<number | undefined>(0);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(() => new Set(MCP_CONNECTORS.map((c) => c.id)));
  const menuRef = useRef<HTMLDivElement>(null);
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [subMenuLeft, setSubMenuLeft] = useState(230);

  const openSub = () => {
    if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      // Would the submenu (290px) fit to the right of the main menu (230px)?
      const rightEdge = rect.left + 230 + 290;
      if (rightEdge > window.innerWidth - 8) {
        // Flip: open to the left of the main menu
        setSubMenuLeft(-290);
      } else {
        setSubMenuLeft(230);
      }
    }
    setSubOpen(true);
  };
  const closeSub = () => { subCloseTimer.current = setTimeout(() => setSubOpen(false), 120); };
  const toggleConnector = (id: string) => setEnabledIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false); setSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => { if (!menuOpen) setSubOpen(false); }, [menuOpen]);

  return (
    <>
      {/* Shared, always-mounted prompt bar. Animates between hero-center
          (home) and bottom-fixed (conversation). */}
      {view !== "workspace" && view !== "viewer" && <PromptBar
        mode={(view === "conversation" || (view === "home" && homeScrolled)) ? "bottom" : "hero"}
        widthMode={view === "conversation" ? "wide" : "compact"}
        value={promptValue}
        onChange={setPromptValue}
        onComplete={handleSearchComplete}
        onCreateNarrative={handleCreateNarrative}
        panelOpen={view === "conversation" && rightPane !== null}
        panelWidth={rightPaneWidth}
        suppressTransition={rightPaneDragging}
        showCreateChip={
          view === "conversation" &&
          !currentArtefacts.some((a) => a.kind === "narrative") &&
          narrativePhase === "skeleton-ready" &&
          selectedSkeletonId != null
        }
        narrativePhase={narrativePhase}
        onNarrativeConfirm={handleNarrativeConfirm}
        onNarrativeMakeChanges={handleNarrativeMakeChanges}
        narrativeConfirmDisabled={narrativePhase === "skeleton-ready" && selectedSkeletonId === null}
        refiningChip={
          narrativePhase === "refining" && refiningSkeletonId
            ? {
                title:
                  FLOW_SKELETONS[detectFlow(conversationPrompt)].find(
                    (s) => s.id === refiningSkeletonId,
                  )?.title ?? "narrative angle",
                onDismiss: handleCancelRefining,
              }
            : undefined
        }
        onRefineSubmit={
          narrativePhase === "refining" ? handleSubmitRefinement : undefined
        }
        createNarrativeChip={
          view === "home" && createNarrativeMode
            ? { onDismiss: () => setCreateNarrativeMode(false) }
            : undefined
        }
        onCreateNarrativeSubmit={
          view === "home" && createNarrativeMode ? handleCreateNarrativeSubmit : undefined
        }
        inConversation={view === "conversation"}
        onSubmit={() => {
          // Scroll the home view back to the top on submit so the beam runs
          // in the right place and the bar can animate from bottom→hero first.
          if (view === "home" && homeScrolled) {
            const el = homeScrollRef.current;
            if (el) el.scrollTo({ top: 0, behavior: "smooth" });
            setHomeScrolled(false);
          }
        }}
      />}

      {view === "conversation" && (
        <>
          <NarrativePanel
            open={rightPane === "narrative"}
            prompt={conversationPrompt}
            onClose={() => setRightPane(null)}
            onGenerate={handleGenerate}
            loading={narrativePanelLoading}
            generatedKinds={currentArtefacts.map((a) => a.kind)}
            width={rightPaneWidth}
            onResize={(w, dragging) => {
              setRightPaneWidth(w);
              setRightPaneDragging(dragging);
            }}
          />
          <InfographicPanel
            open={rightPane === "infographic"}
            prompt={conversationPrompt}
            onClose={() => setRightPane(null)}
            onOpenNarrative={() => setRightPane("narrative")}
            onPreviewAsViewer={() => {
              setRightPane(null);
              setView("viewer");
            }}
            loading={infographicGenerating}
            width={rightPaneWidth}
            onResize={(w, dragging) => {
              setRightPaneWidth(w);
              setRightPaneDragging(dragging);
            }}
          />
          <SkeletonPreviewPanel
            open={rightPane === "skeleton-preview"}
            flow={detectFlow(conversationPrompt)}
            skeletonId={previewSkeletonId}
            width={rightPaneWidth}
            onResize={(w, dragging) => {
              setRightPaneWidth(w);
              setRightPaneDragging(dragging);
            }}
            onClose={() => {
              setRightPane(null);
              setPreviewSkeletonId(null);
            }}
            onProceed={(id) => handleProceedFromPreview(id)}
            onMakeChanges={(id) => handleMakeChangesFromPreview(id)}
            refinementTurns={refinementTurns}
          />
        </>
      )}

      {view === "viewer" ? (
        <ViewerView
          prompt={conversationPrompt}
          title={currentConversation?.title ?? "Shared infographic"}
          onClose={() => setView("home")}
        />
      ) : view === "workspace" ? (
        <WorkspaceView
          items={conversations.map((c) => ({
            id: c.id,
            title: c.title,
            prompt: c.prompt,
            createdAt: c.createdAt,
            artefactCount: c.artefacts.length,
          }))}
          onSelect={handleSelectConversation}
          onClose={() => setView("home")}
        />
      ) : view === "conversation" ? (
        <ConversationView
          prompt={conversationPrompt}
          onClose={() => { setView("home"); setConversationPrompt(""); setRightPane(null); }}
          panelOpen={rightPane !== null}
          panelWidth={rightPaneWidth}
          suppressTransition={rightPaneDragging}
          artefacts={currentArtefacts}
          onSelectArtefact={handleSelectArtefact}
          title={currentConversation?.title}
          onTitleChange={(t) => setConversations((prev) =>
            prev.map((c) => c.id === currentConversationId ? { ...c, title: t } : c)
          )}
          narrativePhase={narrativePhase}
          onNarrativePlanningComplete={handleNarrativePlanningComplete}
          selectedSkeletonId={selectedSkeletonId}
          onSelectSkeleton={setSelectedSkeletonId}
          onPreviewSkeleton={handlePreviewSkeleton}
          refiningSkeletonId={refiningSkeletonId}
          refinementTurns={refinementTurns}
          onRefinedProceed={handleProceedFromRefined}
          onRefinedMakeChanges={handleMakeChangesFromRefined}
          interactiveElements={interactiveElements}
          onToggleInteractiveElement={handleToggleInteractiveElement}
          onProceedFromInteractive={handleProceedFromInteractive}
          narrativeDirect={
            currentConversationId != null &&
            narrativeDirectConversations.has(currentConversationId)
          }
        />
      ) : (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        // Subtle "scorecard" texture: clusters of tiny near-transparent
        // teal squares packed in 3 groups per tile with breathing space
        // around them. No gradient — flat pale teal surface so the
        // clusters read as the only decoration.
        background: [
          `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='340' height='340'>
              <!-- Cluster A: top-left -->
              <rect x='38' y='44' width='12' height='12' fill='rgba(15,118,110,0.035)'/>
              <rect x='52' y='38' width='10' height='10' fill='rgba(45,212,191,0.035)'/>
              <rect x='50' y='60' width='8'  height='8'  fill='rgba(15,118,110,0.03)'/>
              <rect x='66' y='52' width='14' height='14' fill='rgba(45,212,191,0.03)'/>
              <rect x='62' y='72' width='10' height='10' fill='rgba(15,118,110,0.04)'/>
              <rect x='80' y='66' width='8'  height='8'  fill='rgba(45,212,191,0.035)'/>
              <!-- Cluster B: mid-right -->
              <rect x='228' y='148' width='12' height='12' fill='rgba(45,212,191,0.035)'/>
              <rect x='244' y='140' width='10' height='10' fill='rgba(15,118,110,0.03)'/>
              <rect x='260' y='154' width='14' height='14' fill='rgba(15,118,110,0.04)'/>
              <rect x='234' y='168' width='10' height='10' fill='rgba(45,212,191,0.03)'/>
              <rect x='250' y='176' width='8'  height='8'  fill='rgba(15,118,110,0.04)'/>
              <rect x='270' y='176' width='12' height='12' fill='rgba(45,212,191,0.035)'/>
              <!-- Cluster C: bottom-centre -->
              <rect x='140' y='250' width='12' height='12' fill='rgba(15,118,110,0.04)'/>
              <rect x='156' y='244' width='10' height='10' fill='rgba(45,212,191,0.03)'/>
              <rect x='172' y='256' width='14' height='14' fill='rgba(15,118,110,0.035)'/>
              <rect x='148' y='268' width='8'  height='8'  fill='rgba(45,212,191,0.04)'/>
              <rect x='166' y='276' width='10' height='10' fill='rgba(15,118,110,0.035)'/>
              <rect x='186' y='280' width='8'  height='8'  fill='rgba(45,212,191,0.035)'/>
            </svg>`,
          )}")`,
          "#EEF5F5",
        ].join(", "),
        backgroundRepeat: "repeat, no-repeat",
        backgroundSize: "340px 340px, auto",
      }}
    >
      {/* ── Main scrollable content ── */}
      <div ref={homeScrollRef} className="flex-1 min-w-0 overflow-y-auto flex flex-col">
      <AppHeader
        workspaceCount={conversations.length}
        onOpenWorkspace={() => setView("workspace")}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <SearchHero
          onPillClick={setPromptValue}
          onCreateNarrative={handleArmCreateNarrative}
        />

        {/* Ticker hidden for now — keep import/state intact for a quick re-enable.
            To bring it back, wrap with the FadeIn delay={25} block again. */}
        {false && (
          <FadeIn delay={25}>
            <IndicatorTicker indicators={indicators} />
          </FadeIn>
        )}

        <FadeIn delay={25}>
          <MomentumGroups onPromptClick={setPromptValue} />
        </FadeIn>

        <FadeIn delay={50}>
          <TrendingAcrossIDA onOpenTopCard={handleSearchComplete} />
        </FadeIn>

        <FadeIn delay={75}>
          <FeaturedNarratives onOpenInfographic={handleOpenViewer} />
        </FadeIn>

        <FadeIn delay={100}>
          <CounterIntuitiveFindings />
        </FadeIn>

        <FadeIn delay={125}>
          <OutcomeAreaGrid />
        </FadeIn>

        <div className="h-8" />
      </main>

      <AppFooter />
      </div>
      {/* ── AI Chat sidebar (pushes content) ── */}
      {aiChatOpen && (
        <div
          className="shrink-0 border-l border-gray-200 flex flex-col bg-white"
          style={{ width: 420, height: "100vh" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-5 py-4 shrink-0"
            style={{ background: "linear-gradient(135deg, #0D52A2 0%, #0b6fd3 60%, #2196F3 100%)" }}
          >
            <IconSparkles size={20} stroke={1.9} style={{ color: "rgba(255,255,255,0.9)", flexShrink: 0 }} />
            <span
              className="flex-1 text-[15px] font-bold"
              style={{ fontFamily: "'Open Sans', sans-serif", color: "#FFFFFF", letterSpacing: "-0.15px" }}
            >
              Ask AI
            </span>
            <button
              onClick={() => setAiChatOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <IconX size={16} stroke={1.5} />
            </button>
          </div>

          {/* Body — empty state */}
          <div className="flex-1 overflow-y-auto flex flex-col justify-center gap-3 px-5 py-6">
            <p className="text-[13px] text-gray-400 text-center" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Ask anything about the scorecard data, country performance, or portfolio gaps.
            </p>
            <div className="flex flex-col gap-2">
              {AI_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setAiInput(s)}
                  className="text-left px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 py-4">
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                borderRadius: 16,
                boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.05)",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* + button + menus */}
              <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
                <button
                  aria-label="Add"
                  onClick={() => {
                    if (!menuOpen && menuRef.current) {
                      const rect = menuRef.current.getBoundingClientRect();
                      // If 230px main menu would overflow right, anchor it right-aligned to button
                      if (rect.left + 230 > window.innerWidth - 8) {
                        setMainMenuLeft(undefined); // will use right:0 below
                      } else {
                        setMainMenuLeft(0);
                      }
                    }
                    setMenuOpen((v) => !v);
                  }}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: "none", background: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#616161", flexShrink: 0,
                  }}
                >
                  <IconPlus size={15} stroke={2} />
                </button>

                {/* Main menu — opens upward */}
                {menuOpen && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: mainMenuLeft, right: mainMenuLeft === undefined ? 0 : undefined, width: 230, zIndex: 200, ...menuShell }}>
                    <div
                      style={{ ...menuRow }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; closeSub(); }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <IconPaperclip size={16} stroke={1.5} color="#616161" />
                      <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Add files or photos</span>
                    </div>
                    <div
                      style={{ ...menuRow, borderBottom: "1px solid #F3F4F6" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; closeSub(); }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <IconPhoto size={16} stroke={1.5} color="#616161" />
                      <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Add images</span>
                    </div>
                    <div
                      style={{ ...menuRow, background: subOpen ? "#F5F5F5" : "transparent", justifyContent: "space-between" }}
                      onMouseEnter={openSub}
                      onMouseLeave={closeSub}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <IconPlugConnected size={16} stroke={1.5} color="#616161" />
                        <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Connectors</span>
                      </div>
                      <IconChevronRight size={14} stroke={1.5} color="#9E9E9E" />
                    </div>
                  </div>
                )}

                {/* Connectors submenu */}
                {menuOpen && subOpen && (
                  <div
                    style={{ position: "absolute", bottom: "calc(100% + 8px)", left: subMenuLeft, width: 290, zIndex: 201, ...menuShell }}
                    onMouseEnter={openSub}
                    onMouseLeave={closeSub}
                  >
                    {MCP_CONNECTORS.map((c, i) => {
                      const on = enabledIds.has(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleConnector(c.id)}
                          style={{ ...menuRow, borderBottom: i < MCP_CONNECTORS.length - 1 ? "1px solid #F3F4F6" : "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <ChatConnectorIcon id={c.id} />
                          <span style={{ fontFamily: F, fontSize: 13, color: "#212121", flex: 1, lineHeight: "18px" }}>{c.name}</span>
                          <ChatToggle on={on} onToggle={() => toggleConnector(c.id)} />
                        </div>
                      );
                    })}
                    <div style={{ borderTop: "1px solid #F3F4F6" }}>
                      <div
                        style={{ ...menuRow, borderBottom: "1px solid #F3F4F6" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconSettings size={14} stroke={1.5} color="#616161" />
                        </div>
                        <span style={{ fontFamily: F, fontSize: 13, color: "#212121" }}>Manage connectors</span>
                      </div>
                      <div
                        style={{ ...menuRow }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconTool size={14} stroke={1.5} color="#616161" />
                        </div>
                        <div>
                          <div style={{ fontFamily: F, fontSize: 13, color: "#212121" }}>Tool access</div>
                          <div style={{ fontFamily: F, fontSize: 11, color: "#9E9E9E", marginTop: 1 }}>Load tools when needed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                rows={1}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Give me more insights"
                className="flex-1 resize-none focus:outline-none"
                style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: 16,
                  color: "#212121",
                  background: "transparent",
                  border: "none",
                  lineHeight: "24px",
                  height: 24,
                  overflowY: "hidden",
                  minWidth: 0,
                  padding: 0,
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 72) + "px";
                }}
              />

              {/* Send button */}
              <button
                disabled={!aiInput.trim()}
                aria-label="Send"
                style={{
                  width: 32, height: 32, borderRadius: "50%", border: "none",
                  background: aiInput.trim() ? "#0b6fd3" : "#BDBDBD",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  cursor: aiInput.trim() ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
              >
                <IconArrowUp size={16} stroke={2} color="#FFFFFF" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating AI button (hidden when chat is open) ── */}
      {!aiChatOpen && <button
        aria-label="Ask AI"
        onClick={() => setAiChatOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: `1px solid ${aiChatOpen ? "#0b6fd3" : "#E5E5E5"}`,
          background: aiChatOpen ? "#EBF3FC" : "#FFFFFF",
          boxShadow: "0px 4px 12px rgba(12,35,60,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 50,
          color: aiChatOpen ? "#0b6fd3" : "#616161",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
      >
        <IconSparkles size={22} stroke={1.5} />
      </button>}

      {modalStory && (
        <StoryDetailModal story={modalStory} onClose={() => setModalStory(null)} />
      )}
    </div>
      )}

      {/* Regenerate confirmation — appears when a user picks a Generate
          option whose artefact already exists. Click the backdrop or
          Cancel to dismiss; Regenerate replaces the existing artefact
          and re-runs the mock composer. */}
      {regenerateConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setRegenerateConfirm(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-[440px] max-w-[calc(100vw-32px)] mx-4 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "card-enter 200ms ease-out both" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <IconAlertTriangle size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-gray-900">
                  Replace existing {regenerateConfirm}?
                </h3>
                <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed">
                  This conversation already has {regenerateConfirm === "infographic" ? "an" : "a"} {regenerateConfirm}.
                  Regenerating will overwrite the existing version — it can&rsquo;t be recovered afterwards.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => setRegenerateConfirm(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegenerate}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
