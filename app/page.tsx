import type { Metadata } from 'next';
import Image from 'next/image';
import { QuoteForm } from '@/components/QuoteForm';

export const metadata: Metadata = {
  title: 'VetHaul | Junk Removal Denver | Veteran-Owned',
  description:
    'Denver\'s veteran-owned junk removal company. Same-day pickup for furniture, appliances, garage cleanouts, and more. Upfront pricing from $80. Book online in 60 seconds.',
};

const pricing = [
  {
    tier: 'Minimum',
    price: '$80',
    description: 'Single small item or minimal load. Fast in and out.',
  },
  {
    tier: '1/4 Load',
    price: '$180 – $250',
    description: 'A few pieces of furniture or a light cleanout.',
  },
  {
    tier: '1/2 Load',
    price: '$300 – $450',
    description: 'Most common residential job. Covers most room cleanouts.',
  },
  {
    tier: 'Full Load',
    price: '$600 – $800+',
    description: 'Whole-home cleanouts, large commercial jobs, renovation debris.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Get a quote',
    description:
      'Choose load size, enter your location, and request a pickup without waiting for a callback.',
  },
  {
    number: '2',
    title: 'Pick a time',
    description:
      'Select a preferred day and window. Confirm details online instead of coordinating everything by phone.',
  },
  {
    number: '3',
    title: 'We haul it away',
    description: 'Your real crew arrives, does the work, and leaves the space clean.',
  },
];

const trustPoints = [
  {
    title: 'Veteran-owned and operated',
    description:
      'Founded and run by veterans who hold the business to the same standards they held in service: punctual, accountable, and no excuses.',
  },
  {
    title: 'Fully licensed and insured',
    description:
      'Every job is fully covered. You take zero risk having our crew on your property.',
  },
  {
    title: 'Upfront pricing, no surprises',
    description:
      'We give you a number before we start. If anything changes on-site, we tell you first.',
  },
  {
    title: 'Same-day and next-day availability',
    description:
      'We keep the schedule lean so we can move fast when you need us. Most jobs are booked within 24 hours.',
  },
];

