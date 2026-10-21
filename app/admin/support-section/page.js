"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, MessageCircle } from "lucide-react";

const DEFAULTS = {
  whatsapp: {
    title: "WhatsApp",
    desc: "0531448824 — Fastest response · opens DM",
  },
  email: {
    title: "Email",
    desc: "We'll reply within 24 hours",
  },
  hours: {
    title: "Hours",
    desc: "7 AM - 8:30 PM DAILY",
  },
  issues: {
    title: "Issues?",
    desc: "Late delivery, wrong hostel — report from your Profile → Submit complaint",
  },
};

export default function AdminSupportSectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState(DEFAULTS);

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
      const set = await fetch("/api/settings").then((r) => r.json());
      const s = set.settings || {};
      const sec = s.supportSection || {};
      const phone =
        s.whatsappNumber || s.callNumber1 || s.adminPhone || "0531448824";
      setForm({
        whatsapp: {
          title: sec.whatsapp?.title || "WhatsApp",
          desc:
            sec.whatsapp?.desc ||
            `${phone} — Fastest response · opens DM`,
        },
        email: {
          title: sec.email?.title || "Email",
          desc: sec.email?.desc || "We'll reply within 24 hours",
        },
        hours: {
          title: sec.hours?.title || "Hours",
          desc: sec.hours?.desc || s.operatingHours || "7 AM - 8:30 PM DAILY",
        },
        issues: {
          title: sec.issues?.title || "Issues?",
          desc:
            sec.issues?.desc ||
            "Late delivery, wrong hostel — report from your Profile → Submit complaint",
        },
      });
    } catch {
      router.push("/admin-login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function updateCard(key, field, value) {
    setForm((f) => ({
      ...f,
      [key]: { ...f[key], [field]: value },
    }));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supportSection: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showToast("Saved — live on home page now");
    } catch (e) {
      showToast(e.message || "Save failed");
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

  const cards = [
    { key: "whatsapp", label: "WhatsApp card" },
    { key: "email", label: "Email card" },
    { key: "hours", label: "Hours card" },
    { key: "issues", label: "Issues? card" },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-16">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#0B2545] px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/admin?panel=settings"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#0077C8]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin Settings
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
            <MessageCircle className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">Support Section</h1>
            <p className="text-sm text-slate-500">
              Edit WhatsApp, Email, Hours, and Issues? text on the home page. Saves go live immediately.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          {cards.map(({ key, label }) => (
            <div
              key={key}
              className="rounded-xl border border-[#0077C8]/15 bg-[#F0F7FC] p-4"
            >
              <p className="mb-2 text-xs font-bold text-[#0077C8]">{label}</p>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Title
              </label>
              <input
                value={form[key]?.title || ""}
                onChange={(e) => updateCard(key, "title", e.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black"
              />
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                rows={3}
                value={form[key]?.desc || ""}
                onChange={(e) => updateCard(key, "desc", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black"
              />
            </div>
          ))}

          <p className="text-xs text-slate-500">
            Note: WhatsApp and Email cards still open the real phone / email links from Maintenance & Settings. Only the displayed text is edited here.
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save — Live on home page
          </button>
        </div>
      </main>
    </div>
  );
}
