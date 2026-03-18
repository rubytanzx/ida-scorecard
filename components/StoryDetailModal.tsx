"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconChartLine, IconX } from "@tabler/icons-react";
import { type Story, story3Notebooks, story3PeerBoards } from "@/lib/mockData";
import StoryTagBadge from "./StoryTagBadge";
import StoryCard from "./StoryCard";

interface Props {
  story: Story;
  onClose: () => void;
}

export default function StoryDetailModal({ story, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Panel */}
      <div className="relative w-full max-w-[960px] max-h-[92vh] bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <IconX size={18} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Hero — clicking anywhere navigates to the workspace */}
          <Link href={story.ctaHref} className="relative block w-full h-[360px] shrink-0 cursor-pointer">
            {story.imageSrc && (
              <Image
                src={story.imageSrc}
                alt={story.imageAlt ?? ""}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.35)] to-[rgba(0,0,0,0.72)]" />
            <div className="absolute inset-0 flex items-end pb-9 px-9">
              <div className="flex flex-col gap-3 w-full max-w-[580px]">
                <div className="mb-1">
                  <StoryTagBadge tag={story.tag} />
                </div>
                <h1 className="text-[30px] font-semibold text-white leading-[1.4] tracking-[-1px]">
                  {story.headline}
                </h1>
                <div className="flex items-center gap-[2px]">
                  <span className="text-[13px] italic text-white">Workspace Type: </span>
                  <span className="text-[13px] text-[#60a5fa]">{story.workspaceType}</span>
                  <IconChartLine size={11} className="text-[#60a5fa] ml-[2px]" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[15px] font-semibold text-white">
                    {story.institutions.join(", ")}
                  </span>
                  <div className="flex items-center gap-[4px]">
                    <div
                      className="size-[16px] rounded-full flex items-center justify-center text-[5px] text-white font-normal shrink-0"
                      style={{ backgroundColor: story.author.color }}
                    >
                      {story.author.initials}
                    </div>
                    <span className="text-[15px] font-semibold text-[#b3e5fc] whitespace-nowrap">
                      {story.author.name}
                    </span>
                  </div>
                </div>
                {story.ctaLabel && (
                  <span className="flex items-center gap-1 text-[15px] font-semibold text-[#c9e1ff] w-fit">
                    {story.ctaLabel}
                    <IconArrowRight size={18} />
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Body */}
          <div className="px-9 py-8 flex flex-col gap-10">
            {/* Related notebooks */}
            <section>
              <h2 className="text-[20px] font-semibold text-[#212121] leading-[1.4] tracking-[-0.25px] mb-5">
                You might be interested in these
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {story3Notebooks.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>

            {/* Peer country boards */}
            <section>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#212121] leading-[1.4] tracking-[-0.25px]">
                    How do LAC peers compare?
                  </h2>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    Open a peer country board to benchmark Mexico&apos;s outcomes directly
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap pb-1"
                >
                  View all boards
                  <IconArrowRight size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {story3PeerBoards.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
