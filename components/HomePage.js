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
  const productDesc =
    settings?.productDescription ||
    "Hygienically produced, affordably priced water gallons delivered fresh to your hostel door.";
  const ctaCfg = settings?.ctaSection || {};
  const ctaText = ctaCfg.buttonText || `Order Now — Ghc${price}/gallon`;
  const footerCfg = settings?.footerSection || {};
  const footerBrand = footerCfg.brandName || "BuyWater";
  const footerLocation =
    footerCfg.locationLine || `${serviceArea} · Tamale, Northern Region, Ghana`;
  const footerContact =
    footerCfg.contactLine || `Call / WhatsApp: ${call1} / ${call2}`;
  const footerCopyright =
    footerCfg.copyrightLine || "BuyWater. Fresh Water Delivered.";

  const howDefaults = [
    {
      n: "1",
      icon: ClipboardList,
      title: "Pick Your Gallons",
      desc: `Choose how many gallons you need. 20L per gallon at Ghc${price} each. Select your hostel from the dropdown.`,
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

  return (
    <div className="min-h-screen bg-[#F0F7FC]">
      <SiteHeader user={user} />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0077C8] to-[#005A9E] text-white">
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:pb-20 sm:pt-16">
          <img
            src="/logo.jpg"
            alt="BuyWater"
            className="mx-auto mb-5 h-20 w-20 rounded-full border-4 border-white/30 object-cover shadow-lg sm:h-24 sm:w-24"
          />
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{heroTitle}</h1>
          <p className="mt-2 text-base text-white/90 sm:text-lg">
            To your door in {deliveryMin}–{deliveryMax} minutes
          </p>
          <p className="mt-1 text-sm text-white/70">Serving {serviceArea}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/order"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0077C8] shadow hover:bg-slate-50"
            >
              <Droplets className="h-4 w-4" />
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
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-2 border-t border-white/20 pt-8 text-center">
            <div>
              <p className="text-xl font-bold sm:text-2xl">Ghc{price}</p>
              <p className="text-[11px] text-white/70 sm:text-xs">Per Gallon</p>
            </div>
            <div className="border-x border-white/20">
              <p className="text-xl font-bold sm:text-2xl">
                {deliveryMin}–{deliveryMax}
              </p>
              <p className="text-[11px] text-white/70 sm:text-xs">Min Delivery</p>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight sm:text-base">{hours}</p>
              <p className="text-[11px] text-white/70 sm:text-xs">Daily Hours</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F0F7FC] py-14 text-center">
        <h2 className="text-2xl font-bold text-[#0B2545]">Premium 20-Liter Water Gallons</h2>
        <p className="mx-auto mt-2 max-w-xl px-4 text-sm text-slate-500">{productDesc}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm">
            <Droplets className="h-3.5 w-3.5 text-[#0077C8]" /> 20L per gallon
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold text-[#0077C8] shadow-sm">
            Ghc{price} each
          </span>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0B2545]">How It Works</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {howDefaults.map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-slate-100 bg-[#F8FBFE] p-6 text-center shadow-sm"
              >
                <div className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#0077C8] text-xs font-bold text-white">
                  {s.n}
                </div>
                <div className="mx-auto mb-3 mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                  <s.icon className="h-6 w-6 text-[#0077C8]" />
                </div>
                <h3 className="font-semibold text-[#0B2545]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F0F7FC] py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0B2545]">Why Choose BuyWater</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyDefaults.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0077C8]">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-[#0B2545]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#F0F7FC] to-white py-16 text-center">
        <h2 className="text-2xl font-bold text-[#0B2545] sm:text-3xl">
          {ctaCfg.title || "Thirsty? Get Water Now."}
        </h2>
        <p className="mx-auto mt-2 max-w-md px-4 text-sm text-slate-500">
          {ctaCfg.subtitle || productDesc}
        </p>
        <Link
          href="/order"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0077C8] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#0066AD]"
        >
          <Droplets className="h-4 w-4" />
          {ctaText}
        </Link>
      </section>

      <footer className="bg-[#0B2545] py-10 text-center text-white">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-2 px-4">
          <div className="mb-1 flex items-center gap-2">
            <img src="/logo.jpg" alt={footerBrand} className="h-10 w-10 rounded-full object-cover" />
            <span className="font-semibold">{footerBrand}</span>
          </div>
          <p className="text-sm text-white/70">{footerLocation}</p>
          <p className="text-sm text-white/70">{footerContact}</p>
          <p className="mt-3 text-xs text-white/40">
            © {new Date().getFullYear()} {footerCopyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
