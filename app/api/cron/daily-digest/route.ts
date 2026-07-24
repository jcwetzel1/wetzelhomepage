import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildDigest } from "@/lib/mlb";
import { renderDigestEmail } from "@/lib/email-template";
import { getProspects } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prospects = await getProspects();
  const digests = await buildDigest(prospects);
  const { subject, html } = renderDigestEmail(digests);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.EMAIL_TO!,
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
