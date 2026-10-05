"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Droplets,
  Loader2,
  RefreshCw,
  Truck,
  ArrowLeft,
} from "lucide-react";

const STATUS_LABELS = {
  PENDING: "Pending",
  PROCESSING: "Preparing",
  CONFIRMED: "Confirmed",
  ON_THE_WAY: "On the Way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  ON_THE_WAY: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

const ACTIVE = ["PENDING", "PROCESSING", "CONFIRMED", "ON_THE_WAY"];

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function isPaymentPending(o) {
  const isMomo = String(o.paymentMethod || "")
    .toLowerCase()
    .includes("momo");
  if (!isMomo) return false;
  if (o.paymentConfirmed === true) return false;
  const notes = String(o.notes || "");
  if (notes.includes("PAYMENT_CONFIRMED")) return false;
  return notes.includes("PAYMENT_PENDING") || o.paymentConfirmed === false;
}

function OrderCard({ o }) {
  const pendingPay = isPaymentPending(o);
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-[#0B2545]">{o.orderNumber}</p>
          <p className="mt-0.5 text-xs text-slate-500">{formatDate(o.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            STATUS_BADGE[o.status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {STATUS_LABELS[o.status] || o.status}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Droplets className="h-3.5 w-3.5 text-[#0077C8]" />
          {o.gallons} gal
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {o.hostel || o.address || "—"}
        </span>
        <span className="font-semibold text-[#0077C8]">
          Ghc{Number(o.totalAmount || 0).toFixed(2)}
        </span>
        <span className="capitalize text-slate-500">
          {String(o.paymentMethod || "")
            .toLowerCase()
            .includes("momo")
            ? "Mobile Money"
            : "Cash on Delivery"}
        </span>
      </div>
      {pendingPay && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">
          Pending payment confirmation
        </p>
      )}
      {o.status === "CANCELLED" && o.cancelReason && (
        <p className="mt-2 text-xs text-red-600">Reason: {o.cancelReason}</p>
      )}
      {ACTIVE.includes(o.status) && (
        <Link
          href="/dashboard?tab=tracking"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0077C8]"
        >
          <Truck className="h-3.5 w-3.5" /> Track order
        </Link>
      )}
    </div>
  );
}

export default function AllOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending"); // pending | history | cancelled

  const load = useCallback(async () => {
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user) {
        router.push("/login?next=/all-orders");
        return;
      }
      setUser(me.user);
      const res = await fetch("/api/orders").then((r) => r.json());
      setOrders(res.orders || []);
    } catch {
      router.push("/login?next=/all-orders");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const { pending, history, cancelled } = useMemo(() => {
    const pending = [];
    const history = [];
    const cancelled = [];
    for (const o of orders) {
      if (o.status === "CANCELLED") cancelled.push(o);
      else if (o.status === "DELIVERED") history.push(o);
      else if (ACTIVE.includes(o.status)) pending.push(o);
      else history.push(o);
    }
    return { pending, history, cancelled };
  }, [orders]);

  const list =
    tab === "pending" ? pending : tab === "cancelled" ? cancelled : history;

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
      <main className="mx-auto max-w-lg px-4 py-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#0077C8]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Order
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0077C8]/10">
              <Package className="h-5 w-5 text-[#0077C8]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B2545]">All Orders</h1>
              <p className="text-sm text-slate-500">
                Your orders only · {orders.length} total
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg p-2 text-slate-400 hover:bg-white"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-2xl bg-white p-1 shadow-sm">
          {[
            {
              id: "pending",
              label: "Pending",
              count: pending.length,
              icon: Clock,
            },
            {
              id: "history",
              label: "History",
              count: history.length,
              icon: CheckCircle2,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: cancelled.length,
              icon: XCircle,
            },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2.5 text-xs font-semibold transition ${
                tab === t.id
                  ? "bg-[#0077C8] text-white shadow"
                  : "text-slate-500 hover:text-[#0B2545]"
              }`}
            >
              <t.icon className="h-4 w-4" />
              <span>
                {t.label}
                {t.count > 0 ? ` (${t.count})` : ""}
              </span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            {tab === "pending" && "No pending orders."}
            {tab === "history" && "No delivered orders yet."}
            {tab === "cancelled" && "No cancelled orders."}
            <div className="mt-4">
              <Link
                href="/dashboard?tab=order"
                className="inline-flex rounded-xl bg-[#0077C8] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Place an order
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((o) => (
              <OrderCard key={o.id} o={o} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
