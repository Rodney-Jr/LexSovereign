# Production AI Configuration: Legal Repository Access

This document outlines how the **NomosDesk AI** accesses and queries the legal repository within the **Railway production environment** using its RAG (Retrieval-Augmented Generation) pipeline.

## 1. Railway Environment Variables
The following variables must be configured in the Railway dashboard for the production service:

| Variable | Recommended Value | Purpose |
| :--- | :--- | :--- |
| `AI_PROVIDER` | `openrouter` | Routes reasoning tasks through OpenRouter. |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Grants the logic engine access to Gemini 2.0. |
| `OPENAI_API_KEY` | `sk-...` | **Crucial**: Used by `LegalQueryService` for the vector embedding engine (`text-embedding-3-small`). |
| `OPENROUTER_MODEL` | `google/gemini-2.0-flash-001` | Specifies the exact Gemini version to use for legal analysis. |

## 2. Knowledge Base Ingestion (The "Training" Equivalent)
NomosDesk Sovereign does not "train" on public data. Instead, it creates a **Dynamic Legal Index** in your production database.

1.  **Admin Ingestion**: Use the **Judicial Ingestion Hub** in the Administrative view to upload legal documents (Statutes, Gazettes, or Case Law).
2.  **Vectorization**: The `JudicialIngestionService` uses your `OPENAI_API_KEY` to convert these documents into mathematical vectors and store them in the `gazetteEmbedding` table.
3.  **Secure Storage**: Documents remain within your secure Railway PostgreSQL instance and are never uploaded to public models for training.

## 3. Real-Time Access Flow
Once configured, the AI follows this secure path for every query:
1.  **Retrieval**: `LegalQueryService` uses the `OPENAI_API_KEY` to vectorize the user's question and find the top 3 most relevant laws in your production database.
2.  **Augmentation**: The text of these matching laws is injected into the Gemini prompt via **OpenRouter**.
3.  **Sovereign Reasoning**: Gemini interprets the retrieved law and generates a response, citing official Source URLs from your local repository.

> [!IMPORTANT]
> **Embedding Engine Requirement**: The production codebase currently depends on OpenAI's specialized embedding model (`text-embedding-3-small`) to maintain high-velocity vector search. Ensure your OpenAI key is active even if your primary reasoning model is Gemini.
