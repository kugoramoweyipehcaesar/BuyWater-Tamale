"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

/**
 * Always shows active admin announcements as a closable popup on the dashboard.
 * Closing hides it until the user visits the dashboard again (or a new announcement is posted).
 */
export default function AnnouncementPopup() {
  const [list, setList] = useState([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        const data = await res.json();
        const items = (data.announcements || []).filter(
          (a) => a.active !== false && (a.title || a.body || a.message)
        );
        if (cancelled || !items.length) return;
        setList(items);
        setIndex(0);
        setOpen(true);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    if (index < list.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    setOpen(false);
  }

  const announcement = list[index];
  if (!open || !announcement) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
          aria-label="Close announcement"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-3 flex items-center gap-2 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0077C8]/10">
            <Megaphone className="h-5 w-5 text-[#0077C8]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0077C8]">
              Announcement
              {list.length > 1 ? ` · ${index + 1} of ${list.length}` : ""}
            </p>
            <h2
              id="announcement-title"
              className="text-lg font-bold text-[#0B2545] dark:text-zinc-100"
            >
              {announcement.title || "Announcement"}
            </h2>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          {announcement.body || announcement.message || ""}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full rounded-xl bg-[#0077C8] py-2.5 text-sm font-semibold text-white hover:bg-[#0066AD]"
        >
          {index < list.length - 1 ? "Next" : "Got it"}
        </button>
      </div>
    </div>
  );
}
