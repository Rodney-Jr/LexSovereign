# NomosDesk RBAC Access Matrix

This document provides a comprehensive review of the Role-Based Access Control (RBAC) mapping within the LexSovereign platform. It defines which roles have authority over specific silo modules, navigation tabs, and functional modals.

---

## 📊 Quick-Reference Table

| Role Cluster | Key Tabs / Modals | Scope |
| :--- | :--- | :--- |
| **Global Admin** | Platform Ops, Enclave Management, Provision Tenant | Platform-wide |
| **Tenant Admin** | Access Governance, Org Blueprint, User Onboarding | Silo-wide |
| **Legal Partner** | Case Center, CLM Center, Matter Inception | Matter-wide |
| **Legal Counsel** | Drafting Studio, Document Vault, Conflict Search | Work-product |
| **Client** | Sovereign Client Portal, Legal Ledger | External |

---

## 🏛️ Platform Governance (Global Scope)
These roles operate at the infrastructure and platform-wide level, managing the "Super Silo".

### **GLOBAL_ADMIN**
*Highest authority within the Global Control Plane.*
- **System Tabs**:
    - `Platform Ops` (/platform-ops)
    - `Global Governance` (/global-governance)
    - `Infrastructure Enclave` (/enclave)
    - `Engineering Backlog` (/backlog)
    - `Pricing Governance` (/pricing-calib)
- **Modals & Actions**:
    - **Provision New Silo**: Primary enclave deployment.
    - **Provision Platform Admin**: Delegate platform authority.
    - **Tenant Management**: Suspend, Activate, or Decommission tenants.
- **Core Permissions**: `MANAGE:PLATFORM`, `VIEW_STATS:TENANT`.

---

## 🏢 Silo Administration (Tenant Scope)
These roles manage the operations, users, and configuration of a specific sovereign tenant.

### **TENANT_ADMIN**
*Authority over his/her own sovereign enclave.*
- **System Tabs**:
    - `Tenant Admin` (/tenant-admin)
    - `Access Governance` (/identity)
    - `Org Blueprint` (/org-blueprint)
    - `Integration Bridge` (/integration-bridge)
    - `Analytics` (/analytics)
- **Modals & Actions**:
    - **User Onboarding**: Provision silo-specific users.
    - **MFA Setup**: Enforce hardware/biometric security.
    - **Role Manager**: Adjust silo-local permissions.
- **Core Permissions**: `MANAGE:USER`, `MANAGE:ROLE`, `MANAGE:TENANT_SETTINGS`.

### **LEGAL_OPS**
*Manages the efficiency and workflows of the firm/department.*
- **System Tabs**:
    - `Workflow Engine` (/workflow)
    - `Capacity Dashboard` (/capacity)
    - `Audit Logs` (/audit)
- **Core Permissions**: `MANAGE:WORKFLOW`, `VIEW_STATS:TENANT`.

---

## ⚖️ Legal Professional (Matter Scope)
These roles are the primary producers of legal work-product within a silo.

### **MANAGING_PARTNER / PARTNER**
- **System Tabs**:
    - `Case Center` (/case-center)
    - `CLM Center` (/clm-center)
    - `Accounting Hub` (/accounting-hub)
    - `Growth Dashboard` (/growth)
- **Modals & Actions**:
    - **Matter Inception**: Deploy a new legal matter instance.
    - **Spend Approval**: Authorize financial disbursements.
- **Core Permissions**: `CREATE:MATTER`, `ACCESS:ACCOUNTING`, `VIEW_BILLING:TENANT`.

### **COUNSEL / ASSOCIATE**
*(Includes Senior Counsel, Internal Counsel, Junior Associate)*
- **System Tabs**:
    - `Document Vault` (/vault)
    - `Drafting Studio` (/drafting)
    - `Conflict Search` (/conflict-check)
    - `Sovereign Chat` (/chat)
- **Modals & Actions**:
    - **Quick Draft**: Rapid artifact creation.
    - **Conflict Resolution**: Finalize collision checks.
- **Core Permissions**: `VIEW:MATTER`, `CREATE:DRAFT`, `CHECK:CONFLICTS`.

---

## 👥 Support & Audit
Specialized roles for specific business functions.

### **FINANCE_BILLING**
- **System Tabs**: `Billing` (/billing).
- **Permissions**: `VIEW_BILLING:TENANT`.

### **HR_MANAGER**
- **System Tabs**: `HR Workbench` (/hr-workbench).
- **Modals**: `Staff Dossier Viewer`.
- **Permissions**: `ACCESS:HR`.

### **AUDITOR**
- **System Tabs**: `Audit Logs` (/audit).
- **Permissions**: `VIEW_STATS:TENANT`, `VIEW:MATTER`.

---

## 🛡️ Client & External
Roles providing external interaction with the silo.

### **CLIENT**
- **System Tabs**: `Client Portal` (/client-portal).
- **Actions**: View shared legal ledger, download approved artifacts.
- **Permissions**: `ACCESS:CLIENT_PORTAL`.

### **EXTERNAL_COUNSEL**
- **Access**: Restricted view of specific matters only; no administrative visibility.
- **Permissions**: `VIEW:MATTER`, `UPLOAD:DOCUMENT`.

---

> [!NOTE]
> This access matrix is enforced by the `ProtectedRoute` component on the frontend and the `requirePermission` middleware on the backend. Any attempt to access a modal or tab without the required `permissionId` recorded in the database will result in an immediate `403 Forbidden` response.
