const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-emerald-100 text-emerald-800',
  scheduled: 'bg-indigo-100 text-indigo-800',
  en_route: 'bg-purple-100 text-purple-800',
  complete: 'bg-slate-100 text-slate-700',
  canceled: 'bg-red-100 text-red-700',
};

const LOAD_LABELS: Record<string, string> = {
  single: 'Single item',
  small: 'Small load',
  medium: 'Medium load',
  large: 'Full load',
};

interface Booking {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  zip: string;
  load_size: string;
  stairs: boolean;
  estimated_price: number;
  status: string;
  preferred_date: string | null;
  preferred_time_window: string | null;
  notes: string | null;
  created_at: string;
}

async function getBookings(): Promise<Booking[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/admin/bookings`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

export default async function AdminBookingsPage() {
  let bookings: Booking[] = [];
  let error = '';
  try {
    bookings = await getBookings();
  } catch {
    error = 'Could not connect to database. Make sure Postgres is running.';
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Internal
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em]">Booking requests</h1>
        <p className="mt-2 text-sm text-slate-500">
          Latest 50 submissions. Refresh to see new entries.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-6 py-5 text-sm text-red-700">{error}</div>
      )}

      {!error && bookings.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          No bookings yet. Submit the quote form on the homepage to test.
        </div>
      )}

      {!error && bookings.length > 0 && (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">ZIP</th>
                  <th className="px-5 py-4">Load</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Preferred</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr
                    key={b.id}
                    className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {new Date(b.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {b.first_name} {b.last_name ?? ''}
                      {b.email && (
                        <div className="text-xs font-normal text-slate-400">{b.email}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">{b.phone}</td>
                    <td className="px-5 py-4">{b.zip}</td>
                    <td className="px-5 py-4">
                      {LOAD_LABELS[b.load_size] ?? b.load_size}
                      {b.stairs && <span className="ml-1 text-xs text-slate-400">+stairs</span>}
                    </td>
                    <td className="px-5 py-4 font-bold">${b.estimated_price}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {b.preferred_date
                        ? new Date(b.preferred_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                      {b.preferred_time_window && (
                        <div className="text-xs text-slate-400">{b.preferred_time_window}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_COLORS[b.status] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
