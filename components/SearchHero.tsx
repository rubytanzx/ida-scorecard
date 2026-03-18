"use client";

import {
  IconMicrophone,
  IconArrowUp,
  IconPlus,
  IconBook,
  IconChartBar,
  IconAlertTriangle,
} from "@tabler/icons-react";

const ACTION_PILLS = [
  { id: "insight",  label: "Generate an Insight",     icon: IconChartBar },
  { id: "board",    label: "Create a Research Board",  icon: IconBook },
  { id: "scenario", label: "Simulate a Scenario",      icon: IconAlertTriangle },
] as const;

export default function SearchHero() {
  return (
    <section className="w-full pt-10 pb-8 flex flex-col items-center gap-5">
      {/* Search input — fully rounded pill */}
      <div className="w-full max-w-[580px]">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 focus-within:border-blue-400 focus-within:shadow-md focus-within:ring-[3px] focus-within:ring-blue-50">
          <IconPlus size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="What do you want to learn?"
            className="flex-1 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none"
            aria-label="Search the scorecard"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Voice input"
            >
              <IconMicrophone size={16} />
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              aria-label="Submit"
            >
              <IconArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Action pills */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {ACTION_PILLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
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
