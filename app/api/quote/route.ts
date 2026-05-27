import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import sql from '@/lib/db';

const BASE_PRICES: Record<string, number> = {
  single: 80,
  small: 180,
  medium: 300,
  large: 600,
};

const LOAD_LABELS: Record<string, string> = {
  single: 'Single Item',
  small: '1/4 Load',
  medium: '1/2 Load',
  large: 'Full Load',
};

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { firstName, lastName, phone, email, zip, loadSize, stairs, preferredDate, preferredTimeWindow, notes } = body as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    zip?: string;
    loadSize?: string;
    stairs?: boolean;
    preferredDate?: string | null;
    preferredTimeWindow?: string | null;
    notes?: string | null;
  };

  if (!firstName || !phone || !zip || !loadSize) {
    return NextResponse.json(
      { error: 'firstName, phone, zip, and loadSize are required.' },
      { status: 400 },
    );
  }

  if (!BASE_PRICES[loadSize]) {
    return NextResponse.json({ error: 'Invalid loadSize.' }, { status: 400 });
  }

  const estimatedPrice = BASE_PRICES[loadSize] + (stairs ? 20 : 0);

  try {
    const [customer] = await sql`
      INSERT INTO customers (first_name, last_name, phone, email)
      VALUES (${firstName}, ${lastName ?? null}, ${phone}, ${email ?? null})
      RETURNING id
    `;

    const [address] = await sql`
      INSERT INTO addresses (customer_id, zip, access_notes)
      VALUES (${customer.id}, ${zip}, ${notes ?? null})
      RETURNING id
    `;

    const [booking] = await sql`
      INSERT INTO bookings (
        customer_id, address_id, service_type, load_size,
        stairs, preferred_date, preferred_time_window,
        estimated_price, notes
      )
      VALUES (
        ${customer.id}, ${address.id}, 'junk_removal', ${loadSize},
        ${stairs ?? false}, ${preferredDate ?? null}, ${preferredTimeWindow ?? null},
        ${estimatedPrice}, ${notes ?? null}
      )
      RETURNING id
    `;

    console.log('[VetHaul] New booking:', booking.id);

    // Send email notification if API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'VetHaul Bookings <bookings@vethauljunkremoval.com>',
          to: 'vethauljunkremoval@gmail.com',
          subject: `New booking request — ${firstName}, ${LOAD_LABELS[loadSize]}, ZIP ${zip}`,
          html: `
            <h2>New Booking Request</h2>
            <table style="border-collapse:collapse;width:100%;max-width:500px">
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#64748b">Name</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${firstName} ${lastName ?? ''}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#64748b">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${phone}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#64748b">ZIP</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${zip}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#64748b">Load</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${LOAD_LABELS[loadSize]}${stairs ? ' + stairs' : ''}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#64748b">Estimate</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">$${estimatedPrice}+</td></tr>
              <tr><td style="padding:8px;color:#64748b">Booking ID</td><td style="padding:8px;font-family:monospace;font-size:12px">${booking.id}</td></tr>
            </table>
            <p style="margin-top:24px">
              <a href="https://vethauljunkremoval.com/admin/bookings" style="background:#0f172a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View all bookings</a>
            </p>
          `,
        });
      } catch (emailErr) {
        console.error('[VetHaul] Email send failed:', emailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      estimatedPrice,
      status: 'new',
    });
  } catch (err) {
    console.error('[VetHaul] DB error on POST /api/quote:', err);
    return NextResponse.json({ error: 'Failed to save booking. Please try again.' }, { status: 500 });
  }
}
