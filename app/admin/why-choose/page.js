"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RedirectToSiteContent() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/site-content");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
