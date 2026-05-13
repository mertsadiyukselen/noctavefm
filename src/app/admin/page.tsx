import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { TrackDTO } from "@/types/track";
import { AdminPanel } from "./admin-panel";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const rows = await prisma.track.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const tracks: TrackDTO[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    audioPath: r.audioPath,
    coverPath: r.coverPath,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen px-5 py-10 sm:px-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-white">
          ← Ana sayfa
        </Link>
      </div>
      <AdminPanel initialTracks={tracks} />
    </div>
  );
}
