"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F7FC] px-4 text-center">
      <p className="text-lg font-semibold text-[#0B2545]">Something went wrong</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {error?.message || "Please try again."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-[#0077C8] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
