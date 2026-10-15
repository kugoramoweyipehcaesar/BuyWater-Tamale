"use client";
/**
 * Live Product table subscription (Supabase Realtime).
 * Initial data still comes from Prisma via /api/products.
 */
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export function useLiveProducts(initial = []) {
  const [products, setProducts] = useState(initial);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel("buywater-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Product" },
        (payload) => {
          console.log("Live update", payload);
          if (payload.eventType === "UPDATE")
            setProducts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          if (payload.eventType === "INSERT")
            setProducts((prev) => [...prev, payload.new]);
          if (payload.eventType === "DELETE")
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const liveProduct = products.find(
    (p) => p.category === "water" || (p.name && String(p.name).includes("20L"))
  );
  return { products, setProducts, liveProduct };
}
