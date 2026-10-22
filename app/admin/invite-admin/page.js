"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { ArrowLeft, Loader2, UserPlus, Mail } from "lucide-react";

export default function InviteAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [invites, setInvites] = useState([]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  const load = useCallback(async () => {
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user || !["ADMIN", "SUPER_ADMIN"].includes(me.user.role)) {
        router.push("/admin-login");
        return;
      }
      setUser(me.user);
      const res = await fetch("/api/admin/invite").then((r) => r.json()).catch(() => ({}));
      setInvites(res.invites || res.items || []);
    } catch (err) {
      console.error("[admin]", err);
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
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendInvite(e) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Invite failed");
      showToast("Invite sent");
      setEmail("");
      await load();
    } catch (err) {
      showToast(err.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF6FC] pb-16">
      <SiteHeader user={user} />
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#0B2545] px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
      <main className="mx-auto max-w-lg px-4 py-6">
        <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#0077C8]">
          <ArrowLeft className="h-4 w-4" /> Admin Office
        </Link>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0077C8]/10">
            <UserPlus className="h-5 w-5 text-[#0077C8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B2545]">Invite admin</h1>
            <p className="text-sm text-slate-500">Send an admin invite by email</p>
          </div>
        </div>

        <form onSubmit={sendInvite} className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full py-2.5 text-sm outline-none"
            />
          </div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[#0077C8] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send invite"}
          </button>
        </form>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-[#0B2545]">Recent invites</h2>
          {invites.length === 0 && (
            <p className="rounded-xl border bg-white p-6 text-center text-sm text-slate-500">No invites yet.</p>
          )}
          {invites.map((inv) => (
            <div key={inv.id || inv.email} className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm">
              <p className="font-semibold text-[#0B2545]">{inv.email}</p>
              <p className="text-xs text-slate-500">{inv.role} · {inv.status || "pending"}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
