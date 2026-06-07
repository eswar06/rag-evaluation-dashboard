export type TextChunk = {
  id: number;
  start: number;
  end: number;
  text: string;
  embedding: number[];
};

export type EmbeddedChunk = {
  id: number;
  text: string;
  embedding: number[];
};

export type PdfExtractResponse = {
  text: string;
  chunks: TextChunk[];
  embeddings: EmbeddedChunk[];
  chunkSize: number;
  overlapSize: number;
  embeddingDimensions: number;
  embeddingModel: string;
};

export type PdfChunkOptions = {
  chunkSize: number;
  overlapSize: number;
  chunkingType: string;
};

export type RetrievalMatch = {
  id: number;
  text: string;
  score: number;
};

export type QueryResponse = {
  query: string;
  topK: number;
  results: string[];
  matches: RetrievalMatch[];
};

const PDF_EXTRACT_API_URL = "http://localhost:3003/upload-pdf";
const PDF_QUERY_API_URL = "http://localhost:3003/query";

export const uploadPdfForExtraction = (
  file: File,
  options: PdfChunkOptions,
  onProgress: (progress: number) => void
): Promise<PdfExtractResponse> => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("chunkSize", String(options.chunkSize));
  formData.append("overlapSize", String(options.overlapSize));
  formData.append("chunkingType", options.chunkingType);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", PDF_EXTRACT_API_URL);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };

    request.onload = () => {
      let data: PdfExtractResponse | { error?: string };

      try {
        data = JSON.parse(request.responseText);
      } catch {
        reject(new Error("PDF service returned an invalid response"));
        return;
      }

      if (request.status >= 200 && request.status < 300 && "text" in data) {
        onProgress(100);
        resolve(data);
        return;
      }

      reject(
        new Error("error" in data && data.error ? data.error : "PDF extraction failed")
      );
    };

    request.onerror = () => {
      reject(new Error("Could not connect to the PDF extraction service"));
    };

    request.send(formData);
  });
};

export const searchPdfChunks = async (
  query: string,
  topK: number
): Promise<QueryResponse> => {
  const response = await fetch(PDF_QUERY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, topK }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to search PDF chunks");
  }

  return data;
};
