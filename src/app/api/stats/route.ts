import { NextResponse } from "next/server";
import { getSiteStats } from "@/lib/site-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const row = await getSiteStats();
  return NextResponse.json({
    liveViewers: row.liveViewers,
    totalListens: row.totalListens,
    listeningNow: row.listeningNow,
    updatedAt: row.updatedAt.toISOString(),
  });
}
