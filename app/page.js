"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import {
  Droplets,
  Truck,
  Shield,
  Clock,
  MessageCircle,
  Mail,
  Sparkles,
  MapPin,
  Smartphone,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { useLiveProducts } from "@/lib/useLiveProducts";

function toWhatsAppDigits(phone) {
  let d = String(phone || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "233" + d.slice(1);
  if (d.length === 9 && !d.startsWith("233")) d = "233" + d;
  return d;
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const { liveProduct } = useLiveProducts();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => {});
  }, []);

  const price = liveProduct?.price ?? settings?.pricePerGallon ?? 2.5;
  const hours = settings?.operatingHours || "7 AM - 8:30 PM DAILY";
  const deliveryMin = settings?.deliveryTimeMin ?? 45;
  const deliveryMax = settings?.deliveryTimeMax ?? 60;
  const subPrice = settings?.subscriptionPrice ?? 22;
  const subGallons = settings?.subscriptionGallons ?? 10;
  const call1 =
    settings?.whatsappNumber ||
    settings?.callNumber1 ||
    settings?.adminPhone ||
    "0531448824";
  const call2 =
    settings?.secondaryPhone ||
    settings?.callNumber2 ||
    settings?.momoNumber2 ||
    "0594963356";
  const adminPhoneDigits = toWhatsAppDigits(call1);
  const serviceArea = settings?.serviceArea || "Tamale UDS and environs";
  const heroTitle = settings?.heroTitle || "Fresh Water Delivered";
  const howDefaults = [
    {
      n: "1",
      icon: ClipboardList,
      title: "Pick Your Gallons",
      desc: `Choose how many gallons you need. 20L per gallon at Ghc${price} each. Select your hostel from the dropdown (Yaa Naa, Sagnarigu, Other Hostels — indicate name please).`,
    },
    {
      n: "2",
      icon: CreditCard,
      title: "Pay Your Way",
      desc: "Pay instantly with MoMo or choose Cash on Delivery. MTN, Vodafone, AirtelTigo supported.",
    },
    {
      n: "3",
      icon: Truck,
      title: "We Deliver Fast",
      desc: `Your water arrives at your hostel door in ${deliveryMin}–${deliveryMax} minutes. Track status live.`,
    },
  ];
  const whyDefaults = [
    { icon: Droplets, title: "Pure & Hygienic", desc: "Hygienically produced 20L gallons." },
    { icon: Clock, title: "Fast Delivery", desc: `At your door in ${deliveryMin}–${deliveryMax} mins.` },
    { icon: Shield, title: "Secure Payment", desc: "MoMo or cash on delivery." },
    { icon: Sparkles, title: "Subscribe & Save", desc: `${subGallons} gallons for Ghc${subPrice}.` },
  ];
  const productDesc =
    settings?.productDescription ||
    "Hygienically produced, affordably priced water gallons delivered fresh to your hostel door.";
  const ctaCfg = settings?.ctaSection || {};
  const ctaText =
    ctaCfg.buttonText || `Order Now — Ghc${price}/gallon`;

  return (
    <div className="min-h-screen bg-[#EEF6FC]">
      <SiteHeader user={user} />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0077C8] to-[#0B2545] px-4 pb-16 pt-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-sm font-medium text-sky-200">{serviceArea}</p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{heroTitle}</h1>
              <p className="mt-3 text-sm text-sky-100 sm:text-base">{productDesc}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/order"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0077C8] shadow hover:bg-slate-50"
                >
                  Order Now — Ghc{price}/gallon
                </Link>
                <a
                  href={adminPhoneDigits ? `https://wa.me/${adminPhoneDigits}` : "#"}
                  className="inline-flex items-center gap-1 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white/10 p-5 backdrop-blur">
              <img src="/product.jpg" alt="20L Water Gallon" className="h-40 w-auto rounded-xl object-contain" />
              <p className="mt-3 text-xl font-bold sm:text-2xl">Ghc{price}</p>
              <p className="text-xs text-sky-100">per 20L gallon</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-sky-100">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {hours}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {serviceArea}</span>
            <span className="inline-flex items-center gap-1"><Droplets className="h-3.5 w-3.5 text-sky-200" /> 20L per gallon</span>
            <span className="inline-flex items-center gap-1">Ghc{price} each</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-center text-xl font-bold text-[#0B2545]">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {howDefaults.map((s) => (
            <div key={s.n} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0077C8]/10 text-[#0077C8]">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-[#0B2545]">{s.n}. {s.title}</p>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-[#0B2545]">Why BuyWater</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyDefaults.map((w) => (
              <div key={w.title} className="rounded-2xl border border-slate-100 bg-[#EEF6FC] p-5">
                <w.icon className="mb-2 h-6 w-6 text-[#0077C8]" />
                <p className="text-sm font-bold text-[#0B2545]">{w.title}</p>
                <p className="mt-1 text-xs text-slate-500">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-[#0B2545]">{ctaCfg.title || "Ready for fresh water?"}</h2>
        <p className="mt-2 text-sm text-slate-500">{ctaCfg.subtitle || productDesc}</p>
        <Link
          href="/order"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0077C8] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#0066AD]"
        >
          {ctaText} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
