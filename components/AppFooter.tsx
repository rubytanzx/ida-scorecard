const WBG_BRANDS = ["IBRD", "IDA", "IFC", "MIGA", "ICSID"];

export default function AppFooter() {
  return (
    <footer className="w-full bg-[#1a1f2e] text-white mt-16">
      <div className="max-w-[1440px] mx-auto px-10 h-[80px] flex items-center justify-between">
        {/* Left: Brand area */}
        <div className="flex items-center gap-4">
          {/* WBG Logo placeholder */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#009FDA] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5" />
                <path d="M4 7h6M7 4v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[11px] font-bold tracking-wider text-white/90 uppercase">
              World Bank Group
            </span>
          </div>

          <div className="w-px h-4 bg-white/20" />

          {/* Brands */}
          <nav className="flex items-center gap-4" aria-label="World Bank Group brands">
            {WBG_BRANDS.map((brand) => (
              <a
                key={brand}
                href="#"
                className="text-[11px] text-white/50 hover:text-white/90 transition-colors"
              >
                {brand}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: Copyright */}
        <p className="text-[11px] text-white/40">
          © 2026 World Bank Group, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
