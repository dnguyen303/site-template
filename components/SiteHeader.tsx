export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="/" className="block">
          <div className="text-2xl font-extrabold tracking-[-0.04em]">VetHaul</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Junk Removal Services
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
          <a href="/#how-it-works" className="transition hover:text-slate-950">How it works</a>
          <a href="/#why-vethaul" className="transition hover:text-slate-950">Why VetHaul</a>
          <a href="/#pricing" className="transition hover:text-slate-950">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:7204280405"
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <span className="hidden md:inline">(720) 428-0405</span>
            <span className="md:hidden">Call</span>
          </a>
          <a
            href="/#quote"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(2,6,23,0.15)] transition hover:bg-slate-800"
          >
            Get Quote
          </a>
        </div>
      </div>
    </header>
  );
}
