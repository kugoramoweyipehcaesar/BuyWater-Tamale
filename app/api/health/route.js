import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Lightweight health for uptime pings / Render keep-warm. Avoids Prisma. */
export async function GET() {
  return NextResponse.json(
    { ok: true, ts: Date.now() },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
