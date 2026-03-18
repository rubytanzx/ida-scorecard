const INST_LOGO: Record<string, string> = {
  IBRD: "/IBRD.svg",
  IFC:  "/IFC.svg",
  MIGA: "/MIGA.svg",
  WBG:  "/WBG.svg",
};

function logoFor(inst: string): string {
  return INST_LOGO[inst] ?? "/WBG.svg";
}

interface Props {
  institutions: string[];
  className?: string;
}

export default function InstitutionLogos({ institutions, className = "" }: Props) {
  const visible = institutions.slice(0, 3);
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Overlapping circles */}
      <div className="flex -space-x-2">
        {visible.map((inst) => (
          <div
            key={inst}
            title={inst}
            className="w-[22px] h-[22px] rounded-full border border-gray-200 bg-white flex items-center justify-center ring-1 ring-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoFor(inst)}
              alt={inst}
              className="w-[12px] h-[12px] object-contain"
            />
          </div>
        ))}
      </div>

      {/* Italic grey label */}
      <span className="text-[11px] italic text-gray-400">
        {institutions.join(", ")}
      </span>
    </div>
  );
}
