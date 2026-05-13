"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteStatsDTO } from "@/types/stats";

function formatInt(n: number) {
  return n.toLocaleString("tr-TR");
}

function useAnimatedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const delta = target - from;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + delta * eased));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

export function LiveStatsStrip() {
  const [stats, setStats] = useState<SiteStatsDTO | null>(null);
  const [ready, setReady] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as SiteStatsDTO;
      setStats(data);
    } catch {
      /* ignore */
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 45_000);
    return () => window.clearInterval(id);
  }, []);

  const live = useAnimatedNumber(stats?.liveViewers ?? 0, 700);
  const total = useAnimatedNumber(stats?.totalListens ?? 0, 1100);
  const now = useAnimatedNumber(stats?.listeningNow ?? 0, 650);

  const items = [
    { label: "Canlı izleyici", value: live, hint: "Yayın ekranı" },
    { label: "Toplam dinlenme", value: total, hint: "Tüm zamanlar" },
    { label: "Şu an dinliyor", value: now, hint: "Anlık oturum" },
  ] as const;

  return (
    <div className="stat-strip mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 px-5 sm:grid-cols-3 sm:gap-4 sm:px-10">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`stat-card glass relative overflow-hidden rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${ready ? "glass-reveal" : "opacity-60"}`}
          style={ready ? { animationDelay: `${i * 0.12}s` } : undefined}
        >
          <div className="stat-card-shine pointer-events-none absolute inset-0" />
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
          <p className="stat-card-value mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
            {formatInt(item.value)}
          </p>
          <p className="mt-1 text-xs text-white/35">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}
