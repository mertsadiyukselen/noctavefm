import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteStats, updateSiteStats } from "@/lib/site-stats";

export const dynamic = "force-dynamic";

function parseNonNegInt(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseInt(v, 10) : NaN;
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(Math.floor(n), 2_000_000_000);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const row = await getSiteStats();
  return NextResponse.json({
    liveViewers: row.liveViewers,
    totalListens: row.totalListens,
    listeningNow: row.listeningNow,
    updatedAt: row.updatedAt.toISOString(),
  });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const current = await getSiteStats();
  const liveViewers = parseNonNegInt(body.liveViewers, current.liveViewers);
  const totalListens = parseNonNegInt(body.totalListens, current.totalListens);
  const listeningNow = parseNonNegInt(body.listeningNow, current.listeningNow);

  const row = await updateSiteStats({ liveViewers, totalListens, listeningNow });
  return NextResponse.json({
    liveViewers: row.liveViewers,
    totalListens: row.totalListens,
    listeningNow: row.listeningNow,
    updatedAt: row.updatedAt.toISOString(),
  });
}
