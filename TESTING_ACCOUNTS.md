# Sovereign Legal Studio: Canonical Testing Accounts

This document contains the pre-provisioned demo accounts for the LexSovereign ecosystem. These accounts are used for validating jurisdictional compliance, industrial-grade drafting, and multi-tenant orchestration.

---

## 🏛️ **Standard Firm Environment** (NomosDesk Demo)
**Primary Password:** `password123`

| Role | Email Address | Jurisdictional Permissions |
| :--- | :--- | :--- |
| **Super Admin** | `admin@nomosdesk.com` | GLOBAL_ADMIN (Full UI/UX, Billing, Enclave Mgmt) |
| **Internal Counsel** | `counsel@nomosdesk.com` | INTERNAL_COUNSEL (Legal Logic, Drafting, Matter Mgmt) |
| **Firm Admin Mgr** | `admin_manager@nomosdesk.com`| ADMIN_MANAGER (Executive Ops, Personnel, Reporting) |
| **Firm Clerk** | `clerk@nomosdesk.com` | CLERK (Filing, Indexing, Basic Studio Access) |

---

## ⚖️ **Sovereign Legal Partners** (Sales Demo - Law Firm Mode)
**Primary Password:** `NomosDemo2026!`

| Role | Email Address | Jurisdictional Permissions |
| :--- | :--- | :--- |
| **Managing Partner**| `mpartner@sovlegal.com` | MANAGING_PARTNER (Strategic Oversight, Firm P&L) |
| **Associate** | `associate@sovlegal.com` | JUNIOR_ASSOCIATE (Drafting, Research, Time Entry) |

---

## 🌐 **Global Tech Legal** (Sales Demo - Enterprise Mode)
**Primary Password:** `NomosDemo2026!`

| Role | Email Address | Jurisdictional Permissions |
| :--- | :--- | :--- |
| **General Counsel**| `gc@globaltech.com` | MANAGING_PARTNER (Institutional In-house Lead) |
| **Legal Ops** | `ops@globaltech.com` | ADMIN_MANAGER (Platform Ops, Vendor Compliance) |

---

## 💳 **Financial & Billing Simulation**
For testing the **Sovereign Accounting** or **Billing** modules, use the following Stripe Test Instrument:

*   **Test Card Number**: `4242 4242 4242 4242`
*   **Expiry**: `12/28`
*   **CVC**: `123`
*   **Zip Code**: `10001` (or any valid)

---

> [!IMPORTANT]
> To reset these accounts to their canonical state, run:
> `npx ts-node server/src/scripts/seed.ts && npx ts-node server/src/scripts/salesDemoSeed.ts`
