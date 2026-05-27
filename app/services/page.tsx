import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Junk Removal Services Denver',
  description:
    'Furniture removal, appliance haul-away, garage cleanouts, yard debris, rental property turnover, and demo debris. Full-service junk removal across the Denver metro.',
};

const services = [
  {
    name: 'Furniture removal',
    description:
      'Sofas, sectionals, mattresses, bed frames, dressers, dining sets , we haul it all. We carry items from any room in your home, not just curbside. No disassembly needed on your end.',
  },
  {
    name: 'Appliance haul-away',
    description:
      'Refrigerators, washers, dryers, dishwashers, microwaves, and more. We handle the heavy lifting and recycle appliances whenever possible. Freon removal is handled by a certified technician before disposal.',
  },
  {
    name: 'Garage cleanouts',
    description:
      'Full garage cleanouts from top to bottom. We sort, load, and haul everything out , donating usable items where we can and disposing of the rest responsibly. You do not need to sort ahead of time.',
  },
  {
    name: 'Yard debris removal',
    description:
      'Branches, brush, sod, bagged leaves, dirt, and green waste. We handle post-storm cleanup and ongoing landscape clear-outs. We do not haul hazardous materials or treated wood.',
  },
  {
    name: 'Rental property turnover',
    description:
      'Fast, reliable cleanouts between tenants. We coordinate with property managers and work around your schedule. A clean unit faster means less vacancy time , and we can usually turn around within 24 hours.',
  },
  {
    name: 'Light demo debris',
    description:
      'Drywall, lumber, flooring, tile, and other renovation leftovers. We pick up after your contractor or coordinate directly with your crew. We do not perform demolition , just the haul-away after it is done.',
  },
];

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Services"
        title="What we haul and how we do it."
        description="Residential and commercial junk removal across the Denver metro. We carry from any room, recycle what we can, and handle the heavy lifting so you don't have to."
      />

      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]"
            >
              <div className="text-xl font-bold tracking-[-0.03em]">{service.name}</div>
              <p className="mt-3 text-sm leading-7 text-slate-500">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[30px] bg-slate-950 px-10 py-12 text-center text-white shadow-[0_24px_60px_rgba(2,6,23,0.18)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Ready to clear it out?
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">
            Get a free estimate in under 60 seconds.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            No obligation. Upfront pricing. Same-day and next-day availability.
          </p>
          <a
            href="/#quote"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,0.12)] transition hover:bg-slate-100"
          >
            Get a Free Quote
          </a>
        </div>
      </section>
    </main>
  );
}
