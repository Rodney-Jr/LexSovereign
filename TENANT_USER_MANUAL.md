# NomosDesk: Practitioner User Manual (Tenant Workspace)

Welcome to your **Sovereign Legal Workspace**. This platform is designed to provide high-performance AI intelligence while ensuring your data remains pinned to your jurisdiction and under your exclusive cryptographic control.

---

## 1. Identity & Inception

### 1.1 The Sovereign Handshake
Access is managed via your firm's OIDC provider (Azure AD / Okta).
*   **Hardware MFA:** Every session requires a hardware-anchored signature.
*   **Identity Fragment:** Your device generates a unique token that is salted with your firm's **HSM Master Key**.

---

## 2. The Sovereign Vault

### 2.1 Ingesting Artifacts
Documents can be uploaded directly to the vault.
*   **AI Profiling:** The system automatically suggests Matter IDs and Jurisdictions.
*   **Regional Pinning:** All artifacts are pinned to the **SOV-PR-1 Silo**. NomosDesk guarantees that your data never leaves the primary logical boundary.

---

## 3. Intelligence & Chat

### 3.1 Legal Chat (Grounding)
Interact with your documents using **Gemini 3 Pro**. Every AI response includes **Sovereign Citations** that link back to the specific source document in the vault.

### 3.2 Sovereign Research Grounding
Interact with the **Research Toggle** in chat to verify current case law or statutory updates (e.g., "What is the current Sovereign policy on digital assets?"). 
*   The system uses Google Search grounding.
*   **PII-Scrubbing:** Your query is redacted by the DAS Proxy *before* it leaves the silo, ensuring no client identifiers are leaked to external search engines.

### 3.3 Autonomous Executive Briefing
For complex matters with hundreds of artifacts, use the **Autonomous Briefing** button in the Matter Intelligence view.
*   **Behavior:** Gemini 3 Pro synthesizes all vault documents into a 2-page strategic summary.
*   **Outputs:** Risk heatmaps, critical clause anomalies, and key deadlines.

### 3.4 DAS Scrubbing Proxy
The **Data Access Service (DAS)** automatically redacts PII (Names, Dates) in memory before the AI "sees" the text.

### 3.5 Counsel-in-the-Loop (CITL)
If an AI response triggers a safety guardrail (Regulatory Rules Engine), it is routed to the **Review Hub**. 
*   **Senior Partners** can view the AI's internal "thinking trace."
*   **Ethical Override:** If the output is deemed safe, a Partner can provide a hardware-signed override to release the information.

---

## 4. ZK Conflict Searching
Before opening a matter, use the **ZK Conflict Search** tool:
1.  **Local Hashing:** The name you search for is hashed on your device using SHA-256.
2.  **Blind Collision Check:** The platform compares your hash against the global encrypted index.
3.  **Zero-Leakage:** If no match is found, the system confirms it is "Clean" without anyone ever knowing who you were searching for.

---

## 5. Public Bot Studio (Lead Gen)
Configure a public-facing chatbot for your website:
*   **Training:** Select documents from your **Knowledge Base**.
*   **Guardrails:** The **UPL-Interceptor** ensures the bot never gives legal advice, only facilitates client onboarding.

---

## 6. Cross-Silo Collaboration (Matter Tunnels)
If you need to share a document with an external party (e.g., an Enterprise client sharing with their Law Firm):
1.  Navigate to the **Bridge Registry**.
2.  Initiate a **Matter Tunnel**.
3.  The recipient receives a scoped, HSM-signed session token. They can view the document within your silo boundary—the data **never** moves to their server.

---

## 7. Anonymized Precedent Discovery
Find similar structural logic from historical work product without violating past client confidentiality.
*   Search for "Indemnity structures for Fintech."
*   The AI retrieves the *structure* and *clauses* from previous matters, but strictly redacts all client-specific data.

---

## 8. Billing & Compliance
*   **Time Tracker:** Record billable hours with AI-optimized narratives that comply with **Outside Counsel Guidelines (OCG)**.
*   **Decision Traces:** View the immutable cryptographic hash of every AI decision in the **Forensic Ledger**.
