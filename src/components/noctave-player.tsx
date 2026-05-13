"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TrackDTO } from "@/types/track";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function EqBars({ active }: { active: boolean }) {
  const heights = [40, 65, 45, 80, 55, 90, 50, 70, 38, 62];
  return (
    <div className="flex h-14 items-end gap-0.5 opacity-90" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className="eq-bar w-1 rounded-full bg-gradient-to-t from-[var(--accent)] to-[var(--accent-2)]"
          style={{
            height: `${h}%`,
            animationPlayState: active ? "running" : "paused",
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}

export function NoctavePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks, setTracks] = useState<TrackDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);

  const current = tracks[index] ?? null;

  const loadTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tracks", { cache: "no-store" });
      if (!res.ok) throw new Error("Liste alınamadı");
      const data: TrackDTO[] = await res.json();
      const normalized = data.map((t) => ({
        ...t,
        createdAt: typeof t.createdAt === "string" ? t.createdAt : String(t.createdAt),
      }));
      setTracks(normalized);
      setIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume, current?.id]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    a.src = current.audioPath;
    a.load();
    if (playing) {
      void a.play().catch(() => setPlaying(false));
    }
  }, [current?.id, current?.audioPath]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [playing, current]);

  const playTrackAt = useCallback((i: number) => {
    setIndex(i);
    setPlaying(true);
    queueMicrotask(() => {
      const a = audioRef.current;
      if (a) void a.play().catch(() => setPlaying(false));
    });
  }, []);

  const next = useCallback(() => {
    if (!tracks.length) return;
    setIndex((i) => (i + 1) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const prev = useCallback(() => {
    if (!tracks.length) return;
    setIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-sm font-bold text-[#0a0a10] shadow-[0_0_28px_var(--glow)]">
            N
          </div>
          <div>
            <p className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight sm:text-xl">
              Noctave FM
            </p>
            <p className="text-xs text-[var(--muted)]">Gece akışı · net ses · sade sıra</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadTracks()}
            className="rounded-full border border-[var(--border)] bg-white/5 px-4 py-2 text-sm text-[var(--muted)] transition hover:border-white/20 hover:text-white"
          >
            Yenile
          </button>
          <Link
            href="/admin/login"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/15"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 pb-28 pt-4 sm:flex-row sm:px-10 sm:pb-24">
        <section className="glass flex flex-1 flex-col overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
            <div className="relative mx-auto aspect-square w-full max-w-[320px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 lg:mx-0 lg:max-w-[280px]">
              {current?.coverPath ? (
                <Image
                  src={current.coverPath}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="320px"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1030] via-[#0e1424] to-[#0b1a18]">
                  <div className="absolute inset-0 opacity-60 mix-blend-screen">
                    <div className="absolute -left-1/4 top-0 h-3/4 w-3/4 rounded-full bg-[var(--accent)] blur-[80px]" />
                    <div className="absolute -right-1/4 bottom-0 h-3/4 w-3/4 rounded-full bg-[var(--accent-2)] blur-[90px]" />
                  </div>
                  <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                    <EqBars active={playing} />
                    <p className="font-[family-name:var(--font-syne)] text-xl font-semibold text-white/90">
                      {current?.title ?? "Henüz şarkı yok"}
                    </p>
                    <p className="text-sm text-white/50">{current?.artist || "—"}</p>
                  </div>
                </div>
              )}
              {current?.coverPath && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-left">
                    <p className="font-[family-name:var(--font-syne)] text-2xl font-bold leading-tight text-white drop-shadow">
                      {current.title}
                    </p>
                    {current.artist ? (
                      <p className="mt-1 text-sm text-white/80">{current.artist}</p>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent-2)]">
                  Şimdi çalıyor
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold leading-tight sm:text-4xl">
                  {current?.title ?? "Kütüphaneni doldur"}
                </h1>
                <p className="mt-2 text-lg text-[var(--muted)]">{current?.artist || "Admin panelinden şarkı ekleyin"}</p>
              </div>

              <div className="space-y-3">
                <div
                  className="group relative h-2 cursor-pointer overflow-hidden rounded-full bg-white/10"
                  onClick={(e) => {
                    const a = audioRef.current;
                    if (!a || !duration) return;
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    a.currentTime = ratio * duration;
                  }}
                  role="slider"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    const a = audioRef.current;
                    if (!a || !duration) return;
                    if (e.key === "ArrowRight") a.currentTime = Math.min(duration, a.currentTime + 5);
                    if (e.key === "ArrowLeft") a.currentTime = Math.max(0, a.currentTime - 5);
                  }}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={!tracks.length}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg transition enabled:hover:bg-white/10 disabled:opacity-30"
                    aria-label="Önceki"
                  >
                    ⏮
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    disabled={!current}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#5a32e6] text-2xl text-white shadow-[0_12px_40px_rgba(124,92,255,0.35)] transition enabled:hover:brightness-110 disabled:opacity-30"
                    aria-label={playing ? "Duraklat" : "Oynat"}
                  >
                    {playing ? "⏸" : "▶"}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!tracks.length}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg transition enabled:hover:bg-white/10 disabled:opacity-30"
                    aria-label="Sonraki"
                  >
                    ⏭
                  </button>
                </div>
                <label className="flex min-w-[140px] flex-1 items-center gap-2 text-xs text-[var(--muted)] sm:flex-initial">
                  <span className="hidden sm:inline">Ses</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-1 flex-1 cursor-pointer accent-[var(--accent-2)]"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        <aside className="glass flex max-h-[560px] w-full flex-col rounded-3xl sm:w-[320px] sm:shrink-0">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold">Sıradaki</h2>
            <p className="text-xs text-[var(--muted)]">{tracks.length} parça</p>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto p-2">
            {loading && (
              <p className="px-4 py-6 text-sm text-[var(--muted)]">Yükleniyor…</p>
            )}
            {error && (
              <p className="px-4 py-6 text-sm text-red-300">{error}</p>
            )}
            {!loading && !tracks.length && (
              <div className="space-y-3 px-4 py-6 text-sm text-[var(--muted)]">
                <p>Henüz şarkı yok.</p>
                <Link
                  href="/admin/login"
                  className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white ring-1 ring-white/10 hover:bg-white/15"
                >
                  Admin ile yükle
                </Link>
              </div>
            )}
            <ul className="space-y-1">
              {tracks.map((t, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => playTrackAt(i)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                      i === index
                        ? "bg-white/10 ring-1 ring-[var(--accent)]/40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs text-[var(--muted)]">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-white">{t.title}</span>
                      <span className="block truncate text-xs text-[var(--muted)]">{t.artist || "—"}</span>
                    </span>
                    {i === index && playing && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-2)]">
                        LIVE
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      <footer className="relative z-10 px-5 py-6 text-center text-xs text-[var(--muted)] sm:px-10">
        Boşluk tuşu: oynat / duraklat · Noctave FM — kişisel yayın için tasarlandı.
      </footer>

      <audio
        ref={audioRef}
        className="hidden"
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={next}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}
