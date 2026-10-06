"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, MapPin } from "lucide-react";

export default function AdminFooterSectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [brandName, setBrandName] = useState("BuyWater");
  const [locationLine, setLocationLine] = useState(
    "Tamale UDS and environs · Tamale, Northern Region, Ghana"
  );
  const [contactLine, setContactLine] = useState("");
  const [copyrightLine, setCopyrightLine] = useState(
    "BuyWater. Fresh Water Delivered."
  );

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
      const f = s.footerSection || {};
      const call1 =
        s.whatsappNumber || s.callNumber1 || s.adminPhone || "0531448824";
      const call2 =
        s.secondaryPhone || s.callNumber2 || s.momoNumber2 || "0594963356";
      const area = s.serviceArea || "Tamale UDS and environs";
      setBrandName(f.brandName || "BuyWater");
      setLocationLine(
        f.locationLine || `${area} · Tamale, Northern Region, Ghana`
      );
      setContactLine(
        f.contactLine || `Call / WhatsApp: ${call1} / ${call2}`
      );
      setCopyrightLine(f.copyrightLine || "BuyWater. Fresh Water Delivered.");
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
          footerSection: {
            brandName: brandName.trim() || "BuyWater",
            locationLine: locationLine.trim(),
            contactLine: contactLine.trim(),
            copyrightLine: copyrightLine.trim() || "BuyWater. Fresh Water Delivered.",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showToast("Saved — live on home page footer now");
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

  const year = new Date().getFullYear();

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
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B2545]/10">
            <MapPin className="h-5 w-5 text-[#0B2545]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">Footer</h1>
            <p className="text-sm text-slate-500">
              Edit the bottom of the home page: brand, location (Tamale…), contact line, and copyright. Saves go live immediately.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Brand name (next to logo)
            </label>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="BuyWater"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Location line
            </label>
            <input
              value={locationLine}
              onChange={(e) => setLocationLine(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="Tamale UDS and environs · Tamale, Northern Region, Ghana"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Contact line (Call / WhatsApp)
            </label>
            <input
              value={contactLine}
              onChange={(e) => setContactLine(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="Call / WhatsApp: 0531448824 / 0594963356"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Copyright text (year is added automatically)
            </label>
            <input
              value={copyrightLine}
              onChange={(e) => setCopyrightLine(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="BuyWater. Fresh Water Delivered."
            />
            <p className="mt-1 text-xs text-slate-500">
              Shown as: © {year} {copyrightLine || "…"}
            </p>
          </div>

          <div className="rounded-xl bg-[#0B2545] p-5 text-center text-white">
            <p className="text-xs font-semibold text-white/50">Preview</p>
            <p className="mt-2 font-semibold">{brandName}</p>
            <p className="mt-1 text-sm text-white/70">{locationLine}</p>
            <p className="text-sm text-white/70">{contactLine}</p>
            <p className="mt-2 text-xs text-white/40">
              © {year} {copyrightLine}
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
