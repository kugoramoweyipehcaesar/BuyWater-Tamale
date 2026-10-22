"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  ClipboardList,
  Sparkles,
  MessageCircle,
  Droplets,
  MapPin,
} from "lucide-react";

const DEFAULT_HOW_STEPS = [
  { title: "Pick Your Gallons", desc: "Choose how many gallons you need. Select your hostel from the dropdown." },
  { title: "Pay Your Way", desc: "Pay instantly with MoMo or choose Cash on Delivery. MTN, Vodafone, AirtelTigo supported." },
  { title: "Get It Delivered", desc: "We deliver to your hostel. Track your driver live until it reaches your door." },
];

const DEFAULT_WHY_ITEMS = [
  { title: "Fast Delivery", desc: "Under 60 minutes to Yaa Naa Hall, Sagnarigu Hall, Kumbungu Hostel, Tech Hostel, Citadel Hostel, Northern Hostel and all other hostels." },
  { title: "Live Order Tracking", desc: "Get your driver's number to call and track your delivery in real time until it reaches your door." },
  { title: "MoMo + Cash", desc: "Pay however is convenient. MTN, Vodafone, AirtelTigo supported — or pay cash on delivery." },
  { title: "Subscribe & Save", desc: "Get more gallons for less. Cancel wrong orders without any commitments." },
  { title: "Reliable Supply", desc: "Hygienic water, affordable, and always on time. We never leave you dry and unattended to." },
  { title: "WhatsApp Support", desc: "Quick help if your water is late. Message us directly on WhatsApp for the fastest response." },
];

const DEFAULT_SUPPORT = {
  whatsapp: { title: "WhatsApp", desc: "0531448824 — Fastest response · opens DM" },
  email: { title: "Email", desc: "We'll reply within 24 hours" },
  hours: { title: "Hours", desc: "7 AM - 8:30 PM DAILY" },
  issues: { title: "Issues?", desc: "Late delivery, wrong hostel — report from your Profile → Submit complaint" },
};

const TABS = [
  { id: "how", label: "How It Works", icon: ClipboardList },
  { id: "why", label: "Why Choose", icon: Sparkles },
  { id: "support", label: "Support", icon: MessageCircle },
  { id: "cta", label: "CTA Section", icon: Droplets },
  { id: "footer", label: "Footer", icon: MapPin },
];

