type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)] md:p-12">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</div>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-none tracking-[-0.05em] md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{description}</p>
      </div>
    </section>
  );
}
