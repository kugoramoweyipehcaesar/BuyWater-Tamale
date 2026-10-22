"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function OrderVerificationPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const load = useCallback(async () => {
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user || !["ADMIN", "SUPER_ADMIN"].includes(me.user.role)) {
        router.push("/admin-login");
        return;
      }
      setUser(me.user);
      const res = await fetch("/api/orders").then((r) => r.json());
      setOrders(res.orders || []);
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

  async function confirmPayment(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentConfirmed: true, status: "PENDING" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Payment confirmed");
      await load();
    } catch (e) {
      showToast(e.message || "Failed");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const pendingMomo = orders.filter((o) => {
    const isMomo = String(o.paymentMethod || "").toLowerCase().includes("momo");
    if (!isMomo) return false;
    if (o.paymentConfirmed === true) return false;
    return String(o.notes || "").includes("PAYMENT_PENDING") || o.paymentConfirmed === false;
  });

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
            <ShieldCheck className="h-5 w-5 text-[#0077C8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B2545]">Order verification</h1>
            <p className="text-sm text-slate-500">{pendingMomo.length} MoMo pending confirmation</p>
          </div>
        </div>
        <div className="space-y-3">
          {pendingMomo.length === 0 && (
            <p className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
              No MoMo payments awaiting confirmation.
            </p>
          )}
          {pendingMomo.map((o) => (
            <div key={o.id} className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
              <p className="font-bold text-[#0B2545]">{o.orderNumber}</p>
              <p className="text-sm text-slate-600">{o.customerName} · {o.phone}</p>
              <p className="mt-1 text-xs text-amber-800">
                MoMo {o.momoNumber || "—"} · Ref {o.momoReference || "—"} · Ghc{Number(o.totalAmount).toFixed(2)}
              </p>
              <button
                type="button"
                disabled={busyId === o.id}
                onClick={() => confirmPayment(o.id)}
                className="mt-3 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {busyId === o.id ? "Confirming…" : "Confirm payment received"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
