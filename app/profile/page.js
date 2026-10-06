"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ThemeToggle from "@/components/ThemeToggle";
import {
  User,
  Camera,
  Loader2,
  CheckCircle,
  Shield,
  MessageSquareWarning,
  Moon,
  Home,
  LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [customHostel, setCustomHostel] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [sendingComplaint, setSendingComplaint] = useState(false);
  const [hostels, setHostels] = useState([]);

  function toast(text, ok = true) {
    setMsg(text);
    setMsgOk(ok);
    setTimeout(() => setMsg(""), 3500);
  }

  async function load() {
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user) {
        router.push("/login");
        return;
      }
      setUser(me.user);
      setName(me.user.name || "");
      setUsername(me.user.username || "");
      setPhone(me.user.phone || "");
      setHostel(me.user.hostel || "");
      setCustomHostel(me.user.customHostel || "");
      const hos = await fetch("/api/hostels").then((r) => r.json());
      setHostels((hos.hostels || []).filter((h) => h.active !== false));
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          phone,
          hostel,
          customHostel: hostel === "Other" ? customHostel : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setUser(data.user || { ...user, name, username, phone, hostel, customHostel });
      setEdit(false);
      toast("Profile saved");
    } catch (e) {
      toast(e.message || "Save failed", false);
    } finally {
      setSaving(false);
    }
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/auth/profile", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUser((u) => ({ ...u, profilePhoto: data.profilePhoto || data.user?.profilePhoto }));
      toast("Photo updated");
    } catch (err) {
      toast(err.message || "Upload failed", false);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submitComplaint() {
    if (!complaint.trim() || complaint.trim().length < 5) {
      toast("Write at least 5 characters", false);
      return;
    }
    setSendingComplaint(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: complaint.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setComplaint("");
      toast("Complaint sent to admins");
    } catch (e) {
      toast(e.message || "Failed", false);
    } finally {
      setSendingComplaint(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(String(user?.role || "").toUpperCase());

  return (
    <div className="min-h-screen bg-[#EEF6FC] pb-16 dark:bg-zinc-950">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-[#0B2545] dark:text-zinc-100">Your Profile</h1>

        {msg && (
          <div
            className={`mb-3 rounded-xl px-3 py-2 text-sm ${
              msgOk
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {msgOk && <CheckCircle className="mr-1 inline h-4 w-4" />}
            {msg}
          </div>
        )}

        {isAdmin && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>
                <strong>Admin Account</strong>
                <span className="block text-xs opacity-80">You have access to the admin dashboard.</span>
              </span>
            </div>
            <Link href="/admin" className="shrink-0 rounded-lg bg-[#0077C8] px-3 py-1.5 text-xs font-semibold text-white dark:bg-sky-500">
              Go to Admin
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 flex flex-col items-center">
            <div className="relative">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-[#0077C8]/15" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 ring-4 ring-slate-100 dark:bg-zinc-800 dark:ring-zinc-800">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
              )}
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#0077C8] text-white shadow hover:bg-[#0066AD] disabled:opacity-60 dark:bg-sky-500"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onPhoto} />
            </div>
            <p className="mt-3 text-lg font-bold text-[#0B2545] dark:text-zinc-100">{user.name || user.username || "User"}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          {!edit ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Username:</span> <strong>{user.username || "—"}</strong></p>
              <p><span className="text-slate-500">Phone:</span> <strong>{user.phone || "—"}</strong></p>
              <p><span className="text-slate-500">Hostel:</span> <strong>{user.hostel || "—"}</strong></p>
              <button type="button" onClick={() => setEdit(true)} className="mt-3 w-full rounded-xl bg-[#0077C8] py-2.5 text-sm font-semibold text-white">
                Edit profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
              <select value={hostel} onChange={(e) => setHostel(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950">
                <option value="">Select hostel</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {hostel === "Other" && (
                <input value={customHostel} onChange={(e) => setCustomHostel(e.target.value)} placeholder="Hostel name" className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
              )}
              <div className="flex gap-2">
                <button type="button" disabled={saving} onClick={saveProfile} className="flex-1 rounded-xl bg-[#0077C8] py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEdit(false)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold dark:border-zinc-700">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {!isAdmin && (
          <div className="mt-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-orange-900/40 dark:bg-zinc-900">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-orange-600" />
              <p className="text-sm font-semibold text-[#0B2545] dark:text-zinc-100">Submit a complaint</p>
            </div>
            <p className="mb-2 text-xs text-slate-500 dark:text-zinc-400">
              Describe delivery issues, wrong hostel, or any concern. Admins will see it under User Complaints.
            </p>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={4}
              placeholder="Type your complaint here…"
              className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <button
              type="button"
              disabled={sendingComplaint || !complaint.trim()}
              onClick={submitComplaint}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {sendingComplaint ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                "Send to admins"
              )}
            </button>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <div>
                <p className="text-sm font-semibold text-[#0B2545] dark:text-zinc-100">Appearance</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Light / Dark theme</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-zinc-900"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </main>
    </div>
  );
}
