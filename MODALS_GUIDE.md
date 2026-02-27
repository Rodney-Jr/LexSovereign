# NomosDesk Modals Guide

This document provides a comprehensive overview of all modals in the NomosDesk platform, their purpose, usage patterns, and implementation details.

---

## Table of Contents
1. [Tenant & User Management Modals](#tenant--user-management-modals)
2. [Document & Template Modals](#document--template-modals)
3. [Matter Management Modals](#matter-management-modals)
4. [Access Control Modals](#access-control-modals)
5. [Modal Design Patterns](#modal-design-patterns)

---

## Tenant & User Management Modals

### 1. Provision Tenant Modal
**Component:** `ProvisionTenantModal.tsx`

**Purpose:** Allows Global Admins to create new tenant organizations on the platform.

**Used In:**
- `GlobalControlPlane.tsx` - Global Admin workspace
- `TenantGovernance.tsx` - Tenant management interface

**Key Features:**
- Multi-step tenant provisioning workflow
- Tenant configuration (name, domain, branding)
- Initial admin user setup
- Pricing tier selection

**Trigger:**
```tsx
<button onClick={() => setShowProvisionModal(true)}>
  Provision New Tenant
</button>
```

**Importance:** **CRITICAL** - Core functionality for platform growth and multi-tenancy.

---

### 2. User Invite Modal
**Component:** Inline modal in `TenantAdministration.tsx`

**Purpose:** Enables Tenant Admins to invite new users to their organization.

**Key Features:**
- **Internal Member / External Client toggle** - Contextualizes the invite for different user types
- Role selection (TENANT_ADMIN, PARTNER, LEGAL_OPS, etc.)
- Email invitation or shareable link generation
- Automatic role assignment based on user type

**Trigger:**
```tsx
<button onClick={() => setShowInviteModal(true)}>
  Invite User
</button>
```

**Importance:** **HIGH** - Essential for tenant user management and onboarding.

**Recent Updates:**
- Added client/practitioner context switching
- Simplified UI for external clients
- Improved link generation and email delivery

---

## Document & Template Modals

### 3. Document Template Marketplace
**Component:** `DocumentTemplateMarketplace.tsx`

**Purpose:** Provides access to pre-built legal document templates (NDAs, Service Agreements, etc.).

**Used In:**
- `LegalDrafting.tsx` - Document drafting workspace
- `DocumentVault.tsx` - Document management
- `SovereignMarketplace.tsx` - Template browsing

**Key Features:**
- Template browsing and search
- Template preview
- Category filtering (Contracts, Agreements, Litigation)
- Template selection and instantiation
- Locked vs. customizable clause indicators

**Trigger:**
```tsx
<button onClick={() => setShowMarketplace(true)}>
  Browse Templates
</button>
```

**Props:**
```tsx
interface DocumentTemplateMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: DocumentTemplate) => void;
}
```

**Importance:** **HIGH** - Accelerates document creation and ensures legal compliance.

---

### 4. Document Ingest Modal
**Component:** `DocumentIngestModal.tsx`

**Purpose:** Handles document upload and metadata capture for the Document Vault.

**Used In:**
- `DocumentVault.tsx` - Document repository

**Key Features:**
- File upload (drag & drop or file picker)
- Metadata extraction and manual entry
- Document classification
- Matter association
- PII detection warnings

**Trigger:**
```tsx
<button onClick={() => setShowIngestModal(true)}>
  Upload Document
</button>
```

**Props:**
```tsx
interface DocumentIngestModalProps {
  onClose: () => void;
  onIngest: (doc: UploadedDocument) => void;
}
```

**Importance:** **MEDIUM** - Streamlines document management workflow.

---

## Matter Management Modals

### 5. Matter Creation Modal
**Component:** `MatterCreationModal.tsx`

**Purpose:** Comprehensive modal for creating new legal matters with conflict checking.

**Used In:**
- `App.tsx` - Global matter creation trigger
- Various matter-related components

**Key Features:**
- **Multi-step workflow:**
  1. Basic matter information (name, client, type)
  2. Conflict check (client name, opposing party)
  3. Matter configuration (billing, team assignment)
- Real-time conflict detection
- Automatic matter ID generation
- Team member assignment

**Trigger:**
```tsx
<button onClick={() => setShowMatterModal(true)}>
  Create New Matter
</button>
```

**Props:**
```tsx
interface MatterCreationModalProps {
  mode: 'global' | 'tenant';
  userId: string;
  tenantId: string;
  onClose: () => void;
  onCreated: (matter: Matter) => void;
}
```

**Importance:** **CRITICAL** - Core workflow for case management and conflict prevention.

**Workflow:**
1. User enters matter details
2. System performs conflict check against existing matters
3. If no conflicts, matter is created
4. User is redirected to matter workspace

---

## Access Control Modals

### 6. Role Template Marketplace
**Component:** `RoleTemplateMarketplace.tsx`

**Purpose:** Provides pre-configured role templates for quick role creation.

**Used In:**
- `AccessGovernance.tsx` - Role management
- `SovereignMarketplace.tsx` - Template browsing

**Key Features:**
- Pre-built role templates (Partner, Associate, Legal Ops, etc.)
- Permission set preview
- One-click role instantiation
- Template customization before applying

**Trigger:**
```tsx
<button onClick={() => setShowMarketplace(true)}>
  Browse Role Templates
</button>
```

**Props:**
```tsx
interface RoleTemplateMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySuccess: () => void;
}
```

**Importance:** **MEDIUM** - Simplifies role management and ensures consistent permissions.

---

### 7. Create Role Modal
**Component:** Inline modal in `AccessGovernance.tsx`

**Purpose:** Allows admins to create custom roles with specific permissions.

**Key Features:**
- Role name and description
- Permission selection (checkboxes for each permission)
- Real-time permission preview
- Role hierarchy visualization

**Trigger:**
```tsx
<button onClick={() => setShowCreateModal(true)}>
  Create Custom Role
</button>
```

**Importance:** **MEDIUM** - Enables fine-grained access control customization.

---

## Modal Design Patterns

### Common Implementation Pattern

All modals in NomosDesk follow a consistent design pattern:

```tsx
// 1. State Management
const [showModal, setShowModal] = useState(false);

// 2. Keyboard Handling (ESC to close)
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showModal) {
      setShowModal(false);
    }
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [showModal]);

// 3. Conditional Rendering
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
    <div className="bg-slate-900 rounded-3xl p-8 max-w-4xl w-full">
      {/* Modal Content */}
      <button onClick={() => setShowModal(false)}>Close</button>
    </div>
  </div>
)}
```

### Design Principles

1. **Backdrop Overlay:** All modals use a semi-transparent black backdrop (`bg-black/80`)
2. **Centered Layout:** Modals are centered using flexbox
3. **ESC Key Support:** All modals can be closed with the ESC key
4. **Click Outside:** Some modals support closing by clicking the backdrop
5. **Z-Index:** Modals use `z-50` to ensure they appear above all other content
6. **Glassmorphism:** Modern glass-effect styling with blur and transparency
7. **Responsive:** All modals are mobile-responsive with appropriate max-widths

### Styling Conventions

```tsx
// Standard Modal Container
className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"

// Standard Modal Content
className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl w-full shadow-2xl animate-in slide-in-from-bottom-4"

// Close Button
className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
```

---

## Modal State Management

### Local State (Most Common)
```tsx
const [showModal, setShowModal] = useState(false);
```

### Props-Based (Reusable Components)
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  // ...
}
```

---

## Accessibility Considerations

1. **Focus Management:** Modals should trap focus within the modal when open
2. **ARIA Labels:** All interactive elements have proper `aria-label` or `title` attributes
3. **Keyboard Navigation:** Full keyboard support (Tab, ESC, Enter)
4. **Screen Reader Support:** Proper semantic HTML and ARIA roles

---

## Future Enhancements

### Planned Modal Additions
- **Billing Configuration Modal** - For tenant billing setup
- **Template Editor Modal** - For creating custom document templates
- **Audit Log Viewer Modal** - For detailed audit trail inspection
- **Workflow Designer Modal** - For custom approval workflows

### Planned Improvements
- **Modal Stacking** - Support for multiple modals open simultaneously
- **Animation Library** - Consistent animation framework (Framer Motion)
- **Modal Service** - Centralized modal management service
- **Confirmation Dialogs** - Standardized confirmation modal component

---

## Best Practices

1. **Always provide a close mechanism** - X button, ESC key, and optionally backdrop click
2. **Use semantic HTML** - Proper heading hierarchy and form elements
3. **Validate user input** - Client-side validation before submission
4. **Show loading states** - Indicate when async operations are in progress
5. **Handle errors gracefully** - Display clear error messages
6. **Preserve form state** - Don't lose user input on accidental close
7. **Mobile-first design** - Ensure modals work well on small screens

---

## Troubleshooting

### Modal Not Closing
- Check if `showModal` state is being properly updated
- Verify ESC key handler is attached
- Ensure `onClose` callback is defined

### Modal Content Overflow
- Use `max-h-[80vh] overflow-y-auto` for scrollable content
- Ensure proper padding and margins

### Z-Index Issues
- Modals should use `z-50` or higher
- Check for conflicting z-index values in parent components

---

**Last Updated:** 2026-02-12  
**Maintained By:** NomosDesk Engineering Team
