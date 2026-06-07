# 🚀 RAG Evaluation Playground

Understand how retrieval pipelines actually work — not just your final answer.

Most RAG debugging stops at the generated output. This playground goes deeper. It lets you inspect every stage of the retrieval process: how your document was chunked, what got retrieved, why it ranked the way it did, and where it broke down.

---

## 🛠 Tech Stack

![React](https://img.shields.io/badge/React-Frontend-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38BDF8)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express-API-black)
![Gemini](https://img.shields.io/badge/Gemini-LLM-orange)

---

# Problem

Most retrieval issues originate before generation.

Common failure points include:

- ❌ Wrong chunk boundaries cutting off context
- ❌ Weak semantic similarity scores
- ❌ Poor reranking logic
- ❌ Retrieval thresholds that are too aggressive or too lenient

Without visibility into retrieval, you're guessing.

This project removes that guesswork.

---

# Pipeline

```text
PDF Upload
    ↓
Text Extraction
    ↓
Chunking Strategy
(Fixed / Fixed+Overlap / Recursive)
    ↓
Metadata Enrichment
    ↓
Embedding Generation
(Gemini text-embedding-004)
    ↓
Local Vector Index
(Cosine Similarity Search)
    ↓
Hybrid Reranking
(Vector + Keyword Matching)
    ↓
Threshold Filtering
    ↓
Evaluation Dashboard
```

---

# Features

## 1️⃣ Multiple Chunking Strategies

### Fixed Chunking

- Uniform chunk size
- No overlap between chunks
- Fast and simple baseline

### Fixed + Overlap

- Adjacent chunks share context
- Reduces context fragmentation
- Improves retrieval continuity

### Recursive Semantic Chunking

- Splits by:
  - Paragraphs
  - Sections
  - Headings
- Preserves semantic boundaries
- Produces more meaningful chunks

---

## 2️⃣ Hybrid Retrieval Ranking

Retrieval quality is improved using a hybrid scoring mechanism.

```text
Final Score =
(Vector Similarity × 0.55)
+
(Lexical Match Score × 0.45)
```

Benefits:

- Captures semantic meaning
- Rewards exact keyword matches
- Reduces irrelevant retrievals

---

## 3️⃣ Threshold-Based Filtering

Only high-confidence chunks are returned.

```text
Score >= 0.70
```

This helps eliminate weak matches and improves answer quality.

---

## 4️⃣ Retrieval Evaluation Dashboard

Inspect every retrieval decision.

### Retrieved Chunks

View:

- Chunk content
- Metadata
- Similarity scores

### Score Distribution

Analyze:

- Similarity score spread
- Retrieval confidence

### Confidence Analysis

Bucket retrieved chunks into:

- High Confidence
- Medium Confidence
- Low Confidence

### Top-K Analysis

Understand:

- Which chunks ranked highest
- Why they were selected

---

# Architecture

```text
User Query
     ↓
Embedding Generation
     ↓
Vector Search
     ↓
Hybrid Reranking
     ↓
Threshold Filtering
     ↓
Top-K Retrieval
     ↓
LLM Response
     ↓
Evaluation Dashboard
```

---

# Tech Stack Details

| Layer | Technology |
|---------|------------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Embeddings | Gemini text-embedding-004 |
| Vector Search | Local Vector Index |
| Similarity Metric | Cosine Similarity |
| Document Processing | PDF Extraction |
| Evaluation | Custom Retrieval Metrics |

---

# Quick Start

## Clone Repository

```bash
git clone https://github.com/yourusername/rag-evaluation-playground.git

cd rag-evaluation-playground
```

---

## Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

## Configure Environment Variables

Create:

```bash
.env
```

Add:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

---

## Start Backend

```bash
npm run dev
```

---

## Start Frontend

```bash
npm run dev
```

---

# How To Use

### Step 1

Upload a PDF

Examples:

- Resume
- Research Paper
- Report
- Documentation

### Step 2

Select a chunking strategy

- Fixed
- Fixed + Overlap
- Recursive

### Step 3

Ask a question

Example:

```text
What are the key achievements?
```

```text
Summarize the leadership section.
```

### Step 4

Inspect retrieval results

Observe:

- Retrieved chunks
- Similarity scores
- Ranking order
- Confidence levels

### Step 5

Switch strategies and compare

Evaluate how chunk boundaries impact:

- Retrieval quality
- Ranking performance
- Context preservation

---

# Experiments You Can Run

## Chunking

Does recursive chunking outperform fixed-size chunks?

## Overlap

How much overlap improves retrieval continuity?

## Threshold

Is 0.70 too strict or too lenient?

## Reranking

Does keyword reranking meaningfully improve ordering?

---

# Learning Goals

This project was built to understand:

- Retrieval-Augmented Generation (RAG)
- Chunking strategies
- Embedding generation
- Vector similarity search
- Hybrid reranking
- Retrieval observability
- RAG evaluation techniques

The goal is to understand *why retrieval systems perform the way they do* — not just whether they return an answer.

---

# Future Enhancements

- Cross-Encoder Reranking
- Pinecone / pgvector Integration
- Retrieval Precision & Recall Metrics
- Groundedness Evaluation
- Hallucination Detection
- Multi-Document Retrieval
- Retrieval Benchmarking Suite

---

## ⭐ Key Takeaway

Retrieval is where most RAG systems succeed or fail.

This playground makes retrieval observable, measurable, and comparable so you can systematically improve RAG performance.
