/**
 * STRATEGY 1: Pure Character Slicing (Fixed Size)
 */
const createFixedChunks = (text, chunkSize) => {
    if (!text || chunkSize <= 0) return [];
    const chunks = [];
    const normalizedText = text.replace(/\r\n/g, "\n");

    for (let i = 0; i < normalizedText.length; i += chunkSize) {
        const slice = normalizedText.slice(i, i + chunkSize);
        chunks.push({
            id: chunks.length + 1,
            start: i,
            end: i + slice.length,
            text: slice
        });
    }
    return chunks;
};

/**
 * STRATEGY 2: Pure Character Slicing (With Exact Character Overlap)
 */
const createOverlapChunks = (text, chunkSize, overlapSize) => {
    if (!text || chunkSize <= 0) return [];
    if (overlapSize >= chunkSize) overlapSize = chunkSize - 1; // Prevent infinite loops
    
    const chunks = [];
    const normalizedText = text.replace(/\r\n/g, "\n");
    let start = 0;

    while (start < normalizedText.length) {
        const end = Math.min(start + chunkSize, normalizedText.length);
        const slice = normalizedText.slice(start, end);
        
        chunks.push({
            id: chunks.length + 1,
            start,
            end,
            text: slice
        });

        if (end === normalizedText.length) break;
        // Shift forward by (Chunk Size minus Overlap)
        start += (chunkSize - overlapSize);
    }
    return chunks;
};

/**
 * STRATEGY 3: Recursive Paragraph Chunking Strategy (Recursive)
 * Preserves structural context by splitting on paragraphs, sentences, or spaces.
 */
const createUniversalChunks = (text, chunkSize = 800, overlapSize = 150) => {
    if (!text || chunkSize <= 0) return [];

    // 1. Normalize line endings but PRESERVE structural newlines
    const structuralText = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");
    
    const chunks = [];
    
    // 2. Split by logical structural units first (Paragraphs / Bullets / Lines)
    const lines = structuralText.split(/\n+/);
    
    let currentChunkText = "";
    let searchFrom = 0;

    const pushChunk = (chunkText) => {
        const trimmed = chunkText.trim();
        if (!trimmed) return;

        // Calculate exact indices in raw text
        const start = structuralText.indexOf(trimmed, searchFrom);
        const safeStart = start >= 0 ? start : searchFrom;
        const end = safeStart + trimmed.length;

        chunks.push({
            id: chunks.length + 1,
            start: safeStart,
            end,
            text: trimmed
        });

        // Advance search pointer, allowing for overlap lookups
        searchFrom = Math.max(0, end - overlapSize);
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // If a single line is bigger than the entire chunk size, split it by spaces safely
        if (line.length > chunkSize) {
            const words = line.split(" ");
            let subChunk = "";
            for (const word of words) {
                if ((subChunk + " " + word).length > chunkSize) {
                    if (subChunk) pushChunk(subChunk);
                    subChunk = word;
                } else {
                    subChunk += (subChunk ? " " : "") + word;
                }
            }
            if (subChunk) currentChunkText += (currentChunkText ? "\n" : "") + subChunk;
            continue;
        }

        // Check if adding the next structural line exceeds size limit
        if ((currentChunkText + "\n" + line).length <= chunkSize) {
            currentChunkText += (currentChunkText ? "\n" : "") + line;
        } else {
            // Commit current full chunk
            if (currentChunkText) {
                pushChunk(currentChunkText);
            }

            // 3. Smart Overlap: Backtrack by complete lines/words instead of raw characters
            let overlapText = "";
            const currentLines = currentChunkText.split("\n");
            let currentOverlapLength = 0;

            // Grab complete lines from the tail end for semantic preservation
            for (let j = currentLines.length - 1; j >= 0; j--) {
                const targetLine = currentLines[j];
                if (currentOverlapLength + targetLine.length <= overlapSize) {
                    overlapText = targetLine + (overlapText ? "\n" : "") + overlapText;
                    currentOverlapLength += targetLine.length + 1;
                } else {
                    break;
                }
            }

            currentChunkText = (overlapText ? overlapText + "\n" : "") + line;
        }
    }

    if (currentChunkText.trim()) {
        pushChunk(currentChunkText);
    }

    return chunks;
};

module.exports = {
    createFixedChunks,
    createOverlapChunks,
    createUniversalChunks
};
