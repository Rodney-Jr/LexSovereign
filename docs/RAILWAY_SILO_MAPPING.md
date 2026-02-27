# NomosDesk Silo-Datacenter Integrity Mapping

This document details the precise alignment of NomosDesk's **Sovereign Silos** with Railway's **High-Performance Regional Datacenters**. This mapping is the foundation of our **Legal Data Residency Guarantee**.

---

## 1. The Silo-Datacenter Relationship: Strategic Placement

NomosDesk does not simply "host" data; we **pin** jurisdictional logic to physical hardware optimized for legal latency and statutory compliance.

### NomosDesk: Jurisdictional Silo to Railway Region Mapping

| NomosDesk Silo | Jurisdictional Target | Railway Region ID | Placement Logic | Infrastructure Tier |
| :--- | :--- | :--- | :--- | :--- |
| **ACCRA-SILO-1** | Ghana (Act 1019) | `europe-west4-drams3a` | Optimized SAT-3/WACS Peering | **Sovereign Metal** |
| **LAGOS-SILO-1** | Nigeria (NDPR/NDPB) | `europe-west4-drams3a` | Direct Submarine Linkage | **Sovereign Metal** |
| **USA-EAS-1** | USA (Federal/SEC) | `us-east4-eqdc4a` | Proximity to DC Corridors | **Sovereign Metal** |
| **USA-WST-1** | USA (California/CCPA) | `us-west2` | Silicon Valley Low-Latency | **Sovereign Metal** |
| **APAC-SING-1** | SE Asia / Singapore | `ap-southeast-1` | Global Financial Hub | Multi-Region Cluster |
| **LATAM-SAO-1** | Brazil / South America | `sa-east-1` | Regional Privacy Gateway | Multi-Region Cluster |

---

## 2. Selling the "Sovereign Metal" Advantage

For our **Enterprise** and **Enclave Exclusive** clients, the relationship between your Silo and the Datacenter is **exclusive and physically isolated**.

### Why "Metal" Matters:
- **Zero-Noisy-Neighbors**: On Railway Metal regions (Virginia, Amsterdam, California), your jurisdictional silo runs on dedicated hardware. This eliminates the risk of "side-channel attacks" present in standard virtualized environments.
- **Physical Sovereignty Handshake**: Every packet exiting the "Accra Silo" in Amsterdam is cryptographically tagged. Even though it is physically in the EU, it is **logically and legally bound** to the Ghanaian jurisdiction via our local HSM-signed egress.
- **Compute Gravity**: By placing the "Lagos Silo" in Amsterdam's Metal cluster, we provide the **Lagos legal market** with sub-100ms inference speeds that local on-premise solutions cannot match, without sacrificing data integrity.

---

## 3. The Sovereign Guarantee: Transparency & Auditability

We provide **Physical Transparency**. You can verify the exact location and health of your silo-hosting datacenter at any time.

1.  **Hardware-Level Heartbeat**: Admins can view real-time CPU/GPU load on the dedicated metal nodes in the `CapacityDashboard`.
2.  **Geographic Pinning Verification**: The `Silo Metadata` section of the platform provides a cryptographically signed receipt from the datacenter provider, proving your data is residing exactly where promised.
3.  **Jurisdictional Firewalls**: Our egress sanitization rules (DAS Proxy) are physically configured at the datacenter boundary to prevent any un-scrubbed data from leaking outside the regional silo.

---

## 4. Operational Integrity

When a tenant is provisioned on the **Sovereign Plan**, their data is not just "stored" in a region; a **Sovereign Virtual Private Cloud (sVPC)** is carved out specifically for that organization. This sVPC is physically mapped to the corresponding Railway region, ensuring that "Data at Rest" and "Data in Flight" never cross forbidden jurisdictional lines.

---
**Last Updated:** 2026-02-25  
**Authored By:** NomosDesk Infrastructure & Compliance Team
