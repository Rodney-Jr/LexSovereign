# Role-to-Menu Mapping Matrix

This document defines the visibility of navigation tabs and dashboard menu items based on the system's hardcoded **Permission Gating** and **Role Blueprints**.

---

## 🏛️ Platform Governance (Global Scope)
| Role | Visible Menu Items |
| :--- | :--- |
| **GLOBAL_ADMIN** | Dashboard, Platform Ops, Global Governance, Enclave Management, Pricing Calibration, Engineering Backlog, Sovereign Chat, Document Vault, Drafting Studio. |

---

## 🏘️ Silo Administration (Tenant Scope)
| Role | Visible Menu Items |
| :--- | :--- |
| **TENANT_ADMIN** | Dashboard, Tenant Settings, Access Governance, Org Blueprint, Integration Bridge, Analytics, HR Workbench, Accounting Hub, Status Roadmap. |
| **OWNER** | Dashboard, Tenant Settings, Access Governance, Accounting Hub, HR Workbench, Drafting Studio, Sovereign Chat, Budget Manager. |
| **ADMIN_MANAGER**| Dashboard, Access Governance, HR Workbench, Accounting Hub, Expense Tracker, Billing, Conflict Search. |
| **LEGAL_OPS** | Dashboard, Workflow Engine, Capacity Planning, Analytics, Billing, Case Center, CLM Center, Conflict Search. |

---

## ⚖️ Legal Professional (Silo Operations)
| Role | Visible Menu Items |
| :--- | :--- |
| **MANAGING_PARTNER**| Dashboard, Case Center, CLM Center, Accounting Hub, HR Workbench, Client Directory, Analytics, Workflow Engine, Drafting Studio, Document Vault. |
| **PARTNER** | Dashboard, Case Center, CLM Center, Conflict Search, Document Vault, Drafting Studio, Analytics, Billing, User Management. |
| **SENIOR_COUNSEL** | Dashboard, Document Vault, Drafting Studio, Conflict Search, Case Center, CLM Center, Billing, Sovereign Chat. |
| **INTERNAL_COUNSEL** | Dashboard, Document Vault, Drafting Studio, Conflict Search, Client Directory, Sovereign Chat. |
| **JUNIOR_ASSOCIATE** | Dashboard, Document Vault, Drafting Studio, Conflict Search, Sovereign Chat. |

---

## 👥 Specialized Business Functions
| Role | Visible Menu Items |
| :--- | :--- |
| **FINANCE_BILLING** | Dashboard, Billing, Accounting Hub, Expense Tracker. |
| **COMPLIANCE** | Dashboard, Tenant Settings, Analytics, Sovereign Chat, Audit Logs. |
| **EXECUTIVE_BOARD** | Dashboard, Analytics, Billing, Sovereign Chat. |

---

## 🤝 Support & External
| Role | Visible Menu Items |
| :--- | :--- |
| **CLIENT** | Sovereign Client Portal, Document Vault (Shared), Case Status. |
| **PARALEGAL** | Dashboard, Document Vault, Drafting Studio, Sovereign Chat. |
| **AUDITOR** | Dashboard, Audit Logs, Analytics, Document Vault (Read-only). |
| **CLERK** | Dashboard, Field Intake, Document Vault, Sovereign Chat. |

---

## ⚙️ Technical Gating Mechanism

Visibility is controlled by the `TAB_REQUIRED_PERMISSIONS` constant in [`constants.ts`](file:///c:/Users/LENOVO/Desktop/LexSovereign/constants.ts). 

> [!IMPORTANT]
> **Zero-Trust Enforcement**: Even if a menu item is made visible via the UI, the backend will reject any unauthorized API requests for that module with a `403 Forbidden` status if the user's JWT does not contain the required `permissionId`.

**See Also**:
- [ROLES_AND_ACCESS.md](file:///c:/Users/LENOVO/Desktop/LexSovereign/docs/ROLES_AND_ACCESS.md) for granular permission descriptions.
