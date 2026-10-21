"use client";

import { useEffect, useMemo, useState } from "react";

const PETAL_COLORS = ["#f472b6", "#fb7185", "#f9a8d4", "#fda4af", "#fbcfe8", "#fecdd3", "#e879f9"];

export default function ThankYouPetals({ open, onClose, orderNumber, isMomo }) {
  const [visible, setVisible] = useState(false);
  const petals = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.2 + Math.random() * 1.8,
        size: 8 + Math.random() * 12,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        rotate: Math.random() * 360,
      })),
    [open]
  );

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 4200);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open && !visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.85; }
        }
        @keyframes thankPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {petals.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: "50% 50% 50% 0",
            transform: `rotate(${p.rotate}deg)`,
            animation: `petalFall ${p.duration}s linear ${p.delay}s forwards`,
            pointerEvents: "none",
          }}
        />
      ))}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        style={{ animation: "thankPop 0.45s ease-out" }}
      >
        <p className="text-3xl">🎉</p>
        <h2 className="mt-2 text-xl font-bold text-[#0B2545]">Thank you!</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your order <span className="font-semibold text-[#0077C8]">{orderNumber}</span> was placed successfully.
        </p>
        {isMomo && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Mobile Money: payment is <strong>pending confirmation</strong>. Admin will confirm shortly.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className="mt-5 w-full rounded-xl bg-[#0077C8] py-2.5 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
