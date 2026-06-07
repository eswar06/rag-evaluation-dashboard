const fs = require("fs");
const { parsePdf } = require("../services/pdfExtractor.service");
const { createUniversalChunks, createFixedChunks, createOverlapChunks } = require("../services/chunking.service");
const { enrichChunksWithMetadata } = require("../services/metadata.service");
const { createEmbeddedChunks } = require("../services/embedding.service");
const { LocalVectorIndex } = require("../services/vectorIndex.service");
const { parseChunkNumber } = require("../utils/parsing.utils");
const embeddedChunkStore = require("../storage/embeddedChunkStore");
const { EMBEDDING_MODEL } = require("../config/ai.config");
const { PDFDocument } = require('pdf-lib');

const validateBackendPdf = async (filePath) => {
    const existingPdfBytes = fs.readFileSync(filePath);
    
    // Load document metadata structure securely without complex workers
    const pdfDoc = await PDFDocument.load(existingPdfBytes, { updateMetadata: false });
    const pageCount = pdfDoc.getPageCount();
    
    return pageCount;
};


const uploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "PDF file is required" });
        }

        const pageCount = await validateBackendPdf(req.file.path);
        if (pageCount > 25) {
            return res.status(400).json({ error: "⚠️ Upload Limit: Due to the processing constraints of our AI embedding model (gemini-embedding-1.0), the maximum allowed document length is 25 pages. Please split larger PDFs into smaller parts before uploading." });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await parsePdf(dataBuffer);

        const chunkSize = Math.max(1, parseChunkNumber(req.body.chunkSize, 800));
        const overlapSize = Math.max(0, parseChunkNumber(req.body.overlapSize, 150));
        const chunkingType = req.body.chunkingType || "Recursive";

        if (chunkingType !== "Fixed" && overlapSize >= chunkSize) {
            return res.status(400).json({ error: "Overlap size must be smaller than chunk size" });
        }

        let chunks = [];
        switch (chunkingType) {
            case "Fixed":
                chunks = createFixedChunks(data.text, chunkSize);
                break;
            case "Overlap":
                chunks = createOverlapChunks(data.text, chunkSize, overlapSize);
                break;
            case "Recursive":
            default:
                chunks = createUniversalChunks(data.text, chunkSize, overlapSize);
                break;
        }

        if (chunks.length === 0) {
            return res.status(400).json({ error: "No text could be extracted from this PDF" });
        }

        const enrichedChunks = enrichChunksWithMetadata(
            chunks,
            data.text,
            req.file.originalname || "Uploaded PDF",
            data.numpages || data.numrender || 1
        );

        const embeddedChunks = await createEmbeddedChunks(enrichedChunks);
        console.log(embeddedChunks, "embedded chunks")

        if (embeddedChunks.length !== chunks.length) {
            return res.status(500).json({
                error: "Failed to generate embeddings for every chunk"
            });
        }

        // Store globally in the storage abstraction
        embeddedChunkStore.setChunks(embeddedChunks);
        const localVectorIndex = new LocalVectorIndex();
        localVectorIndex.build(embeddedChunks);
        embeddedChunkStore.setVectorIndex(localVectorIndex);

        res.json({
            text: data.text,
            chunks: enrichedChunks.map((chunk, index) => ({
                ...chunk,
                embedding: embeddedChunks[index].embedding
            })),
            embeddings: embeddedChunks,
            chunkCount: chunks.length,
            embeddedCount: embeddedChunks.length,
            chunkSize,
            overlapSize,
            embeddingDimensions: embeddedChunks[0]?.embedding.length || 0,
            embeddingModel: EMBEDDING_MODEL
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: error.message || "Failed to process PDF" });
    } finally {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
};

module.exports = {
    uploadPdf
};