const reviews = [
  {
    quote:
      'Mr. Pagnotta was quick to respond and very quick in taking care of getting my mattress taken away. He was a good communicator about the whole process. I really appreciated his help and would use him again!',
    name: 'Melissa S.',
    context: 'Homeowner',
  },
  {
    quote:
      'Anthony was fantastic to work with. He came out to our home, provided a very reasonable quote, and took care of removing several items and hauling them to the dump. His communication was excellent from start to finish, he showed up on time, and his pricing was more than fair. Everything was handled quickly and professionally. I would absolutely recommend Anthony to anyone needing reliable and efficient junk removal services.',
    name: 'Kyra G.',
    context: 'Homeowner',
  },
  {
    quote:
      "I've used Vethaul Junk Removal more than once, and they've been consistent every time. They came to my house and cleared out couches, boxes, and my entire garage quickly. The team was friendly, professional, and worked fast without rushing the job. Everything felt smooth and straightforward. I'll continue using them and would recommend them if you need junk removed.",
    name: 'Duy N.',
    context: 'Repeat Customer',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[30px] bg-slate-950 shadow-[0_28px_80px_rgba(2,6,23,0.18)]">
        <Image
          src="/hero-before-after.png"
          alt="VetHaul cleanup before and after"
          fill
          priority
          className="object-cover brightness-[0.55] contrast-[0.92] saturate-95"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.80)_0%,rgba(2,6,23,0.54)_36%,rgba(2,6,23,0.10)_68%,rgba(2,6,23,0.30)_100%)]" />

        <div className="relative z-10 grid gap-7 px-5 py-10 md:grid-cols-2 lg:px-8 lg:py-12">
          <div className="flex flex-col justify-between py-4 text-white lg:py-8">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em]">
                Veteran-owned • Residential junk removal
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-[0.94] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
                Clear the clutter without the friction.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
                VetHaul makes junk removal feel simple, professional, and fast. Get a quote,
                book online, and let the crew handle the heavy lifting.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#quote"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(2,6,23,0.15)] ring-1 ring-white/5 transition hover:bg-slate-800"
                >
                  Get instant quote
                </a>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  View pricing
                </a>
              </div>
            </div>

            <div className="mt-8 hidden grid-cols-3 gap-2 md:grid lg:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 lg:rounded-3xl lg:p-5">
                <div className="text-base font-extrabold tracking-[-0.03em] sm:text-xl lg:text-2xl">Before → After</div>
                <div className="mt-1 hidden text-sm text-white/75 sm:block">See the difference we make</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 lg:rounded-3xl lg:p-5">
                <div className="text-base font-extrabold tracking-[-0.03em] sm:text-xl lg:text-2xl">Free Estimates</div>
                <div className="mt-1 hidden text-sm text-white/75 sm:block">No obligation, no phone call</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 lg:rounded-3xl lg:p-5">
                <div className="text-base font-extrabold tracking-[-0.03em] sm:text-xl lg:text-2xl">Local team</div>
                <div className="mt-1 hidden text-sm text-white/75 sm:block">Real crew, real jobs, real trust</div>
              </div>
            </div>
          </div>

          <QuoteForm />
        </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-2">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">How it works</div>
            <h3 className="mt-4 text-2xl font-extrabold leading-none tracking-[-0.05em] md:text-4xl">
              A better customer experience than "call for quote."
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              No waiting on hold, no vague estimates. Get a price online, pick a time, and we
              show up on time, with the right crew for the job.
            </p>
            <div className="mt-8 grid gap-4">
              {steps.map((step) => (
                <div key={step.number} className="grid grid-cols-[48px_1fr] gap-4 rounded-3xl border border-slate-200 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-extrabold text-white">
                    {step.number}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{step.title}</div>
                    <p className="mt-1 text-sm leading-7 text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[240px] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.05)] lg:min-h-[560px]">
            <Image src="/crew-working.png" alt="VetHaul team doing the work" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section id="why-vethaul" className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-2">
          <div className="relative min-h-[240px] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.05)] lg:min-h-[560px]">
            <Image src="/owners-truck.png" alt="VetHaul owners in front of branded truck" fill className="object-cover" />
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Why VetHaul</div>
            <h3 className="mt-4 text-2xl font-extrabold leading-none tracking-[-0.05em] md:text-4xl">
              Show up on time. Price it right. Leave it clean.
            </h3>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Veteran-owned and operated out of Denver. We run a tight operation, licensed,
              insured, and built on the same standards we held in the military.
            </p>
            <div className="mt-6 grid gap-4">
              {trustPoints.map((point) => (
                <div key={point.title} className="border-t border-slate-200 pt-4">
                  <div className="text-base font-bold">{point.title}</div>
                  <p className="mt-1 text-sm leading-7 text-slate-500">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Reviews</div>
          <h3 className="mt-4 text-2xl font-extrabold leading-none tracking-[-0.05em] md:text-4xl">
            Trusted by homeowners and landlords across Denver.
          </h3>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Straightforward service, real pricing, no surprises on the day of pickup.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-lg leading-8 text-slate-700">“{review.quote}”</div>
                <div className="mt-5 text-sm font-bold text-slate-900">{review.name}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {review.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 py-6 pb-12 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Pricing</div>
          <h3 className="mt-4 text-2xl font-extrabold leading-none tracking-[-0.05em] md:text-4xl">
            Simple, upfront pricing.
          </h3>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            No hidden fees. We confirm the final price on-site before any work begins.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pricing.map((item) => (
              <div key={item.tier} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{item.tier}</div>
                <div className="mt-3 text-3xl font-extrabold tracking-[-0.06em] md:text-5xl">{item.price}</div>
                <p className="mt-3 text-sm leading-7 text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-7">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Cleanouts &amp; bulk jobs</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { name: 'Garage Cleanout', price: '$300 – $800', desc: 'Top-to-bottom clearing. We sort, haul, and donate — no prep required.' },
                { name: 'Apartment Cleanout', price: '$400 – $1,200', desc: 'Move-out and rental turnover cleanouts. Fast same-day availability.' },
                { name: 'Full House Cleanout', price: '$800 – $2,500+', desc: 'Estate, foreclosure, and whole-property jobs. We handle everything.' },
                { name: 'Storage Unit', price: '$150 – $600', desc: 'Clear a full unit in one trip. We load it and leave it broom-clean.' },
              ].map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    <span className="text-sm font-bold text-slate-700">{item.price}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
