import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import sql from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await sql`
    INSERT INTO contacts (name, email, phone, message)
    VALUES (${name}, ${email}, ${phone ?? null}, ${message})
  `;

  await resend.emails.send({
    from: "inquiries@yourdomain.com",
    to: "owner@youremail.com",
    subject: `New inquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone ?? "not provided"}\n\n${message}`,
  });

  return NextResponse.json({ ok: true });
}
