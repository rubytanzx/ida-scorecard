import { type Author } from "@/lib/mockData";

interface Props {
  author: Author;
  size?: "sm" | "xs";
}

export default function AuthorChip({ author }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white font-semibold text-[8px] shrink-0"
        style={{ backgroundColor: author.color }}
        aria-hidden="true"
      >
        {author.initials}
      </div>
      <span className="text-[11px] text-gray-600">{author.name}</span>
    </div>
  );
}
