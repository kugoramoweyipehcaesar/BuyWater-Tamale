"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ThankYouPetals from "@/components/ThankYouPetals";
import {
  Droplets,
  Loader2,
  Minus,
  Plus,
  Banknote,
  Smartphone,
  BadgePercent,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  RefreshCw,
} from "lucide-react";

function momoAccounts(settings) {
  const list = [
    { number: settings?.momoNumber, name: settings?.momoName, label: "Account 1" },
    { number: settings?.momoNumber2, name: settings?.momoName2, label: "Account 2" },
    { number: settings?.momoNumber3, name: settings?.momoName3, label: "Account 3" },
  ].filter((a) => a.number && String(a.number).trim());
  if (!list.length) return [{ number: "0502748671", name: "BuyWater", label: "Account 1" }];
  return list;
}

export default function OrderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gallons, setGallons] = useState(1);
  const [isSubscription, setIsSubscription] = useState(false);
  const [hostel, setHostel] = useState("");
  const [customHostel, setCustomHostel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [blockNumber, setBlockNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoReference, setMomoReference] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouOrder, setThankYouOrder] = useState(null);

  const pricePerGallon = settings?.pricePerGallon ?? 2.5;
  const subPrice = settings?.subscriptionPrice ?? 22;
  const subGallons = settings?.subscriptionGallons ?? 10;
  const cashEnabled = settings?.cashEnabled !== false;
  const momoEnabled = settings?.momoEnabled !== false;
  const maintenanceOn = !!settings?.maintenanceMode;
  const outOfStock = !!settings?.outOfStock;
  const freeGallons = promoApplied?.rewardValue || 0;
  const billableGallons = isSubscription ? subGallons : gallons;
  const total = isSubscription ? subPrice : billableGallons * pricePerGallon;
  const totalGallons = billableGallons + freeGallons;
  const accounts = momoAccounts(settings);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [meRes, setRes, hosRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/hostels?t=${Date.now()}`, { cache: "no-store" }),
        ]);
        const me = await meRes.json().catch(() => ({}));
        const set = await setRes.json().catch(() => ({}));
        const hos = await hosRes.json().catch(() => ({}));
        if (cancelled) return;
        setUser(me.user || null);
        setSettings(set.settings || null);
        setHostels((hos.hostels || []).filter((h) => h.active !== false));
        if (me.user?.hostel) setHostel(me.user.hostel);
        if (me.user?.customHostel) setCustomHostel(me.user.customHostel);
        const s = set.settings || {};
        if (s.cashEnabled === false && s.momoEnabled !== false) setPaymentMethod("momo");
        else if (s.momoEnabled === false && s.cashEnabled !== false)
          setPaymentMethod("cash_on_delivery");
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    function onVis() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (isSubscription) setGallons(subGallons);
  }, [isSubscription, subGallons]);

  async function applyPromo() {
    if (!promoCode.trim()) return;
    if (!user) {
      setOrderError("Login required to apply a promo code");
      return;
    }
    try {
      const res = await fetch(
        `/api/promotions?code=${encodeURIComponent(promoCode.trim())}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) {
        setPromoApplied(null);
        setOrderError(data.error || "Invalid promo");
        return;
      }
      setPromoApplied(data.promo);
      setOrderError("");
    } catch {
      setOrderError("Could not check promo");
    }
  }

  async function placeOrder(e) {
    e.preventDefault();
    setOrderError("");
    setOrderSuccess("");
    if (!user) {
      router.push("/login");
      return;
    }
    if (!hostel) {
      setOrderError("Please select your hostel");
      return;
    }
    if (hostel === "Other" && !customHostel.trim()) {
      setOrderError("Enter your hostel name");
      return;
    }
    if (paymentMethod === "momo") {
      const digits = momoNumber.replace(/\D/g, "");
      if (digits.length !== 10) {
        setOrderError("MoMo number must be exactly 10 digits");
        return;
      }
      if (!momoReference.trim()) {
        setOrderError("Enter the transaction reference from your MoMo payment");
        return;
      }
    }
    if (outOfStock) {
      setOrderError("Sorry, we are currently out of stock.");
      return;
    }
    if (maintenanceOn) {
      setOrderError(settings?.maintenanceMessage || "Ordering is temporarily unavailable.");
      return;
    }

    setOrderLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: user?.name || user?.username || "",
          username: user?.username || "",
          phone: user?.phone || "",
          email: user?.email,
          hostel: hostel === "Other" ? "Other" : hostel,
          customHostel: hostel === "Other" ? customHostel.trim() : "",
          address: hostel === "Other" ? customHostel.trim() : hostel,
          roomNumber,
          blockNumber,
          gallons: totalGallons,
          totalAmount: total,
          paymentMethod,
          momoNumber:
            paymentMethod === "momo"
              ? momoNumber.replace(/\D/g, "").slice(0, 10)
              : "",
          momoReference: paymentMethod === "momo" ? momoReference.trim() : "",
          isSubscription,
          notes: promoApplied
            ? `Promo: ${promoApplied.code} — ${promoApplied.rewardValue} free gallons`
            : "",
          products: JSON.stringify([
            { name: "20L Water Gallon", qty: totalGallons, price: pricePerGallon },
          ]),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error || "Order failed");
        return;
      }
      setOrderSuccess(`Order ${data.order.orderNumber} placed!`);
      setThankYouOrder(data.order);
      setShowThankYou(true);
      setGallons(1);
      setIsSubscription(false);
      setPromoApplied(null);
      setPromoCode("");
      setMomoNumber("");
      setMomoReference("");
    } catch {
      setOrderError("Network error");
    } finally {
      setOrderLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F7FC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077C8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF6FC] pb-12">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/" className="rounded-lg p-2 text-slate-500 hover:bg-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#0B2545]">Order Water</h1>
            <p className="text-sm text-slate-500">
              Hi {user?.name || user?.username || "there"}, let's get you water!
            </p>
          </div>
        </div>

        {(maintenanceOn || outOfStock) && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {outOfStock
                ? "We are currently out of stock. Please check back soon."
                : settings?.maintenanceMessage ||
                  "Ordering is temporarily unavailable."}
            </p>
          </div>
        )}

        <form
          onSubmit={placeOrder}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          {orderError && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {orderError}
            </div>
          )}
          {orderSuccess && (
            <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {orderSuccess}
            </div>
          )}

          <p className="mb-3 text-sm font-semibold text-[#0B2545]">Number of Gallons</p>
          <div className="mb-5 flex items-center justify-center gap-6">
            <button
              type="button"
              disabled={isSubscription}
              onClick={() => setGallons((g) => Math.max(1, g - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#0077C8]/25 text-[#0077C8] disabled:opacity-40"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Droplets className="h-6 w-6 text-[#0077C8]" />
                <span className="text-3xl font-bold text-[#0B2545]">
                  {isSubscription ? subGallons : gallons}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ghc{Number(pricePerGallon).toFixed(2)} per gallon
              </p>
            </div>
            <button
              type="button"
              disabled={isSubscription}
              onClick={() => setGallons((g) => g + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#0077C8]/25 text-[#0077C8] disabled:opacity-40"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSubscription(!isSubscription)}
            className={`mb-5 flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left ${
              isSubscription
                ? "border-[#0077C8] bg-[#0077C8]/5"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isSubscription ? "bg-[#0077C8] text-white" : "bg-slate-200"
              }`}
            >
              <RefreshCw className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0B2545]">Subscribe & Save</p>
              <p className="text-xs text-slate-500">
                {subGallons} gallons for Ghc{subPrice}
              </p>
            </div>
          </button>

          <label className="mb-1.5 block text-sm font-semibold text-[#0B2545]">
            Select Your Hostel
          </label>
          <div className="relative mb-3">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              required
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 pl-10 pr-8 text-sm outline-none focus:border-[#0077C8]"
            >
              <option value="">Select hostel</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name}
                </option>
              ))}
              <option value="Other">Other (specify)</option>
            </select>
          </div>
          {hostel === "Other" && (
            <input
              required
              value={customHostel}
              onChange={(e) => setCustomHostel(e.target.value)}
              placeholder="Hostel name"
              className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          )}

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Room Number
              </label>
              <input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 12"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Block Number
              </label>
              <input
                value={blockNumber}
                onChange={(e) => setBlockNumber(e.target.value)}
                placeholder="e.g. B"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <p className="mb-2 text-sm font-semibold text-[#0B2545]">Payment Method</p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            {cashEnabled && (
              <button
                type="button"
                onClick={() => setPaymentMethod("cash_on_delivery")}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-medium ${
                  paymentMethod === "cash_on_delivery"
                    ? "border-[#0077C8] bg-[#0077C8]/5 text-[#0077C8]"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <Banknote className="h-5 w-5" />
                Cash on Delivery
              </button>
            )}
            {momoEnabled && (
              <button
                type="button"
                onClick={() => setPaymentMethod("momo")}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-medium ${
                  paymentMethod === "momo"
                    ? "border-[#0077C8] bg-[#0077C8]/5 text-[#0077C8]"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <Smartphone className="h-5 w-5" />
                Mobile Money
              </button>
            )}
          </div>

          {paymentMethod === "momo" && (
            <div className="mb-4 space-y-2 rounded-xl border border-[#0077C8]/20 bg-[#0077C8]/5 p-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0077C8]">
                Send Mobile Money to
              </p>
              {accounts.map((acc, idx) => (
                <div
                  key={idx}
                  className={idx > 0 ? "border-t border-[#0077C8]/15 pt-2" : ""}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {acc.label}
                  </p>
                  <p className="text-base font-bold text-[#0B2545]">{acc.number}</p>
                  <p className="text-xs text-slate-700">
                    Name: <span className="font-semibold">{acc.name || "BuyWater"}</span>
                  </p>
                </div>
              ))}
              <label className="block text-xs font-medium text-slate-600">
                Your MoMo number (10 digits)
              </label>
              <input
                required
                inputMode="numeric"
                maxLength={10}
                value={momoNumber}
                onChange={(e) =>
                  setMomoNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="e.g. 0241234567"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <label className="block text-xs font-medium text-slate-600">
                Transaction reference
              </label>
              <input
                required
                value={momoReference}
                onChange={(e) => setMomoReference(e.target.value)}
                placeholder="Transaction reference"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={applyPromo}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <BadgePercent className="h-4 w-4" />
              Apply
            </button>
          </div>
          {promoApplied && (
            <p className="mb-3 text-xs text-green-700">
              Promo applied: +{promoApplied.rewardValue} free gallons
            </p>
          )}

          <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span>Gallons</span>
              <span className="font-semibold">{totalGallons}</span>
            </div>
            <div className="mt-1 flex justify-between text-base font-bold text-[#0B2545]">
              <span>Total</span>
              <span>Ghc{Number(total).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={orderLoading || maintenanceOn || outOfStock}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {orderLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Droplets className="h-4 w-4" />
            )}
            {orderLoading ? "Placing order…" : "Place Order"}
          </button>
        </form>
      </main>

      <ThankYouPetals
        open={showThankYou && !!thankYouOrder}
        orderNumber={thankYouOrder?.orderNumber}
        isMomo={String(thankYouOrder?.paymentMethod || "")
          .toLowerCase()
          .includes("momo")}
        onClose={() => {
          setShowThankYou(false);
          setThankYouOrder(null);
          router.push("/dashboard?tab=tracking");
        }}
      />
    </div>
  );
}
