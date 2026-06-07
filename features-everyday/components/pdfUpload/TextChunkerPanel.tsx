"use client";

import type { TextChunk } from "@/service/pdfUpload/route";
import { FileText, Layers } from "lucide-react";

export default function TextChunkerPanel({
  textLength,
  chunks,
  chunkSize,
  overlapSize,
  embeddingDimensions,
  embeddingModel,
  className = "",
}: {
  textLength: number;
  chunks: TextChunk[];
  chunkSize: number;
  overlapSize: number;
  embeddingDimensions: number;
  embeddingModel: string;
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-col rounded-lg border border-neutral-800 bg-neutral-900 p-5 ${className}`}>
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Layers className="h-4 w-4 text-emerald-300" />
          Text Chunks
        </div>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          These chunks were created by the PDF extraction service.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm text-neutral-300">
        <span className="rounded-lg bg-neutral-950 px-3 py-2">
          Text length: {textLength} chars
        </span>
        <span className="rounded-lg bg-neutral-950 px-3 py-2">
          Chunk size: {chunkSize} chars
        </span>
        <span className="rounded-lg bg-neutral-950 px-3 py-2">
          Overlap: {overlapSize} chars
        </span>
        <span className="rounded-lg bg-neutral-950 px-3 py-2">
          Chunks: {chunks.length}
        </span>
        <span className="rounded-lg bg-neutral-950 px-3 py-2">
          Embedding size: {embeddingDimensions}
        </span>
        <span className="rounded-lg bg-neutral-950 px-3 py-2">
          Model: {embeddingModel}
        </span>
      </div>

      <div className="custom-scrollbar mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
        {chunks.map((chunk) => (
          <article
            key={`${chunk.id}-${chunk.start}-${chunk.end}`}
            className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileText className="h-4 w-4 text-emerald-300" />
                Chunk {chunk.id}
              </div>
              <span className="text-xs font-medium text-neutral-400">
                {chunk.start}-{chunk.end}
              </span>
            </div>
            <div className="mt-3 rounded-lg bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
              Embedding preview: [{chunk.embedding.slice(0, 8).join(", ")}
              {chunk.embedding.length > 8 ? ", ..." : ""}]
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-300">
              {chunk.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
