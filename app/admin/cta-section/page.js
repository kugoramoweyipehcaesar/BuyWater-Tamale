"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Droplets } from "lucide-react";

export default function AdminCtaSectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [title, setTitle] = useState("Thirsty? Get Water Now.");
  const [subtitle, setSubtitle] = useState(
    "Order in seconds. Delivered in minutes. Serving all UDS hostels and environs in Tamale."
  );
  const [buttonText, setButtonText] = useState("");
  const [price, setPrice] = useState(2.5);

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
      const p = s.pricePerGallon ?? 2.5;
      setPrice(p);
      const c = s.ctaSection || {};
      if (c.title) setTitle(c.title);
      if (c.subtitle) setSubtitle(c.subtitle);
      setButtonText(c.buttonText || `Order Now — Ghc${p}/gallon`);
    } catch {
      router.push("/admin-login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ctaSection: {
            title: title.trim() || "Thirsty? Get Water Now.",
            subtitle:
              subtitle.trim() ||
              "Order in seconds. Delivered in minutes. Serving all UDS hostels and environs in Tamale.",
            buttonText: buttonText.trim(),
          },
        }),
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
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0077C8]/10">
            <Droplets className="h-5 w-5 text-[#0077C8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">CTA Section</h1>
            <p className="text-sm text-slate-500">
              Edit “Thirsty? Get Water Now.” title, subtitle, and button text. Saves go live immediately.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Main title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="Thirsty? Get Water Now."
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Subtitle
            </label>
            <textarea
              rows={3}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="Order in seconds. Delivered in minutes…"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Button text
            </label>
            <input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder={`Order Now — Ghc${price}/gallon`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Leave blank to use default: Order Now — Ghc{price}/gallon (from current price).
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500">Preview</p>
            <p className="mt-2 text-lg font-bold text-[#0B2545]">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            <p className="mt-3 inline-block rounded-full bg-[#0077C8] px-5 py-2 text-sm font-semibold text-white">
              {buttonText || `Order Now — Ghc${price}/gallon`}
            </p>
          </div>

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
