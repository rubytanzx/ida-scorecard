"use client";

import { useEffect, useRef, useState } from "react";
import { IconSparkles, IconX, IconSend } from "@tabler/icons-react";
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
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 shrink-0">
            <IconSparkles size={20} stroke={1.5} className="text-gray-400" />
            <span className="flex-1 text-[15px] font-semibold text-gray-700" style={{ fontFamily: "'Open Sans', sans-serif" }}>
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
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-5 py-6">
            <p className="text-[13px] text-gray-400 text-center mt-8" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Ask anything about the scorecard data, country performance, or portfolio gaps.
            </p>
            <div className="flex flex-col gap-2 mt-4">
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
          <div className="shrink-0 border-t border-gray-100 px-4 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition-colors">
              <textarea
                rows={1}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about country data…"
                className="flex-1 resize-none bg-transparent text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none"
                style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: "1.5", maxHeight: 120 }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
              />
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 disabled:opacity-40"
                disabled={!aiInput.trim()}
              >
                <IconSend size={13} stroke={2} />
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
