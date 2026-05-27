import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'About VetHaul | Veteran-Owned Junk Removal Denver',
  description:
    'VetHaul is a veteran-owned junk removal company serving the Denver metro. Licensed, insured, and built on military standards of punctuality and accountability.',
};

const trustPoints = [
  {
    label: 'Licensed & insured',
    detail: 'Fully covered on every job. You take zero risk having us on your property.',
  },
  {
    label: 'Upfront pricing',
    detail: 'No hidden fees. You see the number before we lift a single item.',
  },
  {
    label: 'On time, every time',
    detail:
      'We give you a tight arrival window and we hit it. Your schedule matters as much as the job.',
  },
  {
    label: 'Responsible disposal',
    detail:
      'We donate usable items to local organizations and recycle what we can before anything goes to a landfill.',
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About VetHaul"
        title="Built by veterans. Run like one."
        description="VetHaul was founded on a simple idea: a junk removal company that shows up the way a good unit does. On time, prepared, and without excuses."
      />

      <section className="mx-auto max-w-5xl px-5 pb-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Brand story */}
          <div className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-10 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Our story
            </div>
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-slate-900">
              Service built on discipline, not hustle culture.
            </h2>
            <p className="text-sm leading-8 text-slate-600">
              After years of service, we came home and looked for work that matched the standards
              we held in the military. We found a lot of junk removal companies, and not many that
              ran a tight operation. So we built one ourselves.
            </p>
            <p className="text-sm leading-8 text-slate-600">
              VetHaul is veteran-owned and operated out of the Denver metro. We keep things simple:
              show up when we say we will, price it fairly, haul it cleanly, and treat your home
              with respect. We are not the biggest company in the area. We are the most reliable one.
            </p>
          </div>

          {/* Photo */}
          <div className="overflow-hidden rounded-[30px] shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <Image
              src="/owners-truck.png"
              alt="VetHaul owners and truck"
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Trust points */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {trustPoints.map((point) => (
            <div
              key={point.label}
              className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
            >
              <div className="text-base font-bold tracking-[-0.02em] text-slate-900">
                {point.label}
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-500">{point.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20 lg:px-8">
        <div className="rounded-[30px] bg-slate-950 px-10 py-12 text-center text-white shadow-[0_24px_60px_rgba(2,6,23,0.18)]">
          <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
            Ready to work with us?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Get a free estimate. No pressure, no hidden fees.
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
