"use client";

import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-neutral-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
