"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Giriş başarısız");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("Ağ hatası");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <div className="mb-8 text-center">
          <p className="font-[family-name:var(--font-syne)] text-2xl font-bold">Noctave Admin</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Şarkı yükleme ve kütüphane yönetimi</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-[var(--muted)]">
            Yönetici şifresi
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-0 transition focus:border-[var(--accent)]"
              placeholder="••••••••"
              required
            />
          </label>
          {err && <p className="text-sm text-red-300">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#5a32e6] py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(124,92,255,0.25)] transition enabled:hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Giriş…" : "Devam"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          <Link href="/" className="underline decoration-white/20 underline-offset-4 hover:text-white">
            Dinleyiciye dön
          </Link>
        </p>
      </div>
    </div>
  );
}
