"use client";

import type { RetrievalMatch } from "@/service/pdfUpload/route";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import EvaluationTabs, { type EvaluationTab } from "./EvaluationTabs";
import MetricCard from "./MetricCard";
import RetrievalPreviewCard from "./RetrievalPreviewCard";
import SectionCard from "./SectionCard";

export type EvaluationWorkspaceData = {
  query: string;
  topK: number;
  retrievalLatencyMs: number;
  matches: RetrievalMatch[];
  chunkSize: number;
  overlapSize: number;
  chunkCount: number;
  strategyUsed: string;
};

const formatAvgSimilarity = (matches: RetrievalMatch[]) => {
  if (matches.length === 0) return "0.00";
  const avg = matches.reduce((sum, match) => sum + match.score, 0) / matches.length;
  return avg.toFixed(2);
};

const estimateTokens = (matches: RetrievalMatch[]) =>
  Math.max(0, Math.round(matches.reduce((sum, match) => sum + match.text.length, 0) / 4));

export default function EvaluationWorkspace({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: EvaluationWorkspaceData | null;
}) {
  const [activeTab, setActiveTab] = useState<EvaluationTab>("Overview");

  const avgSimilarity = useMemo(
    () => formatAvgSimilarity(data?.matches ?? []),
    [data?.matches]
  );
  const tokenUsage = useMemo(() => estimateTokens(data?.matches ?? []), [data?.matches]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
        aria-label="Close evaluation workspace backdrop"
      />

      <aside className="absolute right-0 top-0 h-full w-full border-l border-neutral-800 bg-neutral-950/95 shadow-2xl sm:w-[86vw] lg:w-[44vw] xl:w-[42vw]">
        <div className="flex h-full min-h-0 flex-col">
          <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">Evaluation Workspace</p>
                <h2 className="mt-1 text-lg font-semibold text-white">RAG Metrics Dashboard</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-neutral-700 p-2 text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                aria-label="Close evaluation workspace"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <EvaluationTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {activeTab === "Overview" && (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <MetricCard label="Avg Similarity" value={avgSimilarity} />
                  <MetricCard label="Retrieval Latency" value={`${data?.retrievalLatencyMs ?? 0}ms`} />
                  <MetricCard label="Token Usage" value={`${tokenUsage}`} />
                  <MetricCard label="Chunk Count" value={`${data?.chunkCount ?? 0}`} />
                  <MetricCard label="Strategy Used" value={data?.strategyUsed ?? "N/A"} />
                </div>
              </>
            )}

            {activeTab === "Retrieval" && (
              <>
                <SectionCard
                  title="Similarity Distribution"
                  subtitle="Mock chart placeholder for confidence spread across retrieved chunks."
                >
                  <div className="grid h-36 grid-cols-8 items-end gap-2 rounded-lg border border-dashed border-neutral-700 bg-neutral-950 p-3">
                    {[38, 45, 50, 60, 72, 66, 78, 84].map((height, idx) => (
                      <div
                        key={idx}
                        className="rounded-sm bg-gradient-to-t from-cyan-400/70 to-emerald-300/70"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Confidence Cards" subtitle="Mock confidence rollup for quick triage.">
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard label="High Confidence" value="68%" />
                    <MetricCard label="Medium Confidence" value="24%" />
                    <MetricCard label="Low Confidence" value="8%" />
                    <MetricCard label="Top K" value={`${data?.topK ?? 0}`} />
                  </div>
                </SectionCard>

                <SectionCard title="Retrieved Chunks Preview">
                  <div className="space-y-3">
                    {(data?.matches ?? []).slice(0, 4).map((match) => (
                      <RetrievalPreviewCard key={`${match.id}-${match.score}`} match={match} />
                    ))}
                    {(data?.matches?.length ?? 0) === 0 && (
                      <p className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-4 text-xs text-neutral-400">
                        Run retrieval to populate preview cards.
                      </p>
                    )}
                  </div>
                </SectionCard>
              </>
            )}

            {activeTab === "Performance" && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MetricCard label="Embedding Latency" value="92ms" hint="Mock placeholder" />
                <MetricCard label="Retrieval Latency" value={`${data?.retrievalLatencyMs ?? 0}ms`} />
                <MetricCard label="Token Usage" value={`${tokenUsage}`} />
                <MetricCard label="Estimated Cost" value="$0.0024" hint="Mock placeholder" />
                <MetricCard label="Vector Search Timing" value="47ms" hint="Mock placeholder" />
                <MetricCard label="Rerank Timing" value="31ms" hint="Mock placeholder" />
              </div>
            )}

            {activeTab === "Chunk Analysis" && (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <MetricCard label="Chunk Size" value={`${data?.chunkSize ?? 0}`} />
                  <MetricCard label="Overlap Size" value={`${data?.overlapSize ?? 0}`} />
                  <MetricCard label="Chunk Count" value={`${data?.chunkCount ?? 0}`} />
                  <MetricCard label="Strategy Name" value={data?.strategyUsed ?? "N/A"} />
                </div>
                <SectionCard
                  title="Chunk Preview Visualization"
                  subtitle="Mock structural map for chunk boundaries."
                >
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-10 rounded-md border border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800"
                      />
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {activeTab === "Quality" && (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <MetricCard label="Retrieval Confidence" value="Good" />
                  <MetricCard label="Weak Retrieval Warnings" value="1" hint="Mock placeholder" />
                </div>
                <SectionCard title="Metadata Cards" subtitle="Mock metadata health overview.">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-300">
                      Source coverage: 92%
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-300">
                      Citation readiness: 87%
                    </div>
                  </div>
                </SectionCard>
                <SectionCard title="Chunk Explanations" subtitle="Mock rationale placeholders per retrieval decision.">
                  <div className="space-y-2">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-400">
                      Chunk 2 matched due to domain keywords and semantic overlap.
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-400">
                      Chunk 5 flagged for low confidence due to sparse context.
                    </div>
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
