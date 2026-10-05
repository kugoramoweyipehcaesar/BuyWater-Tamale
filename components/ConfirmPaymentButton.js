"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * Super-admin control: confirm MoMo payment received → status becomes PENDING
 * so the order can continue PENDING → PROCESSING → CONFIRMED → …
 */
export default function ConfirmPaymentButton({ orderId, onConfirmed, className = "" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function confirm() {
    if (!orderId || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Confirm failed");
      onConfirmed?.(data.order || data);
    } catch (e) {
      setErr(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={confirm}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Confirm payment
      </button>
      {err && <p className="mt-1 text-[10px] text-red-600">{err}</p>}
    </div>
  );
}
