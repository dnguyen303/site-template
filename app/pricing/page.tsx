import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Junk Removal Pricing Denver',
  description:
    'Transparent junk removal pricing in Denver. Load pricing from $80, single items from $50, garage cleanouts from $300, full house cleanouts from $800. No hidden fees.',
};

const loadTiers = [
  { name: 'Minimum', fraction: 'min', price: '$80' },
  { name: '1/8 Load', fraction: '1/8', price: '$120 – $150' },
  { name: '1/4 Load', fraction: '1/4', price: '$180 – $250' },
  { name: '1/2 Load', fraction: '1/2', price: '$300 – $450' },
  { name: '3/4 Load', fraction: '3/4', price: '$450 – $600' },
  { name: 'Full Load', fraction: 'full', price: '$600 – $800+' },
];

const singleItems = [
  { name: 'Couch / Sofa', price: '$80 – $120' },
  { name: 'Loveseat', price: '$60 – $100' },
  { name: 'Recliner', price: '$50 – $80' },
  { name: 'Mattress', price: '$60 – $100' },
  { name: 'Box Spring', price: '$40 – $70' },
  { name: 'Refrigerator', price: '$80 – $140' },
  { name: 'Washer / Dryer', price: '$75 – $125 each' },
  { name: 'Dresser / Cabinet', price: '$60 – $100' },
  { name: 'Table', price: '$50 – $90' },
];

const cleanouts = [
  { name: 'Garage Cleanout', price: '$300 – $800' },
  { name: 'Apartment Cleanout', price: '$400 – $1,200' },
  { name: 'Full House Cleanout', price: '$800 – $2,500+' },
  { name: 'Storage Unit', price: '$150 – $600' },
  { name: 'Yard Debris', price: '$100 – $500' },
];

const additionalFees = [
  { name: 'Stairs', price: '+$20 – $50' },
  { name: 'Heavy Items (pianos, safes)', price: '+$100 – $300' },
  { name: 'Disassembly', price: '+$20 – $80' },
  { name: 'Long Carry Distance', price: '+$20 – $75' },
];

export default function PricingPage() {
  return (
    <main>
      <PageHero
        eyebrow="Pricing"
        title="Upfront pricing. No surprises."
        description="All prices are confirmed on-site before any work begins. Final cost depends on actual volume, access, and any applicable add-ons."
      />

      {/* Load Pricing */}
      <section className="mx-auto max-w-7xl px-5 pb-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Load pricing
          </div>
          <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">
            Most common jobs
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Priced by how much truck space your items fill. We estimate on-site and confirm before we start.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loadTiers.map((tier) => (
              <div
                key={tier.name}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <div className="text-sm font-bold text-slate-900">{tier.name}</div>
                <div className="text-sm font-bold text-slate-700">{tier.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Single Item Pricing */}
      <section className="mx-auto max-w-7xl px-5 pb-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Single item pricing
          </div>
          <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">
            Just one thing to go?
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Per-item pricing for common furniture and appliances. Includes carry-out from any room.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {singleItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
              >
                <span className="text-sm text-slate-700">{item.name}</span>
                <span className="text-sm font-bold text-slate-900">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cleanouts & Bulk Jobs */}
      <section className="mx-auto max-w-7xl px-5 pb-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Cleanouts &amp; bulk jobs
          </div>
          <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">
            Full property and large-volume removal
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Ranges reflect variation in volume and access. We quote on-site for larger jobs.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cleanouts.map((item) => (
              <div
                key={item.name}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <div className="text-sm font-bold text-slate-900">{item.name}</div>
                <div className="mt-2 text-sm font-bold text-slate-700">{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Fees */}
      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Additional fees
          </div>
          <h3 className="mt-3 text-xl font-extrabold tracking-[-0.03em]">
            If applicable to your job
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            These are only added when relevant and always confirmed before work begins.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {additionalFees.map((fee) => (
              <div
                key={fee.name}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3"
              >
                <span className="text-sm text-slate-700">{fee.name}</span>
                <span className="text-sm font-bold text-slate-900">{fee.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="rounded-[24px] border border-slate-100 bg-white px-8 py-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <h3 className="text-base font-bold tracking-[-0.02em] text-slate-900">
            What's included in every job
          </h3>
          <ul className="mt-4 grid gap-2 text-sm leading-7 text-slate-600 sm:grid-cols-2">
            <li>✓ On-site pricing confirmation before we start</li>
            <li>✓ Labor and loading, you don't lift anything</li>
            <li>✓ Responsible disposal, donation, and recycling</li>
            <li>✓ Same-day and next-day availability</li>
            <li>✓ No hidden fees or surprise add-ons</li>
            <li>✓ Fully licensed and insured crew</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[30px] bg-slate-950 px-10 py-12 text-center text-white shadow-[0_24px_60px_rgba(2,6,23,0.18)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            No obligation
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">
            Get your exact price in 60 seconds.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Tell us what you have and we will confirm the price before we start.
          </p>
          <a
            href="/#quote"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Get a Free Quote
          </a>
        </div>
      </section>
    </main>
  );
}