export default function AdminSiteContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("how");
  const [howTitle, setHowTitle] = useState("How It Works");
  const [howSteps, setHowSteps] = useState(DEFAULT_HOW_STEPS);
  const [whyBadge, setWhyBadge] = useState("Built for Students");
  const [whyTitle, setWhyTitle] = useState("Why Choose BuyWater");
  const [whyItems, setWhyItems] = useState(DEFAULT_WHY_ITEMS);
  const [supportForm, setSupportForm] = useState(DEFAULT_SUPPORT);
  const [ctaTitle, setCtaTitle] = useState("Thirsty? Get Water Now.");
  const [ctaSubtitle, setCtaSubtitle] = useState("Order in seconds. Delivered in minutes. Serving all UDS hostels and environs in Tamale.");
  const [ctaButtonText, setCtaButtonText] = useState("");
  const [footerBrand, setFooterBrand] = useState("BuyWater");
  const [footerLocation, setFooterLocation] = useState("Tamale UDS and environs · Tamale, Northern Region, Ghana");
  const [footerContact, setFooterContact] = useState("");
  const [footerCopyright, setFooterCopyright] = useState("BuyWater. Fresh Water Delivered.");

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
      const how = s.howItWorks || {};
      if (how.sectionTitle) setHowTitle(how.sectionTitle);
      if (Array.isArray(how.steps) && how.steps.length) {
        setHowSteps([0, 1, 2].map((i) => ({
          title: how.steps[i]?.title || DEFAULT_HOW_STEPS[i].title,
          desc: how.steps[i]?.desc || DEFAULT_HOW_STEPS[i].desc,
        })));
      }
      const why = s.whyChoose || {};
      if (why.badge) setWhyBadge(why.badge);
      if (why.sectionTitle) setWhyTitle(why.sectionTitle);
      if (Array.isArray(why.items) && why.items.length) {
        setWhyItems([0, 1, 2, 3, 4, 5].map((i) => ({
          title: why.items[i]?.title || DEFAULT_WHY_ITEMS[i].title,
          desc: why.items[i]?.desc || DEFAULT_WHY_ITEMS[i].desc,
        })));
      }
      const sup = s.supportSection || {};
      setSupportForm({
        whatsapp: { title: sup.whatsapp?.title || DEFAULT_SUPPORT.whatsapp.title, desc: sup.whatsapp?.desc || DEFAULT_SUPPORT.whatsapp.desc },
        email: { title: sup.email?.title || DEFAULT_SUPPORT.email.title, desc: sup.email?.desc || DEFAULT_SUPPORT.email.desc },
        hours: { title: sup.hours?.title || DEFAULT_SUPPORT.hours.title, desc: sup.hours?.desc || DEFAULT_SUPPORT.hours.desc },
        issues: { title: sup.issues?.title || DEFAULT_SUPPORT.issues.title, desc: sup.issues?.desc || DEFAULT_SUPPORT.issues.desc },
      });
      const cta = s.ctaSection || {};
      if (cta.title) setCtaTitle(cta.title);
      if (cta.subtitle) setCtaSubtitle(cta.subtitle);
      if (cta.buttonText != null) setCtaButtonText(cta.buttonText || "");
      const foot = s.footerSection || {};
      if (foot.brandName) setFooterBrand(foot.brandName);
      if (foot.locationLine) setFooterLocation(foot.locationLine);
      if (foot.contactLine != null) setFooterContact(foot.contactLine || "");
      if (foot.copyrightLine) setFooterCopyright(foot.copyrightLine);
    } catch {
      router.push("/admin-login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function updateHowStep(i, field, value) {
    setHowSteps((prev) => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
  }
  function updateWhyItem(i, field, value) {
    setWhyItems((prev) => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
  }
  function updateSupport(key, field, value) {
    setSupportForm((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  async function saveCurrent() {
    setBusy(true);
    try {
      let body = {};
      if (tab === "how") body = { howItWorks: { sectionTitle: howTitle.trim() || "How It Works", steps: howSteps } };
      else if (tab === "why") body = { whyChoose: { badge: whyBadge.trim() || "Built for Students", sectionTitle: whyTitle.trim() || "Why Choose BuyWater", items: whyItems } };
      else if (tab === "support") body = { supportSection: supportForm };
      else if (tab === "cta") body = { ctaSection: { title: ctaTitle.trim() || "Thirsty? Get Water Now.", subtitle: ctaSubtitle.trim(), buttonText: ctaButtonText.trim() } };
      else if (tab === "footer") body = { footerSection: { brandName: footerBrand.trim() || "BuyWater", locationLine: footerLocation.trim(), contactLine: footerContact.trim(), copyrightLine: footerCopyright.trim() || "BuyWater. Fresh Water Delivered." } };
      const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showToast("Saved — live on home page now");
    } catch (e) {
      showToast(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveAll() {
    setBusy(true);
    try {
      const body = {
        howItWorks: { sectionTitle: howTitle.trim() || "How It Works", steps: howSteps },
        whyChoose: { badge: whyBadge.trim() || "Built for Students", sectionTitle: whyTitle.trim() || "Why Choose BuyWater", items: whyItems },
        supportSection: supportForm,
        ctaSection: { title: ctaTitle.trim() || "Thirsty? Get Water Now.", subtitle: ctaSubtitle.trim(), buttonText: ctaButtonText.trim() },
        footerSection: { brandName: footerBrand.trim() || "BuyWater", locationLine: footerLocation.trim(), contactLine: footerContact.trim(), copyrightLine: footerCopyright.trim() || "BuyWater. Fresh Water Delivered." },
      };
      const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showToast("All sections saved — live on home page now");
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
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/admin" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-black">Dashboard Settings</h1>
            <p className="truncate text-xs text-slate-500">Home page content · changes go live immediately</p>
          </div>
          <button type="button" disabled={busy} onClick={saveAll} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0077C8] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save all
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-[#0077C8] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
        {tab === "how" && (
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-[#0077C8]" /><h2 className="text-lg font-bold text-black">How It Works</h2></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Section title</label><input value={howTitle} onChange={(e) => setHowTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" placeholder="How It Works" /></div>
            {howSteps.map((step, i) => (
              <div key={i} className="rounded-xl border border-[#0077C8]/15 bg-[#F0F7FC] p-4">
                <p className="mb-2 text-xs font-bold text-[#0077C8]">Step {i + 1}</p>
                <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
                <input value={step.title} onChange={(e) => updateHowStep(i, "title", e.target.value)} className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black" />
                <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
                <textarea rows={3} value={step.desc} onChange={(e) => updateHowStep(i, "desc", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black" />
              </div>
            ))}
            <button type="button" disabled={busy} onClick={saveCurrent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save How It Works — Live now</button>
          </div>
        )}
        {tab === "why" && (
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#0077C8]" /><h2 className="text-lg font-bold text-black">Why Choose BuyWater</h2></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs font-semibold text-slate-600">Badge</label><input value={whyBadge} onChange={(e) => setWhyBadge(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-slate-600">Section title</label><input value={whyTitle} onChange={(e) => setWhyTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" /></div>
            </div>
            {whyItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-[#0077C8]/15 bg-[#F0F7FC] p-4">
                <p className="mb-2 text-xs font-bold text-[#0077C8]">Item {i + 1}</p>
                <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
                <input value={item.title} onChange={(e) => updateWhyItem(i, "title", e.target.value)} className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black" />
                <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
                <textarea rows={2} value={item.desc} onChange={(e) => updateWhyItem(i, "desc", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black" />
              </div>
            ))}
            <button type="button" disabled={busy} onClick={saveCurrent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Why Choose — Live now</button>
          </div>
        )}
        {tab === "support" && (
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#0077C8]" /><h2 className="text-lg font-bold text-black">Support Section</h2></div>
            {["whatsapp", "email", "hours", "issues"].map((key) => (
              <div key={key} className="rounded-xl border border-[#0077C8]/15 bg-[#F0F7FC] p-4">
                <p className="mb-2 text-xs font-bold uppercase text-[#0077C8]">{key}</p>
                <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
                <input value={supportForm[key].title} onChange={(e) => updateSupport(key, "title", e.target.value)} className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black" />
                <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
                <textarea rows={2} value={supportForm[key].desc} onChange={(e) => updateSupport(key, "desc", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black" />
              </div>
            ))}
            <button type="button" disabled={busy} onClick={saveCurrent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Support — Live now</button>
          </div>
        )}
        {tab === "cta" && (
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-[#0077C8]" /><h2 className="text-lg font-bold text-black">CTA Section</h2></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Title</label><input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Subtitle</label><textarea rows={3} value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Button text (optional)</label><input value={ctaButtonText} onChange={(e) => setCtaButtonText(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" placeholder="Order Now" /></div>
            <button type="button" disabled={busy} onClick={saveCurrent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save CTA — Live now</button>
          </div>
        )}
        {tab === "footer" && (
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-[#0077C8]" /><h2 className="text-lg font-bold text-black">Footer</h2></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Brand name</label><input value={footerBrand} onChange={(e) => setFooterBrand(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Location line</label><input value={footerLocation} onChange={(e) => setFooterLocation(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Contact line (optional)</label><input value={footerContact} onChange={(e) => setFooterContact(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" placeholder="e.g. Call / WhatsApp: 0531448824" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Copyright line</label><input value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-black" /></div>
            <button type="button" disabled={busy} onClick={saveCurrent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Footer — Live now</button>
          </div>
        )}
      </main>
    </div>
  );
}
