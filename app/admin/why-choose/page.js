"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";

const DEFAULT_ITEMS = [
  {
    title: "Fast Delivery",
    desc: "Under 60 minutes to Yaa Naa Hall, Sagnarigu Hall, Kumbungu Hostel, Tech Hostel, Citadel Hostel, Northern Hostel and all other hostels.",
  },
  {
    title: "Live Order Tracking",
    desc: "Get your driver's number to call and track your delivery in real time until it reaches your door.",
  },
  {
    title: "MoMo + Cash",
    desc: "Pay however is convenient. MTN, Vodafone, AirtelTigo supported — or pay cash on delivery.",
  },
  {
    title: "Subscribe & Save",
    desc: "Get more gallons for less. Cancel wrong orders without any commitments.",
  },
  {
    title: "Reliable Supply",
    desc: "Hygienic water, affordable, and always on time. We never leave you dry and unattended to.",
  },
  {
    title: "WhatsApp Support",
    desc: "Quick help if your water is late. Message us directly on WhatsApp for the fastest response.",
  },
];

export default function AdminWhyChoosePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [badge, setBadge] = useState("Built for Students");
  const [sectionTitle, setSectionTitle] = useState("Why Choose BuyWater");
  const [items, setItems] = useState(DEFAULT_ITEMS);

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
      const why = set.settings?.whyChoose || {};
      if (why.badge) setBadge(why.badge);
      if (why.sectionTitle) setSectionTitle(why.sectionTitle);
      if (Array.isArray(why.items) && why.items.length) {
        setItems(
          [0, 1, 2, 3, 4, 5].map((i) => ({
            title: why.items[i]?.title || DEFAULT_ITEMS[i].title,
            desc: why.items[i]?.desc || DEFAULT_ITEMS[i].desc,
          }))
        );
      }
    } catch {
      router.push("/admin-login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function updateItem(i, field, value) {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whyChoose: {
            badge: badge.trim() || "Built for Students",
            sectionTitle: sectionTitle.trim() || "Why Choose BuyWater",
            items,
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
            <Sparkles className="h-5 w-5 text-[#0077C8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">Why Choose BuyWater</h1>
            <p className="text-sm text-slate-500">
              Edit the badge, section title, and all 6 feature cards. Saves go live immediately.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Badge (small label above title)
            </label>
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="Built for Students"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Section title
            </label>
            <input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black"
              placeholder="Why Choose BuyWater"
            />
          </div>

          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#0077C8]/15 bg-[#F0F7FC] p-4"
            >
              <p className="mb-2 text-xs font-bold text-[#0077C8]">Feature {i + 1}</p>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Title
              </label>
              <input
                value={item.title}
                onChange={(e) => updateItem(i, "title", e.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black"
              />
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                rows={3}
                value={item.desc}
                onChange={(e) => updateItem(i, "desc", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black"
              />
            </div>
          ))}

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
