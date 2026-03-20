"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconSparkles, IconX, IconArrowUp, IconPlus,
  IconPaperclip, IconPhoto, IconPlugConnected,
  IconChevronRight, IconSettings, IconTool,
} from "@tabler/icons-react";
import { MCP_CONNECTORS } from "@/data/mockInteraction";
import AppHeader from "@/components/AppHeader";
import SearchHero from "@/components/SearchHero";
import SectionHeader from "@/components/SectionHeader";
import FeaturedStoryCard from "@/components/FeaturedStoryCard";
import StoryCard from "@/components/StoryCard";
import SidebarSection from "@/components/SidebarSection";
import InsightChartCard from "@/components/InsightChartCard";
import CounterIntuitiveCard from "@/components/CounterIntuitiveCard";
import PatternCard from "@/components/PatternCard";
import AppFooter from "@/components/AppFooter";
import StoryDetailModal from "@/components/StoryDetailModal";

import {
  featuredStory,
  secondaryStories,
  changingCards,
  counterIntuitiveCards,
  patternCards,
} from "@/lib/mockData";

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

export default function HomePage() {
  const [modalStory, setModalStory] = useState<(typeof secondaryStories)[0] | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const story3 = secondaryStories.find((s) => s.id === "story-3") ?? null;

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
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ── Main scrollable content ── */}
      <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Search Hero */}
        <FadeIn delay={0}>
          <SearchHero />
        </FadeIn>

        {/* Main 2-col layout */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* ── Left / Main column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">

            {/* Topics Trending */}
            <section aria-label="Topics Trending">
              <FadeIn delay={50}>
                <SectionHeader title="Topics Trending" />
              </FadeIn>
              <FadeIn delay={100}>
                <FeaturedStoryCard story={featuredStory} />
              </FadeIn>
              <FadeIn delay={150}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {secondaryStories.map((story) =>
                    story.id === "story-3" ? (
                      <div
                        key={story.id}
                        className="cursor-pointer"
                        onClick={() => setModalStory(story)}
                      >
                        <StoryCard story={{ ...story, href: undefined }} />
                      </div>
                    ) : (
                      <StoryCard key={story.id} story={story} />
                    )
                  )}
                </div>
              </FadeIn>
            </section>

            {/* What's Changing Right Now */}
            <section aria-label="What's Changing Right Now">
              <FadeIn delay={0}>
                <SectionHeader title="What&apos;s Changing Right Now" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {changingCards.map((card) => (
                    <InsightChartCard key={card.id} card={card} />
                  ))}
                </div>
              </FadeIn>
            </section>

            {/* Counter Intuitive Findings */}
            <section aria-label="Counter Intuitive Findings">
              <FadeIn delay={0}>
                <SectionHeader title="Counter Intuitive Findings" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {counterIntuitiveCards.map((card) => (
                    <CounterIntuitiveCard key={card.id} card={card} />
                  ))}
                </div>
              </FadeIn>
            </section>

            {/* Explore by Patterns */}
            <section aria-label="Explore by Patterns">
              <FadeIn delay={0}>
                <SectionHeader title="Explore by Patterns" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patternCards.map((card) => (
                    <PatternCard key={card.id} card={card} />
                  ))}
                </div>
              </FadeIn>
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="w-full xl:w-[380px] shrink-0 xl:sticky top-[72px]">
            <FadeIn delay={200}>
              <SidebarSection />
            </FadeIn>
          </aside>
        </div>

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
  );
}
