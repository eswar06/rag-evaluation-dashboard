"use client";

import type { RetrievalMatch } from "@/service/pdfUpload/route";

const formatScore = (score: number) => score.toFixed(2);

export default function RetrievalPreviewCard({ match }: { match: RetrievalMatch }) {
  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">Chunk {match.id}</p>
        <span className="rounded-md bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-200">
          {formatScore(match.score)}
        </span>
      </div>
      <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-neutral-300">
        {match.text}
      </p>
    </article>
  );
}
