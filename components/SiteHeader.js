"use client";

import Link from "next/link";
import Image from "next/image";
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
  const onAllOrders =
    path === "/all-orders" ||
    (typeof path === "string" && path.startsWith("/all-orders"));

  const linkClass = onHome
    ? "text-white/90 hover:text-white"
    : "text-slate-600 hover:text-[#0077C8] dark:text-zinc-300 dark:hover:text-sky-400";

  const displayName =
    user?.username || user?.name || (user?.email ? user.email.split("@")[0] : "Account");

  return (
    <>
      <header
        className={
          onHome
            ? "sticky top-0 z-40 border-b border-white/10 bg-[#0077C8]/95 text-white backdrop-blur"
            : "sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
        }
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/logo.webp"
              alt="BuyWater"
              width={40}
              height={40}
              priority
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
            />
            <span className={onHome ? "text-white" : "text-[#0B2545] dark:text-zinc-100"}>
              BuyWater
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/order" prefetch className={linkClass}>
              Order
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  prefetch
                  className={onDashboard ? "font-semibold text-[#0077C8]" : linkClass}
                >
                  Dashboard
                </Link>
                <Link href="/profile" prefetch className={linkClass}>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {displayName}
                  </span>
                </Link>
              </>
            ) : (
              <Link href="/login" prefetch className={linkClass}>
                Login
              </Link>
            )}
            <ThemeToggle light={onHome} />
          </nav>
        </div>
      </header>
      <AnnouncementPopup />
    </>
  );
}
