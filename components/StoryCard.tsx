"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconChartLine } from "@tabler/icons-react";
import { type Story } from "@/lib/mockData";
import StoryTagBadge from "./StoryTagBadge";
import AuthorChip from "./AuthorChip";
import InstitutionLogos from "./InstitutionLogos";

interface Props {
  story: Story;
}

const cardClass =
  "group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300";

export default function StoryCard({ story }: Props) {
  const inner = (
    <>
      {/* Image */}
      {story.imageSrc ? (
        <div className="relative h-[168px] overflow-hidden bg-gray-100">
          <Image
            src={story.imageSrc}
            alt={story.imageAlt ?? ""}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-[168px] bg-gradient-to-br from-slate-100 to-slate-200" />
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-col gap-2 flex-1">
          <StoryTagBadge tag={story.tag} />
          <h3 className="text-[13.5px] font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-3">
            {story.headline}
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-[10.5px] text-gray-400">Workspace Type: {story.workspaceType}</span>
            <IconChartLine size={10} className="text-gray-400" />
          </div>
        </div>

        {/* Divider + meta */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <InstitutionLogos institutions={story.institutions} />
            <AuthorChip author={story.author} size="xs" />
          </div>
          {story.ctaLabel && (
            <span className="group/cta flex items-center gap-1 text-[11.5px] text-blue-600 font-semibold hover:text-blue-700 transition-colors w-fit">
              {story.ctaLabel}
              <IconArrowRight size={11} className="group-hover/cta:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (story.href) {
    return <Link href={story.href} className={cardClass}>{inner}</Link>;
  }
  return <article className={cardClass}>{inner}</article>;
}
