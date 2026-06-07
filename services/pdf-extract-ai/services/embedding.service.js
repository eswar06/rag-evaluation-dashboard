// const { ai, EMBEDDING_MODEL } = require("../config/ai.config");

// const createEmbedding = async (text) => {
//     if (!process.env.GEMINI_API_KEY) {
//         throw new Error("GEMINI_API_KEY is required to generate embeddings");
//     }

//     const response = await ai.models.embedContent({
//         model: EMBEDDING_MODEL,
//         contents: text
//     });

//     const embedding = response.embedding?.values || response.embeddings?.[0]?.values;

//     if (!embedding) {
//         throw new Error("Embedding API did not return a vector");
//     }

//     return embedding;
// };

// const createEmbeddedChunks = async (chunks) => {
//     return Promise.all(
//         chunks.map(async (chunk) => ({
//             id: chunk.id,
//             start: chunk.start,
//             end: chunk.end,
//             text: chunk.text,
//             metadata: chunk.metadata,
//             embeddingText: chunk.embeddingText,
//             embedding: await createEmbedding(chunk.embeddingText)
//         }))
//     );
// };

// module.exports = {
//     createEmbedding,
//     createEmbeddedChunks
// };


const { ai, EMBEDDING_MODEL } = require("../config/ai.config");

const BATCH_SIZE = 5;
const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Exponential backoff delay.
 * Attempt 1 → 1s, Attempt 2 → 2s, Attempt 3 → 4s
 */
const delay = (attempt) =>
    new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));

/**
 * Embed a single text string with retry + exponential backoff.
 */
const createEmbedding = async (text, attempt = 0) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is required to generate embeddings");
    }

    try {
        const response = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
        });

        const embedding = response.embedding?.values || response.embeddings?.[0]?.values;

        if (!embedding) {
            throw new Error("Embedding API did not return a vector");
        }

        return embedding;
    } catch (error) {
        const isRetryable =
            error?.status === 429 ||  // rate limited
            error?.status === 503 ||  // service unavailable
            error?.code === "ECONNRESET";

        if (isRetryable && attempt < RETRY_LIMIT) {
            console.warn(
                `Embedding attempt ${attempt + 1} failed (${error?.status ?? error?.code}). Retrying in ${RETRY_DELAY_MS * Math.pow(2, attempt)}ms...`
            );
            await delay(attempt);
            return createEmbedding(text, attempt + 1);
        }

        throw error;
    }
};

/**
 * Embeds a single batch of chunks concurrently.
 * Batches are small enough (BATCH_SIZE) to stay within rate limits.
 */
const embedBatch = async (chunks) => {
    return Promise.all(
        chunks.map(async (chunk) => ({
            id: chunk.id,
            start: chunk.start,
            end: chunk.end,
            text: chunk.text,
            metadata: chunk.metadata,
            embeddingText: chunk.embeddingText,
            embedding: await createEmbedding(chunk.embeddingText),
        }))
    );
};

/**
 * Embeds all chunks in sequential batches of BATCH_SIZE.
 *
 * Why sequential batches instead of Promise.all across all chunks:
 * - Gemini free tier: 1,500 req/min, but bursts of 50+ concurrent
 *   requests reliably trigger 429s on larger documents.
 * - Sequential batches give the API time to breathe between groups
 *   while still parallelising within each group.
 *
 * @param {Array} chunks - Array of chunk objects with embeddingText
 * @param {Function} [onProgress] - Optional callback(completedCount, totalCount)
 * @returns {Promise<Array>} - Embedded chunks in original order
 */
const createEmbeddedChunks = async (chunks, onProgress) => {
    const results = [];
    const total = chunks.length;

    for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, total);
        const batch = chunks.slice(batchStart, batchEnd);

        const embeddedBatch = await embedBatch(batch);
        results.push(...embeddedBatch);

        if (onProgress) {
            onProgress(results.length, total);
        }

        console.log(`Embedded ${results.length}/${total} chunks`);
    }

    return results;
};

module.exports = {
    createEmbedding,
    createEmbeddedChunks,
};