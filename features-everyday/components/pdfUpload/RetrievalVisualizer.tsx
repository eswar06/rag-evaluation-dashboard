"use client";

import {
  searchPdfChunks,
  type RetrievalMatch,
} from "@/service/pdfUpload/route";
import { FormEvent, useState } from "react";
import { BarChart3, Loader2, Search, Sparkles } from "lucide-react";

const formatScore = (score: number) => score.toFixed(2);

export type RetrievalSession = {
  query: string;
  topK: number;
  retrievalLatencyMs: number;
  matches: RetrievalMatch[];
};

export default function RetrievalVisualizer({
  disabled = false,
  onShowMetrics,
  onRetrievalSessionChange,
}: {
  disabled?: boolean;
  onShowMetrics?: () => void;
  onRetrievalSessionChange?: (session: RetrievalSession | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(3);
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [matches, setMatches] = useState<RetrievalMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retrievalLatencyMs, setRetrievalLatencyMs] = useState<number | null>(null);
  const hasRetrievalResults = Boolean(submittedQuestion) && !errorMessage && retrievalLatencyMs !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || loading || disabled) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setRetrievalLatencyMs(null);
    onRetrievalSessionChange?.(null);

    try {
      const start = performance.now();
      const data = await searchPdfChunks(trimmedQuery, topK);
      const latency = Math.round(performance.now() - start);
      console.log(data, "data from retrieval visualizer")
      setSubmittedQuestion(data.query);
      setMatches(data.matches);
      setRetrievalLatencyMs(latency);
      onRetrievalSessionChange?.({
        query: data.query,
        topK,
        retrievalLatencyMs: latency,
        matches: data.matches,
      });
    } catch (error) {
      setMatches([]);
      setSubmittedQuestion(trimmedQuery);
      setRetrievalLatencyMs(null);
      onRetrievalSessionChange?.(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to retrieve chunks."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-lg border border-neutral-800 bg-neutral-900 p-5 transition ${
        disabled ? "opacity-55" : ""
      }`}
    >
      <div className="shrink-0 border-b border-neutral-800 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            Retrieval Visualizer
          </div>
          <button
            type="button"
            onClick={onShowMetrics}
            disabled={!hasRetrievalResults}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:border-cyan-200 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Show Metrics
          </button>
        </div>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Ask a question and see which chunks semantic search retrieves.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 shrink-0 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-neutral-200">Question</span>
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={3}
            disabled={disabled}
            placeholder="What did Eswar achieve?"
            className="mt-2 w-full resize-none rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-300 disabled:cursor-not-allowed"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block sm:w-36">
            <span className="text-sm font-medium text-neutral-200">Top K</span>
            <input
              type="number"
              min={1}
              max={10}
              value={topK}
              disabled={disabled}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                setTopK(Number.isFinite(nextValue) ? Math.max(1, nextValue) : 1);
              }}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300 disabled:cursor-not-allowed"
            />
          </label>

          <button
            type="submit"
            disabled={disabled || loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search Chunks
          </button>
        </div>
      </form>

      <div className="custom-scrollbar mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        {disabled && (
          <p className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-400">
            Upload and process a PDF to enable retrieval.
          </p>
        )}

        {errorMessage && (
          <p className="rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </p>
        )}

        {submittedQuestion && !errorMessage && (
          <div>
            <p className="text-sm font-semibold text-white">Question:</p>
            <p className="mt-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm text-neutral-200">
              {submittedQuestion}
            </p>
            {retrievalLatencyMs !== null && (
              <p className="mt-3 text-sm text-neutral-400">
                Retrieval:{" "}
                <span className="font-semibold text-emerald-300">
                  {retrievalLatencyMs}ms
                </span>
              </p>
            )}
          </div>
        )}

        {matches.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-white">Retrieved Chunks:</p>
            <div className="mt-3 space-y-3">
              {matches.map((match) => (
                <article
                  key={`${match.id}-${match.score}`}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-white">
                      [Chunk {match.id}]
                    </p>
                    <span className="rounded-md bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                      Similarity: {formatScore(match.score)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-300">
                    {match.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
