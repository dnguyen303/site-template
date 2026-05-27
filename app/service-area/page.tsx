import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Junk Removal Service Area | Denver Metro',
  description:
    'VetHaul serves Denver, Aurora, Lakewood, Westminster, Arvada, Thornton, and surrounding communities. Same-day and next-day junk removal throughout the metro area.',
};

const locations = [
  {
    name: 'Denver',
    description:
      'Serving residential and commercial customers across the Denver metro core, from Capitol Hill to Park Hill, Highland to Washington Park.',
  },
  {
    name: 'Aurora',
    description:
      "Colorado's third-largest city, with a range of residential neighborhoods and commercial properties. We cover Aurora from the DIA corridor to the southern suburbs.",
  },
  {
    name: 'Lakewood',
    description:
      'Serving Lakewood and surrounding Jefferson County communities, including Belmar, Green Mountain, and the Alameda corridor.',
  },
  {
    name: 'Westminster',
    description:
      'North metro customers in Westminster and nearby areas. We handle neighborhood cleanouts, estate clear-outs, and rental turnovers throughout the area.',
  },
  {
    name: 'Arvada',
    description:
      'Serving Arvada neighborhoods from Olde Town to the newer western suburban areas. Residential and rental property jobs handled quickly.',
  },
  {
    name: 'Thornton',
    description:
      'North Denver corridor customers in Thornton, Northglenn, and Commerce City. Same-day and next-day availability in most cases.',
  },
];

export default function ServiceAreaPage() {
  return (
    <main>
      <PageHero
        eyebrow="Service Area"
        title="Serving the greater Denver metro."
        description="We cover Denver and the surrounding communities. Same-day and next-day availability throughout most of the metro area."
      />

      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.name}
              className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]"
            >
              <div className="text-xl font-bold tracking-[-0.03em]">{location.name}</div>
              <p className="mt-3 text-sm leading-7 text-slate-500">{location.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-8 py-7 text-center">
          <p className="text-sm leading-7 text-slate-600">
            <span className="font-semibold text-slate-900">Not sure if we cover your area?</span>{' '}
            We serve the greater Denver metro area. Enter your ZIP in the quote form and we will
            confirm availability, or call us directly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[30px] bg-slate-950 px-10 py-12 text-center text-white shadow-[0_24px_60px_rgba(2,6,23,0.18)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Available today
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">
            Get a free estimate for your area.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Upfront pricing. No hidden fees. We confirm your ZIP before booking.
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
