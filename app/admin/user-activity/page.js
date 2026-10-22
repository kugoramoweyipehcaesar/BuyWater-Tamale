"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { ArrowLeft, Loader2, Activity, CheckCircle2 } from "lucide-react";

export default function UserActivityPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#0077C8]">
          <ArrowLeft className="h-4 w-4" /> Admin Office
        </Link>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0077C8]/10">
            <Activity className="h-5 w-5 text-[#0077C8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B2545]">User activity</h1>
            <p className="text-sm text-slate-500">{orders.length} orders</p>
          </div>
        </div>
        <div className="space-y-2">
          {orders.length === 0 && (
            <p className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">No orders yet.</p>
          )}
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0B2545]">{o.orderNumber}</p>
                <span className="text-xs font-semibold text-slate-500">{o.status}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {o.customerName || o.email} · {o.gallons} gal · Ghc{Number(o.totalAmount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
