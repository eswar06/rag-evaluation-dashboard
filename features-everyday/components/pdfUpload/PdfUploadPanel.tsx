// 

"use client";

import EvaluationWorkspace, {
  type EvaluationWorkspaceData,
} from "@/components/pdfUpload/evaluation/EvaluationWorkspace";
import RetrievalVisualizer, {
  type RetrievalSession,
} from "@/components/pdfUpload/RetrievalVisualizer";
import TextChunkerPanel from "@/components/pdfUpload/TextChunkerPanel";
import { uploadPdfForExtraction, type TextChunk } from "@/service/pdfUpload/route";
import { ChangeEvent, DragEvent, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  SlidersHorizontal,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react"

type UploadStatus = "idle" | "uploading" | "complete" | "error";
type ChunkMode = "basic" | "advanced";

type SelectedFile = {
  name: string;
  size: number;
};

const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP_SIZE = 150;
const MIN_CHUNK_SIZE = 100;
const MAX_CHUNK_SIZE = 3000;
const SHOW_EXTRACTED_TEXT = false;

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PdfUploadPanel() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [embeddingDimensions, setEmbeddingDimensions] = useState(0);
  const [embeddingModel, setEmbeddingModel] = useState("");
  const [chunkMode, setChunkMode] = useState<ChunkMode>("basic");
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const [overlapSize, setOverlapSize] = useState(DEFAULT_OVERLAP_SIZE);
  const [isOverlapEnabled, setIsOverlapEnabled] = useState(true);
  const [retrievalResetKey, setRetrievalResetKey] = useState(0);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [retrievalSession, setRetrievalSession] = useState<RetrievalSession | null>(null);

  const chunkingType = chunkMode === "basic" ? "Recursive" : (isOverlapEnabled ? "Overlap" : "Fixed");
  const activeChunkSize = chunkMode === "basic" ? DEFAULT_CHUNK_SIZE : chunkSize;
  const activeOverlap = chunkMode === "basic" ? DEFAULT_OVERLAP_SIZE : (isOverlapEnabled ? overlapSize : 0);
  const maxOverlapSize = Math.max(0, activeChunkSize - 1);
  const hasInvalidOverlap = chunkingType !== "Fixed" && activeOverlap >= activeChunkSize;
  const hasProcessedPdf = status === "complete" && Boolean(extractedText);
  const areChunkSettingsLocked = status === "uploading" || hasProcessedPdf;

  const resetProcessedData = () => {
    setExtractedText("");
    setChunks([]);
    setEmbeddingDimensions(0);
    setEmbeddingModel("");
  };

  const uploadFile = async (file: File) => {
    setSelectedFile({ name: file.name, size: file.size });
    setUploadProgress(0);
    setStatus("uploading");
    setErrorMessage("");
    resetProcessedData();

    try {
      const data = await uploadPdfForExtraction(
        file,
        { chunkSize: activeChunkSize, overlapSize: activeOverlap, chunkingType },
        setUploadProgress
      );
      setExtractedText(data.text);
      setChunks(data.chunks);
      setEmbeddingDimensions(data.embeddingDimensions);
      setEmbeddingModel(data.embeddingModel);
      setStatus("complete");
    } catch (error) {
      setUploadProgress(0);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to extract PDF text."
      );
    }
  };

  const handleFile = (file?: File) => {
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setUploadProgress(0);
      setStatus("error");
      setErrorMessage("Please upload a PDF file.");
      resetProcessedData();
      return;
    }

    if (hasInvalidOverlap) {
      setSelectedFile(null);
      setUploadProgress(0);
      setStatus("error");
      setErrorMessage("Overlap must be smaller than the chunk size.");
      resetProcessedData();
      return;
    }

    uploadFile(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const clearUpload = () => {
    setIsDragging(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setStatus("idle");
    setErrorMessage("");
    resetProcessedData();
    setRetrievalResetKey((currentKey) => currentKey + 1);
    setRetrievalSession(null);
    setIsEvaluationOpen(false);
  };

  const evaluationData: EvaluationWorkspaceData | null = retrievalSession
    ? {
        ...retrievalSession,
        chunkSize: activeChunkSize,
        overlapSize: activeOverlap,
        chunkCount: chunks.length,
        strategyUsed: chunkingType,
      }
    : null;

  const handleRetrievalSessionChange = (session: RetrievalSession | null) => {
    setRetrievalSession(session);
    if (!session) {
      setIsEvaluationOpen(false);
    }
  };

  const updateChunkSize = (value: string) => {
    const nextValue = Number(value);
    const safeChunkSize = Number.isFinite(nextValue)
      ? Math.min(Math.max(nextValue, MIN_CHUNK_SIZE), MAX_CHUNK_SIZE)
      : DEFAULT_CHUNK_SIZE;

    setChunkSize(safeChunkSize);
    setOverlapSize((currentOverlapSize) =>
      Math.min(currentOverlapSize, safeChunkSize - 1)
    );
  };

  const updateOverlapSize = (value: string) => {
    const nextValue = Number(value);
    setOverlapSize(
      Number.isFinite(nextValue)
        ? Math.min(Math.max(0, nextValue), maxOverlapSize)
        : DEFAULT_OVERLAP_SIZE
    );
  };

  const statusLabel = {
    idle: "Waiting for PDF",
    uploading: "Uploading PDF",
    complete: "Upload complete",
    error: "Upload failed",
  }[status];

  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
      {/* Upload PDF — full width */}
      <div className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">Upload PDF</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Upload once, then search retrieved chunks.
            </p>
          </div>
          {(selectedFile || extractedText || status === "error") && (
            <button
              type="button"
              onClick={clearUpload}
              disabled={status === "uploading"}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300/40 px-3 py-2 text-sm font-semibold text-red-200 transition hover:border-red-200 hover:bg-red-300/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition ${
            isDragging
              ? "border-emerald-300 bg-emerald-300/10"
              : "border-neutral-700 bg-neutral-950"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200">
            <FileText className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-white">
            Drop a PDF here
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Or choose a file from your device.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-200 active:scale-[0.98]">
            <Upload className="h-4 w-4" />
            Choose PDF
          </span>
        </label>

        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-neutral-300">
                {status === "uploading" && <Loader2 className="h-5 w-5 animate-spin" />}
                {status === "complete" && <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                {status === "error" && <XCircle className="h-5 w-5 text-red-300" />}
                {status === "idle" && <Upload className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{statusLabel}</p>
                <p className="mt-1 text-sm text-neutral-400">
                  {status === "error" && errorMessage
                    ? errorMessage
                    : selectedFile
                      ? `${selectedFile.name} - ${formatFileSize(selectedFile.size)}`
                      : "No PDF selected"}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-300">{uploadProgress}%</p>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-900">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                status === "error" ? "bg-red-300" : "bg-emerald-300"
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chunk Settings — full width */}
      <div className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex flex-col gap-4 border-b border-neutral-800 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <SlidersHorizontal className="h-4 w-4 text-emerald-300" />
              Chunk Settings
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Basic uses recommended settings automatically. Advanced is for tuning retrieval behavior.
            </p>
          </div>

          <div className="flex rounded-lg border border-neutral-700 bg-neutral-950 p-1">
            <button
              type="button"
              onClick={() => setChunkMode("basic")}
              disabled={areChunkSettingsLocked}
              className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                chunkMode === "basic"
                  ? "bg-emerald-300 text-neutral-950"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setChunkMode("advanced")}
              disabled={areChunkSettingsLocked}
              className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                chunkMode === "advanced"
                  ? "bg-emerald-300 text-neutral-950"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {chunkMode === "basic" ? (
          <div className="mt-5 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-300 flex flex-col gap-2">
            <div>
              Automatic settings: <span className="font-semibold text-emerald-300">{DEFAULT_CHUNK_SIZE}</span> character chunks with <span className="font-semibold text-emerald-300">{DEFAULT_OVERLAP_SIZE}</span> character overlap.
            </div>
            <div className="text-xs text-neutral-400">
              Chunking Strategy: <span className="font-semibold text-white px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Recursive Chunking</span> (sentence-aware structural splitting)
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Enable Overlap Slicing</span>
                <span className="text-xs text-neutral-400">Overlap maintains continuity; disabling uses Fixed spacing.</span>
              </div>
              <button
                type="button"
                disabled={areChunkSettingsLocked}
                onClick={() => setIsOverlapEnabled(prev => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  isOverlapEnabled ? "bg-emerald-400" : "bg-neutral-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow ring-0 transition duration-200 ease-in-out ${
                    isOverlapEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-neutral-200">
                Chunk size
              </span>
              <input
                type="number"
                min={MIN_CHUNK_SIZE}
                max={MAX_CHUNK_SIZE}
                value={chunkSize}
                onChange={(event) => updateChunkSize(event.target.value)}
                disabled={areChunkSettingsLocked}
                className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                Larger chunks preserve broader paragraph context. Recommended: 500 - 1500.
              </p>
            </label>

            <label className={`block ${!isOverlapEnabled ? 'opacity-40' : ''}`}>
              <span className="text-sm font-medium text-neutral-200">
                Overlap size
              </span>
              <input
                type="number"
                min={0}
                max={maxOverlapSize}
                value={isOverlapEnabled ? overlapSize : 0}
                onChange={(event) => updateOverlapSize(event.target.value)}
                disabled={areChunkSettingsLocked || !isOverlapEnabled}
                className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                {!isOverlapEnabled ? "Disabled for Fixed spacing chunking." : "Keeps text continuity between chunks. Recommended: 10% - 20% of chunk size."}
              </p>
            </label>
          </div>
        )}

        {hasInvalidOverlap && (
          <p className="mt-4 rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-100">
            Overlap must be smaller than the chunk size.
          </p>
        )}
        {hasProcessedPdf && (
          <p className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-400">
            Clear the current PDF to change chunk settings and regenerate embeddings.
          </p>
        )}
      </div>

      {SHOW_EXTRACTED_TEXT && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileText className="h-4 w-4 text-emerald-300" />
            Extracted Text
          </div>
          {extractedText ? (
            <pre className="custom-scrollbar mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-neutral-950 p-4 text-sm leading-6 text-neutral-200">
              {extractedText}
            </pre>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-neutral-800 bg-neutral-950 px-4 py-8 text-center text-sm text-neutral-500">
              Extracted text will appear here after upload.
            </div>
          )}
        </div>
      )}

      {/* Text Chunks + Retrieval Visualizer — 50/50 row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TextChunkerPanel
          className="h-[760px]"
          textLength={extractedText.trim().length}
          chunks={chunks}
          chunkSize={activeChunkSize}
          overlapSize={activeOverlap}
          embeddingDimensions={embeddingDimensions}
          embeddingModel={embeddingModel || "Not generated yet"}
        />

        <div className="h-[760px] min-h-0 overflow-y-auto">
          <RetrievalVisualizer
            key={retrievalResetKey}
            disabled={!hasProcessedPdf}
            onShowMetrics={() => setIsEvaluationOpen(true)}
            onRetrievalSessionChange={handleRetrievalSessionChange}
          />
        </div>
      </div>

      <EvaluationWorkspace
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
        data={evaluationData}
      />
    </section>
  );
}