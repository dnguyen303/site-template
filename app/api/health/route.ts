import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// Deep health check: verifies the DB is reachable and returns 503 on failure,
// so a plain HTTP uptime monitor catches DB outages via the status code.
export async function GET() {
  try {
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
