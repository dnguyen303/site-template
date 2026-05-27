'use client';

import { useState } from 'react';

type LoadSize = 'single' | 'small' | 'medium' | 'large';
type TimeWindow = 'morning' | 'afternoon' | 'evening';

interface BookingResult {
  bookingId: string;
  estimatedPrice: number;
}

const LOAD_OPTIONS: { id: LoadSize; label: string; sub: string; price: number }[] = [
  { id: 'single', label: 'Single Item', sub: 'Furniture, appliance', price: 80 },
  { id: 'small', label: '1/4 Load', sub: 'A few items', price: 180 },
  { id: 'medium', label: '1/2 Load', sub: 'Most common job', price: 300 },
  { id: 'large', label: 'Full Load', sub: 'Large cleanout', price: 600 },
];

const TIME_OPTIONS: { id: TimeWindow; label: string; sub: string }[] = [
  { id: 'morning', label: 'Morning', sub: '8am – 12pm' },
  { id: 'afternoon', label: 'Afternoon', sub: '12pm – 4pm' },
  { id: 'evening', label: 'Evening', sub: '4pm – 7pm' },
];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function QuoteForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loadSize, setLoadSize] = useState<LoadSize>('medium');
  const [zip, setZip] = useState('');
  const [stairs, setStairs] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeWindow, setPreferredTimeWindow] = useState<TimeWindow | ''>('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<BookingResult | null>(null);

  const selected = LOAD_OPTIONS.find((o) => o.id === loadSize)!;
  const price = selected.price + (stairs ? 25 : 0);

  function goStep2() {
    setStep(2);
  }

  function goStep3() {
    const errs: Record<string, string> = {};
    if (!zip.trim()) errs.zip = 'Required';
    else if (!/^\d{5}$/.test(zip.trim())) errs.zip = 'Enter a valid 5-digit ZIP';
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(3);
  }

  function goStep4() {
    setStep(4);
  }

  async function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Required';
    if (!phone.trim()) errs.phone = 'Required';
    else if (!/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) errs.phone = 'Invalid phone number';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email address';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          zip: zip.trim(),
          loadSize,
          stairs,
          preferredDate: preferredDate || undefined,
          preferredTimeWindow: preferredTimeWindow || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult({ bookingId: data.bookingId, estimatedPrice: data.estimatedPrice });
      setStep(5);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase = 'w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400';
  const inputNormal = 'border-slate-200 bg-slate-50 focus:border-slate-900';
  const inputError = 'border-red-400 bg-red-50 focus:border-red-500';

  return (
    <aside
      id="quote"
      className="self-start rounded-[30px] border border-slate-200/70 bg-white p-5 shadow-[0_26px_60px_rgba(15,23,42,0.10)]"
    >
      {/* Step 1: Load size */}
      {step === 1 && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Instant estimate
          </div>
          <div className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.04em]">
            What are you hauling?
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {LOAD_OPTIONS.map((opt) => {
              const active = loadSize === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLoadSize(opt.id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    active
                      ? 'border-slate-900 bg-slate-950 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className={`text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                    {opt.sub}
                  </div>
                  <div className={`mt-0.5 text-[11px] font-semibold ${active ? 'text-white' : 'text-slate-600'}`}>
                    From ${opt.price}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Starting estimate</span>
            <span className="text-lg font-extrabold tracking-[-0.04em]">${selected.price}+</span>
          </div>

          <button
            type="button"
            onClick={goStep2}
            className="mt-3 w-full rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Continue
          </button>
        </>
      )}

      {/* Step 2: Location + stairs */}
      {step === 2 && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Step 2 of 4
          </div>
          <div className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.04em]">
            Pickup details
          </div>

          <div className="mt-4 space-y-2">
            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="ZIP code"
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value.replace(/\D/g, ''));
                  setErrors((prev) => ({ ...prev, zip: '' }));
                }}
                className={`${inputBase} ${errors.zip ? inputError : inputNormal}`}
              />
              {errors.zip && <p className="mt-1 text-xs text-red-600">{errors.zip}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={stairs}
                onChange={(e) => setStairs(e.target.checked)}
                className="h-4 w-4 rounded accent-slate-900"
              />
              <div>
                <div className="text-sm font-bold">Stairs involved</div>
                <div className="text-xs text-slate-400">+$20 – $50</div>
              </div>
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">{selected.label}{stairs ? ' + stairs' : ''}</span>
            <span className="text-lg font-extrabold tracking-[-0.04em]">${price}+</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setStep(1); setErrors({}); }}
              className="rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goStep3}
              className="rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Step 3 of 4
          </div>
          <div className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.04em]">
            When works for you?
          </div>
          <p className="mt-1 text-xs text-slate-400">Optional — skip if you&apos;re flexible.</p>

          <div className="mt-4 space-y-3">
            {/* Date picker */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Preferred date</label>
              <input
                type="date"
                min={getTomorrowDate()}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={`${inputBase} ${inputNormal} cursor-pointer`}
              />
            </div>

            {/* Time window */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Preferred time</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_OPTIONS.map((opt) => {
                  const active = preferredTimeWindow === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPreferredTimeWindow(active ? '' : opt.id)}
                      className={`rounded-2xl border p-3 text-center transition ${
                        active
                          ? 'border-slate-900 bg-slate-950 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className={`text-[10px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                        {opt.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setStep(2); setErrors({}); }}
              className="rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goStep4}
              className="rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Step 4: Contact */}
      {step === 4 && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Step 4 of 4
          </div>
          <div className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.04em]">
            Your contact info
          </div>

          <div className="mt-4 space-y-2">
            <div>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrors((prev) => ({ ...prev, firstName: '' }));
                }}
                className={`${inputBase} ${errors.firstName ? inputError : inputNormal}`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="Email address (optional)"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">{selected.label} · ZIP {zip}</span>
            <span className="text-lg font-extrabold tracking-[-0.04em]">${price}+</span>
          </div>

          {submitError && (
            <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{submitError}</p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setStep(3); setErrors({}); setSubmitError(''); }}
              className="rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Request pickup'}
            </button>
          </div>
        </>
      )}

      {/* Step 5: Success */}
      {step === 5 && result && (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
            ✓
          </div>
          <div className="mt-3 text-xl font-extrabold tracking-[-0.04em]">Request sent!</div>
          <p className="mt-1 text-sm text-slate-500">
            We will call to confirm within 1 hour.
          </p>

          <div className="mt-4 space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Load</span>
              <span className="font-bold">{selected.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimate</span>
              <span className="font-bold">${result.estimatedPrice}+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ZIP</span>
              <span className="font-bold">{zip}</span>
            </div>
            {preferredDate && (
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled</span>
                <span className="font-bold">
                  {new Date(preferredDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {preferredTimeWindow ? ` · ${preferredTimeWindow.charAt(0).toUpperCase() + preferredTimeWindow.slice(1)}` : ''}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Ref</span>
              <span className="font-mono text-xs text-slate-600">{result.bookingId.slice(0, 8)}</span>
            </div>
          </div>

          <a
            href="/"
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
          >
            Back to home
          </a>
        </div>
      )}
    </aside>
  );
}
