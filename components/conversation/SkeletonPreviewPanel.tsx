// components/conversation/SkeletonPreviewPanel.tsx
//
// Temporary right-side panel that previews the full 5-section skeleton for a
// chosen narrative angle. Mounts in the same right-pane slot as NarrativePanel
// but renders read-only preview content. Closes via the X button or via the
// "Select this angle" CTA, which also marks the skeleton as selected.

"use client";

import { useEffect, useRef, useState } from "react";
import { IconX, IconNotebook, IconCheck, IconGripVertical } from "@tabler/icons-react";
import {
  FLOW_SKELETONS,
  type NarrativeSkeleton,
} from "./NarrativeSkeletons";
import {
  NARRATIVE_PANEL_DEFAULT_WIDTH,
  NARRATIVE_PANEL_MIN_WIDTH,
  NARRATIVE_PANEL_MAX_WIDTH,
} from "./NarrativePanel";
import type { FlowId } from "./ConversationView";

interface Props {
  open: boolean;
  flow: FlowId;
  /** Which skeleton to preview. When null, the panel hides regardless of `open`. */
  skeletonId: string | null;
  width: number;
  onResize: (width: number, dragging: boolean) => void;
  onClose: () => void;
  /** Called when the user clicks "Select this angle" inside the preview. */
  onSelectAngle: (id: string) => void;
  /** True if this skeleton is currently the selected one — flips the CTA from
   *  "Select this angle" to a confirmed-state label. */
  alreadySelected: boolean;
}

export default function SkeletonPreviewPanel({
  open,
  flow,
  skeletonId,
  width,
  onResize,
  onClose,
  onSelectAngle,
  alreadySelected,
}: Props) {
  const skeleton =
    skeletonId == null
      ? null
      : FLOW_SKELETONS[flow].find((s) => s.id === skeletonId) ?? null;

  // Same drag-to-resize affordance as NarrativePanel, so the right pane
  // behaves identically across the three panel types.
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(width);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = startX.current - e.clientX;
      const next = Math.max(
        NARRATIVE_PANEL_MIN_WIDTH,
        Math.min(NARRATIVE_PANEL_MAX_WIDTH, startWidth.current + dx),
      );
      onResize(next, true);
    };
    const onUp = () => {
      setDragging(false);
      onResize(width, false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onResize, width]);

  const beginDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startWidth.current = width;
    setDragging(true);
  };

  return (
    <aside
      aria-hidden={!open}
      className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] flex flex-col ${
        dragging ? "" : "transition-transform duration-500 ease-in-out"
      }`}
      style={{
        width,
        transform: open ? "translateX(0)" : `translateX(${width}px)`,
        zIndex: 60,
      }}
    >
      {open && (
        <div
          onMouseDown={beginDrag}
          aria-label="Resize panel"
          role="separator"
          className="group absolute left-0 top-0 bottom-0 w-2 -translate-x-1/2 cursor-col-resize z-10 flex items-center justify-center"
        >
          <span
            className={`block h-12 w-1 rounded-full transition-colors ${
              dragging ? "bg-violet-500" : "bg-gray-200 group-hover:bg-gray-300"
            }`}
          />
          <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md p-0.5 text-gray-400 pointer-events-none shadow-sm">
            <IconGripVertical size={12} />
          </span>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-violet-50 flex items-center justify-center">
            <IconNotebook size={15} className="text-violet-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Preview
            </span>
            <span className="text-[14px] font-semibold text-gray-900 leading-none">
              Narrative angle
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Close preview"
        >
          <IconX size={16} />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {skeleton ? (
          <PreviewBody skeleton={skeleton} />
        ) : (
          <div className="p-6 text-[12.5px] text-gray-400">
            No angle selected.
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {skeleton && (
        <footer className="shrink-0 border-t border-gray-100 px-5 py-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[12.5px] text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectAngle(skeleton.id);
              onClose();
            }}
            disabled={alreadySelected}
            className={
              "inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-full transition-colors" +
              (alreadySelected
                ? " bg-violet-100 text-violet-700 border border-violet-200 cursor-default"
                : " bg-violet-600 text-white border border-violet-600 hover:bg-violet-700 active:scale-[0.98]")
            }
          >
            {alreadySelected ? (
              <>
                <IconCheck size={12} stroke={3} />
                Selected
              </>
            ) : (
              <>Select this angle</>
            )}
          </button>
        </footer>
      )}
    </aside>
  );
}

function PreviewBody({ skeleton }: { skeleton: NarrativeSkeleton }) {
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
    <div className="px-6 py-5 flex flex-col gap-6">
      {/* Title block */}
      <div>
        <h2 className="text-[20px] font-semibold text-gray-900 leading-tight">
          {title}
        </h2>
        <p className="mt-1 text-[12px] text-gray-500">
          Based on {sourceCounts.pads.toLocaleString()} PADs, {sourceCounts.isrs.toLocaleString()} ISRs, and {sourceCounts.icrs.toLocaleString()} ICRs.
        </p>
      </div>

      <Section label="The Challenge" body={challengeText} />
      <Section label="Interventions" body={interventionText} />

      {/* Country Examples — title + flag chips with brief context */}
      <div>
        <SectionLabel>Country Examples</SectionLabel>
        <div className="mt-2 flex flex-col gap-1.5">
          {countryExamples.map((name, i) => (
            <div key={name} className="flex items-center gap-2 text-[13px] text-gray-800">
              <span className="text-[16px] leading-none" aria-hidden>
                {countryFlags[i]}
              </span>
              <span className="font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <Section label="Pathways to Outcomes" body={pathwaysText} />
      <Section label="Lessons Learned" body={lessonsText} />
    </div>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-2 text-[13px] text-gray-800 leading-relaxed">{body}</p>
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

export {
  NARRATIVE_PANEL_DEFAULT_WIDTH,
  NARRATIVE_PANEL_MIN_WIDTH,
  NARRATIVE_PANEL_MAX_WIDTH,
};
