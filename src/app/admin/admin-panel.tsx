"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { TrackDTO } from "@/types/track";

type Props = { initialTracks: TrackDTO[] };

export function AdminPanel({ initialTracks }: Props) {
  const router = useRouter();
  const [tracks, setTracks] = useState(initialTracks);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const sorted = useMemo(
    () => [...tracks].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
    [tracks],
  );

  const resetForm = useCallback(() => {
    setTitle("");
    setArtist("");
    setAudio(null);
    setCover(null);
    setMsg(null);
    setErr(null);
  }, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!audio) {
      setErr("Ses dosyası seçin");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("title", title.trim());
      fd.set("artist", artist.trim());
      fd.set("audio", audio);
      if (cover) fd.set("cover", cover);
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as TrackDTO & { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Yükleme başarısız");
        return;
      }
      const row: TrackDTO = {
        id: data.id,
        title: data.title,
        artist: data.artist,
        audioPath: data.audioPath,
        coverPath: data.coverPath ?? null,
        sortOrder: data.sortOrder,
        createdAt:
          typeof data.createdAt === "string"
            ? data.createdAt
            : new Date(data.createdAt as unknown as string).toISOString(),
      };
      setTracks((t) => [...t, row]);
      resetForm();
      setMsg("Şarkı eklendi.");
      router.refresh();
    } catch {
      setErr("Ağ veya dosya hatası");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Bu şarkıyı silmek istediğinize emin misiniz?")) return;
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/tracks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(data.error ?? "Silinemedi");
        return;
      }
      setTracks((t) => t.filter((x) => x.id !== id));
      setMsg("Silindi.");
      router.refresh();
    } catch {
      setErr("Ağ hatası");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">Kütüphane</h1>
          <p className="text-sm text-[var(--muted)]">Ses ve kapak yükleyin; dosyalar sunucuda saklanır.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--muted)] hover:bg-white/10"
          >
            Çıkış
          </button>
          <a
            href="/"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/10 hover:bg-white/15"
          >
            Siteyi aç
          </a>
        </div>
      </div>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">Yeni şarkı</h2>
        <form onSubmit={onUpload} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-[var(--muted)] sm:col-span-1">
            Başlık *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm text-[var(--muted)] sm:col-span-1">
            Sanatçı
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm text-[var(--muted)] sm:col-span-1">
            Ses dosyası * (mp3, wav, ogg…)
            <input
              type="file"
              accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav,.webm,.flac"
              onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
            />
          </label>
          <label className="block text-sm text-[var(--muted)] sm:col-span-1">
            Kapak (isteğe bağlı)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
            />
          </label>
          <div className="sm:col-span-2">
            {err && <p className="text-sm text-red-300">{err}</p>}
            {msg && <p className="text-sm text-[var(--accent-2)]">{msg}</p>}
            <button
              type="submit"
              disabled={uploading}
              className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#5a32e6] py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(124,92,255,0.25)] transition enabled:hover:brightness-110 disabled:opacity-50 sm:w-auto sm:px-10"
            >
              {uploading ? "Yükleniyor…" : "Yükle ve yayına al"}
            </button>
          </div>
        </form>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">Mevcut parçalar</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="pb-3 pr-4 font-medium">Başlık</th>
                <th className="pb-3 pr-4 font-medium">Sanatçı</th>
                <th className="pb-3 pr-4 font-medium">Dosya</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{t.title}</td>
                  <td className="py-3 pr-4 text-[var(--muted)]">{t.artist || "—"}</td>
                  <td className="py-3 pr-4">
                    <a
                      href={t.audioPath}
                      className="text-[var(--accent-2)] underline decoration-white/10 underline-offset-4 hover:text-white"
                      target="_blank"
                      rel="noreferrer"
                    >
                      dinle
                    </a>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void onDelete(t.id)}
                      className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {!sorted.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[var(--muted)]">
                    Henüz kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
