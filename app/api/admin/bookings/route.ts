import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const bookings = await sql`
      SELECT
        b.id,
        c.first_name,
        c.last_name,
        c.phone,
        c.email,
        a.zip,
        b.load_size,
        b.stairs,
        b.estimated_price,
        b.status,
        b.preferred_date,
        b.preferred_time_window,
        b.notes,
        b.created_at
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      JOIN addresses a ON a.id = b.address_id
      ORDER BY b.created_at DESC
      LIMIT 50
    `;
    return NextResponse.json(bookings);
  } catch (err) {
    console.error('[VetHaul] DB error on GET /api/admin/bookings:', err);
    return NextResponse.json({ error: 'Failed to load bookings.' }, { status: 500 });
  }
}
