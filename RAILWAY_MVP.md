
# NomosDesk: Railway MVP Deployment Guide

This guide details how to run the NomosDesk architecture on **Railway.app** for an MVP while respecting our Zero-Knowledge and Sovereign constraints.

## 1. The Split-Plane Philosophy
In a standard app, everything sits on the PaaS. In NomosDesk, we split the planes:
*   **Control Plane (Railway):** The UI, API logic, and Gemini Orchestration.
*   **Data Plane (Regional):** Regional object storage (e.g., Storj, AWS S3 in Cape Town, or a local primary server).

## 2. Security Enforcement
To run safely on Railway, the following environment variables must be configured:
*   `DATABASE_URL`: Connection string for a PostgreSQL database (Add PostgreSQL Plugin).
*   `JWT_SECRET`: A strong random string for session security.
*   `GEMINI_API_KEY`: Your Gemini Pro API Key.
*   `DAS_SCRUBBING_LEVEL`: Set to `3` (Aggressive) for PaaS deployments to ensure no PII reaches Railway logs.
*   `SOVEREIGN_REGION_PIN`: Hardcoded to your primary silo (e.g., `SOV-PR-1`).
*   `VITE_SHOW_PRICING`: Set to `false` to hide pricing until launch.

## 3. Deployment Steps
1.  **Repository Sync:** Connect your NomosDesk repo to Railway.
2.  **Stateless Mode:** Ensure no persistent volumes are attached to the Railway service. This enforces the rule that no data lives in the cloud.
3.  **Proxy Configuration:** The `services/geminiService.ts` automatically detects the environment and applies the **Blind-fold Proxy** logic.

## 4. MVP Limitations
*   **HSM Simulation:** In the Railway MVP, HSM signing is simulated via Software-KMS. FIPS 140-2 Level 3 hardware requires Phase 3 Physical Enclaves.
*   **Regional Latency:** Expect a ~150ms round-trip overhead as the Control Plane handshakes with the Regional Data Plane.

## 5. Transitioning to Production
Once the MVP is verified, the Control Plane should be migrated to a **Private Sovereign Cloud** instance located physically within the target jurisdiction.
