import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function removePublicFile(webPath: string) {
  if (!webPath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", webPath.replace(/^\//, ""));
  try {
    await unlink(abs);
  } catch {
    // ignore missing file
  }
}

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }
  await removePublicFile(track.audioPath);
  if (track.coverPath) await removePublicFile(track.coverPath);
  await prisma.track.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
