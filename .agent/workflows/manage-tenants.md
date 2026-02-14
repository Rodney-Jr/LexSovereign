---
description: How to manage tenant lifecycles (Suspend, Deactivate, Delete)
---

# Workflow: Managing Tenant Lifecycles

This workflow governs how Global Admins manage tenant organizations on the LexSovereign platform, specifically addressing non-payment of fees and decommissioning.

## 1. Suspending a Tenant for Non-Payment

If a tenant fails to pay their sovereign upkeep fees, the Global Admin must suspend the enclave to prevent further resource consumption while preserving data.

1.  Navigate to the **Global Governance Console**.
2.  Locate the tenant in the **Multi-Tenant Portfolio**.
3.  Click the **Pause (Suspend)** button.
4.  Confirm the action in the prompt.
5.  **Effect**:
    *   Tenant status is set to `SUSPENDED`.
    *   All users associated with this tenant will be blocked at the gateway with a "Tenant enclave suspended" message.
    *   AI inference and document processing are halted for this enclave.

## 2. Reactivating a Suspended Tenant

Once payment is confirmed, access can be restored instantly.

1.  Locate the suspended tenant (marked with a yellow "SUSPENDED" badge).
2.  Click the **Play (Activate)** button.
3.  Confirm the restoration.
4.  **Effect**: Tenant status returns to `ACTIVE`, and users can log in immediately.

## 3. Decommissioning a Tenant (Deletion)

When a tenant contract is terminated, the enclave must be decommissioned.

1.  Locate the tenant in the Governance Console.
2.  Click the **Trash (Decommission)** button.
3.  **Security Note**: This performs a "Soft Decommission" by marking the tenant as `DELETED`.
4.  **Effect**: 
    *   Tenant appears as `DELETED` in the portfolio.
    *   Global Admins can no longer "Activate" the tenant from the UI.
    *   All user access is permanently revoked.

## 4. Managing Tenant Admin Accounts

If a tenant admin loses access or a change in leadership occurs:

1.  Open the **Global Control Plane**.
2.  (Future) Use the **Admin Reset** tool to dispatch a force-password reset or update the primary administrator email.
3.  For immediate lockout of a specific user, use the `TenantAdministration.tsx` interface (if impersonating) or the database directly to set `isActive: false`.
