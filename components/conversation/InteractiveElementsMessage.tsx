// components/conversation/InteractiveElementsMessage.tsx
//
// Asks the user which interactive elements (Map / Charts / Tables / Timeline)
// to include in the final narrative. Multi-select chips with a Proceed CTA.
// Once the user proceeds, the parent advances the phase to "generating" and
// opens the final NarrativePanel.

"use client";

import {
  IconMap,
  IconChartBar,
  IconTable,
  IconTimeline,
  IconCheck,
} from "@tabler/icons-react";
import type { InteractiveElement } from "../../app/page";

interface Option {
  id: InteractiveElement;
  label: string;
  Icon: typeof IconMap;
}

const OPTIONS: Option[] = [
  { id: "map", label: "Map", Icon: IconMap },
  { id: "charts", label: "Charts", Icon: IconChartBar },
  { id: "tables", label: "Tables", Icon: IconTable },
  { id: "timeline", label: "Timeline", Icon: IconTimeline },
];

interface Props {
  selected: InteractiveElement[];
  active: boolean;
  onToggle: (el: InteractiveElement) => void;
  onProceed: () => void;
}

export default function InteractiveElementsMessage({
  selected,
  active,
  onToggle,
  onProceed,
}: Props) {
  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          Would you like to include any interactive elements?
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {OPTIONS.map(({ id, label, Icon }) => {
            const on = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => active && onToggle(id)}
                disabled={!active}
                aria-pressed={on}
                className={
                  "inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-full border transition-colors" +
                  (active ? " cursor-pointer" : " cursor-default") +
                  (on
                    ? " bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
                    : " bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50")
                }
              >
                <Icon size={14} stroke={on ? 2.5 : 2} />
                {label}
              </button>
            );
          })}
        </div>

        {active && (
          <div>
            <button
              type="button"
              onClick={onProceed}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-1.5 rounded-full bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-colors"
            >
              <IconCheck size={12} stroke={3} />
              Proceed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
