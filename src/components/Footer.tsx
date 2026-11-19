export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-display text-base font-bold text-slate-900">
            LPG Guard #87
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Project #87 · Smart Monitoring of LPG Leakage with Local Alarm and Remote Notification · IIT Ropar RAHI
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
          <a href="#simulator" className="hover:text-slate-900 transition-colors whitespace-nowrap">
            Simulator
          </a>
          <a href="#architecture" className="hover:text-slate-900 transition-colors whitespace-nowrap">
            Architecture
          </a>
          <a href="#bom" className="hover:text-slate-900 transition-colors whitespace-nowrap">
            BOM &amp; Cost
          </a>
          <a href="#impact" className="hover:text-slate-900 transition-colors whitespace-nowrap">
            Impact
          </a>
          <a href="#pitch-kit" className="hover:text-slate-900 transition-colors whitespace-nowrap">
            Pitch Kit
          </a>
        </nav>
      </div>
    </footer>
  );
}
