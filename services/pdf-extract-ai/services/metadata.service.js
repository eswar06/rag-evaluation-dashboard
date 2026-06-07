const estimatePageNumber = (chunkStart, totalTextLength, pageCount) => {
    if (!pageCount || pageCount <= 1 || totalTextLength <= 0) {
        return 1;
    }

    const pageIndex = Math.floor((chunkStart / totalTextLength) * pageCount);
    return Math.min(Math.max(pageIndex + 1, 1), pageCount);
};

const findSectionTitle = (fullText, chunkStart) => {
    const textBeforeChunk = fullText.slice(0, chunkStart);
    const nearbyLines = textBeforeChunk
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(-12);

    for (let index = nearbyLines.length - 1; index >= 0; index -= 1) {
        const line = nearbyLines[index];
        const looksLikeHeading =
            line.length <= 90 &&
            !/[.!?]$/.test(line) &&
            (line === line.toUpperCase() || /^[\dA-Z][\w\s:,-]+$/.test(line));

        if (looksLikeHeading) {
            return line;
        }
    }

    return "General";
};

const createMetadataPrefix = (metadata) => {
    return [
        `Document: ${metadata.document_name}`,
        `Section: ${metadata.section_title}`,
        `Page: ${metadata.page_number}`
    ].join(" | ");
};

const enrichChunksWithMetadata = (chunks, fullText, documentName, pageCount) => {
    return chunks.map((chunk) => {
        const metadata = {
            document_name: documentName,
            section_title: findSectionTitle(fullText, chunk.start),
            page_number: estimatePageNumber(chunk.start, fullText.length, pageCount)
        };

        return {
            ...chunk,
            metadata,
            embeddingText: `${createMetadataPrefix(metadata)}\n\n${chunk.text}`
        };
    });
};

module.exports = {
    estimatePageNumber,
    findSectionTitle,
    createMetadataPrefix,
    enrichChunksWithMetadata
};
