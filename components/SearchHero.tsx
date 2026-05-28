"use client";

import {
  IconArrowsUpDown,
  IconNotebook,
  IconBook2,
} from "@tabler/icons-react";

const ACTION_PILLS = [
  { id: "compare", label: "Compare results",     prompt: "Compare results ",     icon: IconArrowsUpDown },
  { id: "explore", label: "Explore an indicator", prompt: "Explore an indicator ", icon: IconBook2 },
] as const;

interface Props {
  /** Pre-fills the prompt bar with the pill's starter text and opens the dropdown. */
  onPillClick: (prompt: string) => void;
  /** Fires when the user clicks the "Create a narrative" pill. */
  onCreateNarrative: () => void;
}

export default function SearchHero({ onPillClick, onCreateNarrative }: Props) {
  return (
    <section
      className="relative w-full pb-8 flex flex-col items-center gap-5"
      style={{ paddingTop: 108 }}
    >
      {/* Action pills */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {ACTION_PILLS.map(({ id, label, prompt, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPillClick(prompt)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Icon size={12} className="opacity-60" />
            {label}
          </button>
        ))}

        {/* "Create a narrative" — animated gleaming gradient border */}
        <button
          type="button"
          onClick={onCreateNarrative}
          aria-label="Create a narrative"
          className="group relative isolate rounded-full p-[1.5px] active:scale-[0.98] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full"
            style={{
              background:
                "linear-gradient(110deg, #c4b5fd 0%, #818cf8 25%, #38bdf8 50%, #a78bfa 75%, #c4b5fd 100%)",
              backgroundSize: "200% 100%",
              animation: "gleam 3s linear infinite",
            }}
          />
          <span className="flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-semibold text-violet-700 bg-white rounded-full group-hover:bg-violet-50 transition-colors">
            <IconNotebook size={12} className="text-violet-500" />
            Create a narrative
          </span>
        </button>
      </div>
    </section>
  );
}
