export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="font-semibold text-slate-700">VetHaul</div>
            <div className="text-sm text-slate-500">Veteran-owned junk removal — Denver metro.</div>
            <a href="tel:7204280405" className="mt-1 block text-sm font-semibold text-slate-700 hover:text-slate-900">
              (720) 428-0405
            </a>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <a href="/services" className="hover:text-slate-900">Services</a>
            <a href="/pricing" className="hover:text-slate-900">Pricing</a>
            <a href="/about" className="hover:text-slate-900">About</a>
            <a href="/service-area" className="hover:text-slate-900">Service Area</a>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-xs leading-6 text-slate-400">
          <p>
            All prices shown are estimates only. Final pricing is confirmed on-site before any work begins.
            VetHaul does not haul hazardous materials including but not limited to paint, chemicals,
            asbestos, biohazardous waste, or treated wood. By submitting a quote request you consent
            to being contacted by VetHaul regarding your service request. We do not sell or share your
            personal information with third parties.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} VetHaul LLC. All rights reserved. Serving the greater Denver, Colorado metro area.
          </p>
        </div>
      </div>
    </footer>
  );
}
