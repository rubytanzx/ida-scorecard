"use client";

import {
  IconTrendingUp,
  IconAlertTriangle,
  IconArrowsUpDown,
} from "@tabler/icons-react";

const ACTION_PILLS = [
  { id: "surging",  label: "What's surging this quarter?",  prompt: "What's surging this quarter?",       icon: IconTrendingUp },
  { id: "stalling", label: "Which indicators are stalling?", prompt: "Which indicators are stalling?",     icon: IconAlertTriangle },
  { id: "movers",   label: "Biggest movers vs last FY",      prompt: "Biggest movers vs last FY",           icon: IconArrowsUpDown },
] as const;

interface Props {
  /** Set the prompt-bar's value when a suggestion pill is clicked. */
  onPillClick: (label: string) => void;
}

export default function SearchHero({ onPillClick }: Props) {
  return (
    <section
      className="relative w-full pb-8 flex flex-col items-center gap-5"
      // Top spacer keeps the action pills below where the (fixed-positioned)
      // PromptBar sits visually in hero mode (HERO_TOP 112 + ~46 pill height
      // + ~20 gap, minus the 72px header offset).
      style={{ paddingTop: 108 }}
    >
      {/* Action pills */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {ACTION_PILLS.map(({ id, label, prompt, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPillClick(prompt)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Icon size={12} className="opacity-60" />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
