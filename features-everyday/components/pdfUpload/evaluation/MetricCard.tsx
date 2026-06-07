"use client";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export default function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-4 transition hover:border-neutral-700 hover:bg-neutral-950">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs text-neutral-400">{hint}</p> : null}
    </div>
  );
}
