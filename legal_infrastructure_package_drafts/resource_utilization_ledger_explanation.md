# Resource Utilization Ledger

The **Resource Utilization Ledger** (implemented in `SovereignBilling.tsx`) is a high-fidelity monitoring system designed to track the "Three Pillars of Sovereign Consumption." It translates complex infrastructure telemetry into clear, billable metrics for the tenant.

## 1. The Three Primary Meters
*   **AI Credits (Inference)**: This tracks the "computational brainpower" consumed by the Silo. Every time the AI generates a contract, summarizes a brief, or performs a KYC check, it consumes credits based on the model used (e.g., Gemini Pro vs. Flash).
*   **Vault Storage (Pinned)**: Tracks the physical data footprint of legal artifacts. Because LexSovereign uses "Route-Based Sovereignty," this storage is physically pinned to the chosen regional silo (e.g., Lagos, London) and tracked against the residency limit.
*   **Active Team Slots**: Manages per-seat licenses. It reflects the number of "Active Guardrails" or users currently provisioned within the logical enclave.

## 2. Predictive Analytics & Burn Rate
*   **Active Burn Rate**: Calculates hourly credit consumption in real-time. 
*   **Matter Velocity Projection**: The ledger includes a **Predictive Quota Alert**. It analyzes "Matter Velocity" (the rate of case creation) to warn precisamente when credits will be exhausted, preventing service "Kill-Switch" events.

## 3. Cryptographic Billing Trace
Below the meters is the **Cryptographic Billing Trace**. This is an **immutable ledger** (FIPS 140-2 compliant) that tracks "Resource Deltas."
*   Every time a user is added or storage is scaled, a cryptographic hash is generated.
*   This ensures that billing is 100% auditable and tied to the physical resource allocation in the backend.

## 4. Direct Action (Allocation)
The **"Allocate Credits"** button allows the tenant to expand Silo capacity on-demand. While the ledger monitors the *past and present*, the Allocation system (integrated with Stripe) handles the expansion of infrastructure resources.

---
*Note: This ledger is the "Flight Instrument Panel" for legal infrastructure, ensuring operational continuity while maintaining strict data sovereignty compliance.*
