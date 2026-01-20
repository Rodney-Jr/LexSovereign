# LexSovereign Administrator Guide

## 1. Role Management
LexSovereign uses a **Role-Based Access Control (RBAC)** system enhanced with **Attribute-Based Access Control (ABAC)** policies.

### Creating Custom Roles
Tenant Administrators can create custom roles via the Settings UI or API.
- **Endpoint**: `POST /api/roles`
- **Body**: `{ "name": "Junior Associate", "permissions": ["matter_view", "doc_draft"] }`

### System Roles (Immutable)
- `GLOBAL_ADMIN`: Platform owner. Full access to all tenants (if configured).
- `TENANT_ADMIN`: General Counsel. Full access to their specific Tenant.
- `INTERNAL_COUNSEL`: Standard user.

## 2. Policy Configuration (ABAC)
Policies provide fine-grained control beyond simple permissions.

### Policy Structure
A Policy consists of:
- **Resource**: The object being accessed (e.g., `MATTER`, `AI_MODEL`).
- **Action**: What the user is trying to do (e.g., `UPDATE_HIGH_RISK`, `EXECUTE`).
- **Condition**: A JavaScript boolean expression evaluating `user`, `resource`, and `env`.
- **Effect**: `ALLOW` or `DENY`.

### Example Policies

#### Block High Risk Modifications
```json
{
  "name": "Block High Risk",
  "resource": "MATTER",
  "action": "UPDATE_HIGH_RISK",
  "condition": "resource.riskLevel === 'HIGH'",
  "effect": "DENY"
}
```

#### Allow Compliance Access
```json
{
  "name": "Audit Access",
  "resource": "AUDIT_LOG",
  "action": "VIEW",
  "condition": "user.attributes.department === 'Compliance'",
  "effect": "ALLOW"
}
```

## 3. OIDC / SSO Integration
To enable Single Sign-On:
1. Configure `OIDC_PROVIDER` in environment variables.
2. Users logging in via OIDC are automatically provisioned (JIT).
3. **Group Mapping**:
   - `General_Counsel` group -> `TENANT_ADMIN` role.
   - `Legal_Counsel` group -> `INTERNAL_COUNSEL` role.

## 4. Deployment Modes
- **SaaS Mode**: Multi-tenant. `tenantId` is enforced from the User Token.
- **On-Premise (Enclave)**: Single-tenant. `tenantId` is hardcoded to `sovereign-enclave-001` in `config.ts`.
