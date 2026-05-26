// components/conversation/SkeletonRefinedMessage.tsx
//
// Renders one or more refinement turns inside the conversation thread. Each
// turn is: a user bubble with the feedback they typed, then an AI message
// ("Here is your refined narrative:") followed by an inline widget showing
// the full 5-section skeleton. Only the most-recent turn's widget gets the
// interactive Proceed / Make changes buttons; earlier turns are read-only.

"use client";

import { IconCheck } from "@tabler/icons-react";
import {
  FLOW_SKELETONS,
  type NarrativeSkeleton,
} from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";

interface Props {
  flow: FlowId;
  /** Which skeleton angle is being refined. */
  skeletonId: string;
  /** History of user-submitted refinement texts. */
  turns: string[];
  /** True when the most-recent widget should show interactive buttons. */
  active: boolean;
  onProceed: () => void;
  onMakeChanges: () => void;
}

export default function SkeletonRefinedMessage({
  flow,
  skeletonId,
  turns,
  active,
  onProceed,
  onMakeChanges,
}: Props) {
  const skeleton =
    FLOW_SKELETONS[flow].find((s) => s.id === skeletonId) ?? null;
  if (!skeleton) return null;

  return (
    <>
      {turns.map((text, i) => {
        const isLast = i === turns.length - 1;
        return (
          <div key={i} className="flex flex-col gap-4 narrative-content-enter">
            {/* User bubble */}
            <div className="self-end flex items-center gap-3 max-w-[85%]">
              <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
                {text}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                NT
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                SC
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <p className="text-[13.5px] text-gray-700 leading-relaxed">
                  Great — here is your refined narrative:
                </p>
                <RefinedWidget
                  skeleton={skeleton}
                  showActions={isLast && active}
                  onProceed={onProceed}
                  onMakeChanges={onMakeChanges}
                />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function RefinedWidget({
  skeleton,
  showActions,
  onProceed,
  onMakeChanges,
}: {
  skeleton: NarrativeSkeleton;
  showActions: boolean;
  onProceed: () => void;
  onMakeChanges: () => void;
}) {
  const {
    title,
    challengeText,
    interventionText,
    countryExamples,
    countryFlags,
    pathwaysText,
    lessonsText,
    sourceCounts,
  } = skeleton;

  return (
    <div className="rounded-2xl border border-violet-200 bg-[rgba(167,139,250,0.06)] shadow-[0_8px_24px_-8px_rgba(124,58,237,0.15)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h4 className="text-[16px] font-semibold text-gray-900 leading-snug">
          {title}
        </h4>
        <p className="mt-0.5 text-[11.5px] text-gray-500">
          Based on {sourceCounts.pads.toLocaleString()} PADs, {sourceCounts.isrs.toLocaleString()} ISRs, and {sourceCounts.icrs.toLocaleString()} ICRs.
        </p>
      </div>

      <div className="mx-5 h-px bg-gray-200/70" />

      <Section label="The Challenge" body={challengeText} />
      <div className="mx-5 h-px bg-gray-200/70" />
      <Section label="Interventions" body={interventionText} />
      <div className="mx-5 h-px bg-gray-200/70" />

      <div className="px-5 pt-3 pb-3">
        <SectionLabel>Country examples</SectionLabel>
        <div className="mt-2 flex flex-col gap-1.5">
          {countryExamples.map((name, i) => (
            <div key={name} className="flex items-center gap-2 text-[12.5px] text-gray-800">
              <span className="text-[14px] leading-none" aria-hidden>
                {countryFlags[i]}
              </span>
              <span className="font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 h-px bg-gray-200/70" />
      <Section label="Pathways to Outcomes" body={pathwaysText} />
      <div className="mx-5 h-px bg-gray-200/70" />
      <Section label="Lessons Learned" body={lessonsText} />

      {showActions && (
        <div className="border-t border-violet-200 bg-white/60 px-5 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onMakeChanges}
            className="text-[12.5px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
          >
            Make changes
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-1.5 rounded-full bg-violet-600 text-white border border-violet-600 hover:bg-violet-700 active:scale-[0.98] transition-colors"
          >
            <IconCheck size={12} stroke={3} />
            Proceed to Create Full Narrative
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div className="px-5 py-3">
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-2 text-[12.5px] text-gray-800 leading-relaxed">{body}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}
