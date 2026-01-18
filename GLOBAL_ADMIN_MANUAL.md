# LexSovereign: Global Admin Protocol (Silo Root Shell)

Welcome, Lead Architect. This manual governs the administration of the **LexSovereign Infrastructure Plane**. As a Global Admin, your role is decoupled from tenant legal data; you manage the "pipes and enclaves" that ensure document sovereignty.

---

## 1. Accessing the Root Shell
The **Platform Gateway** is hidden from standard users to prevent brute-force discovery.
1. Navigate to the primary **Identity Gateway**.
2. Click the **"LexSovereign"** brand logo **5 times** in rapid succession.
3. The interface will shift into the **Silo Root Shell** (Matrix-black theme).
4. Perform the **Hardware Root Handshake** using your assigned FIPS 140-2 Level 3 device.

---

## 2. Infrastructure Management

### 2.1 Regional Silo Topography
Monitor the health and latency of logical partitions globally:
*   **West Africa (GH-ACC-1):** Primary cluster for Ghana-pinned data.
*   **EU Central (DE-FRA-1):** GDPR-exclusive partition.
*   **APAC / US:** Standard regional enclaves.

### 2.2 Global Model Registry & Tools
Manage the LLM backend and utility tools for the entire platform:
*   **Gemini 3 Pro:** Default for high-complexity legal reasoning.
*   **Gemini 3 Flash:** Powering the **Public Bot Studio** and standard summarization.
*   **Google Search Grounding:** Global Admins toggle this tool. When enabled, it allows the LLM to access real-time statutory updates while the DAS Proxy scrubs outbound queries for PII.
*   **Llama-3 (Local):** Managed via the **Air-Gap Command Center** for Phase 4 physical enclaves.

---

## 3. Security Constraints & Compliance

### 3.1 Zero-Knowledge Guarantee
The Platform Owner plane is architecturally "blinded" to legal artifacts:
*   **Metadata-Only Visibility:** You can see storage volumes and token counts but *never* raw document text.
*   **ZK-Rollups:** Tenant metrics are aggregated via zero-knowledge proofs to maintain department privacy.

### 3.2 Global Kill-Switch
In the event of a compromised Corporate Identity Provider (IdP), the **Security Command** center allows for a platform-wide lock, disabling all non-local inference enclaves instantly.

---

## 4. Federated Infrastructure (Advanced)

### 4.1 ZK-Conflict Index Maintenance
Global Admins manage the **Encrypted Collision Index**. This index contains only SHA-256 hashes of party names. You are responsible for ensuring that indices from different regional silos (e.g., GH and DE) are synchronized without the underlying names ever leaving their home region.

### 4.2 Bridge Registry & Tunnels
Manage the **Bridge Registry** to facilitate "Matter Tunnels." As a Global Admin, you monitor the health of these E2EE tunnels but cannot inspect the data flowing through them. Multi-sig approval is required to provision a new cross-tenant bridge.

### 4.3 Anonymized Precedent Indexing
Configure the **Vector Silo** for cross-tenant semantic search. Global Admins ensure that only *structural embeddings* are shared between silos, mathematically preventing the leakage of PII into the shared knowledge pool.

---

## 5. Operational Support
*   **Telemetry Monitor:** Real-time tracking of DAS Proxy handshake velocity.
*   **Multi-Sig Authority:** Critical actions (like Master Key rotation) require **2/3 M-of-N hardware signatures**.
*   **Audit Pulse:** Monitor the global ledger for security anomalies or regional egress attempts.
