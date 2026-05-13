import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const AUDIO_EXT = new Set([".mp3", ".m4a", ".aac", ".ogg", ".wav", ".webm", ".flac"]);
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function safeExt(filename: string, allowed: Set<string>) {
  const ext = path.extname(filename).toLowerCase();
  if (!ext || !allowed.has(ext)) return null;
  return ext;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Dosya çok büyük veya bozuk" }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const artist = String(form.get("artist") ?? "").trim();
  const audio = form.get("audio");
  const cover = form.get("cover");

  if (!title) {
    return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });
  }
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "Ses dosyası gerekli" }, { status: 400 });
  }

  const audioExt = safeExt(audio.name, AUDIO_EXT) ?? ".mp3";
  const audioName = `${randomBytes(12).toString("hex")}${audioExt}`;
  const audioDir = path.join(process.cwd(), "public", "uploads", "audio");
  await mkdir(audioDir, { recursive: true });
  const audioBuf = Buffer.from(await audio.arrayBuffer());
  await writeFile(path.join(audioDir, audioName), audioBuf);
  const audioPath = `/uploads/audio/${audioName}`;

  let coverPath: string | null = null;
  if (cover instanceof File && cover.size > 0) {
    const cext = safeExt(cover.name, IMAGE_EXT);
    if (cext) {
      const coverName = `${randomBytes(12).toString("hex")}${cext}`;
      const coverDir = path.join(process.cwd(), "public", "uploads", "covers");
      await mkdir(coverDir, { recursive: true });
      await writeFile(path.join(coverDir, coverName), Buffer.from(await cover.arrayBuffer()));
      coverPath = `/uploads/covers/${coverName}`;
    }
  }

  const last = await prisma.track.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  const track = await prisma.track.create({
    data: { title, artist, audioPath, coverPath, sortOrder },
  });

  return NextResponse.json(track);
}
