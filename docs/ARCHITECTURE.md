# System Architecture

## Overview
NomosDesk is a Legal Operations Platform designed for **Data Sovereignty** and **AI Governance**. It employs a Hexagonal Architecture (Ports & Adapters) to isolate core logic from external providers.

## Core Components

### 1. Verification & Security Layer
- **RBAC Middleware**: `verifyRole` checks static permissions.
- **Policy Engine**: `PolicyEngine.evaluate` enforces dynamic ABAC rules.
- **AI Guard**: Intercepts AI requests (`/api/chat`) to enforce "Human-in-the-Loop" for low-confidence or high-stakes actions.

### 2. Identity & Access
- **OIDC Service**: Handles Federated Identity (Azure AD, Okta).
- **Audit Service**: Logs all sensitive actions with tamper-evident hashing.

### 3. Integration Adapters
- **Storage Port**: Abstracts file storage (Blob vs Local NAS).
- **Identity Port**: Abstracts Auth providers.

## Data Flow: "High Risk Matter Update"

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Middleware
    participant PolicyEngine
    participant DB

    User->>API: PUT /matters/:id (Risk=HIGH)
    API->>Middleware: authenticateToken()
    Middleware->>API: User Context
    API->>PolicyEngine: evaluate(user, matter, 'UPDATE_HIGH_RISK')
    PolicyEngine->>DB: Fetch User Policies
    PolicyEngine->>PolicyEngine: Eval(condition)
    alt Denied
        PolicyEngine-->>API: { allowed: false }
        API-->>User: 403 Forbidden
    else Allowed
        PolicyEngine-->>API: { allowed: true }
        API->>DB: Update Matter
        API-->>User: 200 OK
    end
```
