"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AnnouncementPopup from "@/components/AnnouncementPopup";

export default function SiteHeader({ user }) {
  const path = usePathname();
  const onHome = path === "/";
  const onDashboard =
    path === "/dashboard" ||
    (typeof path === "string" && path.startsWith("/dashboard"));

  const linkClass = onHome
    ? "text-white/90 hover:text-white"
    : "text-slate-600 hover:text-[#0077C8] dark:text-zinc-300 dark:hover:text-sky-400";

  const displayName =
    user?.username || user?.name || (user?.email ? user.email.split("@")[0] : "User");

  return (
    <>
      {onDashboard ? <AnnouncementPopup /> : null}
      <header
        className={`sticky top-0 z-20 border-b transition-colors duration-300 ${
          onHome
            ? "border-white/10 bg-[#0077C8]/95 text-white backdrop-blur"
            : "border-slate-200 bg-white/95 text-slate-800 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-100"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo.jpg"
              alt="BuyWater"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
            />
            <span className="text-base font-bold tracking-tight">BuyWater</span>
          </Link>

          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/" className={linkClass}>
              Home
            </Link>
            <Link href="/dashboard" className={linkClass}>
              Dashboard
            </Link>
            <Link href="/order" className={linkClass}>
              Order
            </Link>
            <ThemeToggle />
            {user ? (
              <Link
                href="/profile"
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                  onHome
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span className="max-w-[100px] truncate">{displayName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={
                  onHome
                    ? "rounded-full bg-white px-3 py-1 text-[#0077C8]"
                    : "rounded-full bg-[#0077C8] px-3 py-1 text-white"
                }
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
