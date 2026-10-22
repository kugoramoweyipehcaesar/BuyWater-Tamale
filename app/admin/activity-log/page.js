"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { ArrowLeft, Loader2, Activity, RefreshCw } from "lucide-react";

export default function ActivityLogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [live, setLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const silent = useRef(false);

  const load = useCallback(async () => {
    try {
      if (!silent.current) setLoading(true);
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user || !["ADMIN", "SUPER_ADMIN"].includes(me.user.role)) {
        router.push("/admin-login");
        return;
      }
      setUser(me.user);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "50",
      });
      if (action) params.set("action", action);
      if (q.trim()) params.set("q", q.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/activity-log?${params}`).then((r) =>
        r.json()
      );
      setLogs(res.logs || []);
      setTotalPages(res.totalPages || 1);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("[admin activity-log]", err);
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        if (!me.user || !["ADMIN", "SUPER_ADMIN"].includes(me.user.role)) {
          router.push("/admin-login");
        }
      } catch {
        router.push("/admin-login");
      }
    } finally {
      setLoading(false);
      silent.current = false;
    }
  }, [router, page, action, q, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      silent.current = true;
      load();
    }, 12000);
    return () => clearInterval(t);
  }, [live, load]);

  if (loading && !logs.length) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF6FC] pb-16">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#0077C8]">
          <ArrowLeft className="h-4 w-4" /> Admin Office
        </Link>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0077C8]/10">
              <Activity className="h-5 w-5 text-[#0077C8]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B2545]">Activity Log</h1>
              <p className="text-sm text-slate-500">
                {live ? "Live · 12s" : "Paused"}
                {lastRefresh ? ` · ${lastRefresh.toLocaleTimeString()}` : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => setLive((v) => !v)} className={`rounded-lg px-2 py-1 text-xs font-semibold ${live ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {live ? "Live" : "Paused"}
            </button>
            <button type="button" onClick={load} className="rounded-lg p-2 text-slate-400">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div className="space-y-2">
          {logs.length === 0 && (
            <p className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">No activity yet.</p>
          )}
          {logs.map((row) => (
            <div key={row.id} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#0B2545]">{row.action}</p>
                <p className="text-[11px] text-slate-400">{row.createdAt ? new Date(row.createdAt).toLocaleString() : ""}</p>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{row.email || "—"} · {row.details || ""}</p>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </main>
    </div>
  );
}
