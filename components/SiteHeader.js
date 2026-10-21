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
  const onAllOrders =
    path === "/all-orders" ||
    (typeof path === "string" && path.startsWith("/all-orders"));

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
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40"
            />
            <div className="hidden leading-tight sm:block">
              <p
                className={`text-sm font-bold ${
                  onHome ? "text-white" : "text-[#0077C8] dark:text-sky-400"
                }`}
              >
                BuyWater
              </p>
              <p
                className={`text-[10px] ${
                  onHome ? "text-white/70" : "text-slate-500 dark:text-zinc-400"
                }`}
              >
                Fresh Water Delivered
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a href="/#how-it-works" className={`text-sm font-medium ${linkClass}`}>
              How It Works
            </a>
            <a href="/#features" className={`text-sm font-medium ${linkClass}`}>
              Features
            </a>
            <a href="/#support" className={`text-sm font-medium ${linkClass}`}>
              Support
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle
              compact
              className={
                onHome
                  ? "!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
                  : ""
              }
            />

            {["ADMIN", "SUPER_ADMIN"].includes(user?.role) && (
              <Link
                href="/admin"
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  onHome
                    ? "border border-white/30 text-white hover:bg-white/10"
                    : "border border-slate-200 text-[#0B2545] hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                Admin
              </Link>
            )}
            {user?.role === "RIDER" && (
              <Link
                href="/rider"
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  onHome
                    ? "border border-white/30 text-white hover:bg-white/10"
                    : "border border-slate-200 text-[#0B2545] hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                Rider
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/all-orders"
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                    onAllOrders
                      ? onHome
                        ? "bg-white/25 text-white"
                        : "bg-[#0077C8]/15 text-[#0077C8] dark:bg-sky-500/20 dark:text-sky-400"
                      : onHome
                        ? "bg-white/15 text-white hover:bg-white/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  All Orders
                </Link>

                {/* Profile photo + Username to the RIGHT of photo */}
                <Link
                  href="/profile"
                  className={`inline-flex max-w-[12rem] items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2 transition ${
                    onHome ? "hover:bg-white/15" : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                  title={displayName}
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white/50"
                    />
                  ) : (
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        onHome
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-500 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </span>
                  )}
                  <span
                    className={`truncate text-xs font-semibold ${
                      onHome ? "text-white" : "text-[#0B2545] dark:text-zinc-100"
                    }`}
                  >
                    {displayName}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    onHome ? "text-white/90" : "text-slate-600 dark:text-zinc-300"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    onHome
                      ? "bg-white text-[#0077C8]"
                      : "bg-[#0077C8] text-white dark:bg-sky-500"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
