export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F0F7FC]">
      <div className="h-14 animate-pulse bg-[#0077C8]/80" />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mx-auto mb-6 h-20 w-20 animate-pulse rounded-full bg-slate-200" />
        <div className="mx-auto mb-3 h-8 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="mx-auto mb-8 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
