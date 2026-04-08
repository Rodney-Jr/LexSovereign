# Marketing Content Alignment Plan

This plan focuses on updating the marketing website to reflect the latest "Zero-Gap" legal intelligence features and the new frictionless trial onboarding system.

## User Review Required

> [!IMPORTANT]
> **CTAs**: I will change "Schedule Demo" to "Start 30-Day Free Trial" across the site to drive self-signup conversions.
>
> **Product Naming**: I will standardize on "Global Clause Library" for the admin-curated text feature.

## Proposed Changes

### HomePage Refresh

#### [MODIFY] [HomePage.tsx](file:///c:/Users/LENOVO/Desktop/LexSovereign/marketing/src/pages/HomePage.tsx)
- **Hero Section**:
    - Update primary CTA to "Start 30-Day Free Trial".
    - Add a "No Credit Card Required" subtext.
- **Pillars Section**:
    - Update "Clause Foundry" to "Global Clause Library".
    - Add detail about "Regional Scoping" (e.g., GH_ACC_1 specific provisions).
- **Intelligence Panel**:
    - Add a bullet for "Legacy Document Ingestion" highlighting the .docx import/pagination capability.

### Pricing & Onboarding

#### [MODIFY] [PricingPage.tsx](file:///c:/Users/LENOVO/Desktop/LexSovereign/marketing/src/pages/PricingPage.tsx)
- **Header**: Add a banner: "Experience Sovereign Intelligence. Free 30-Day Trial on all plans."
- **Cards**:
    - Add "30-Day Trial Included" to every tier.
    - Update CTAs to "Launch My Enclave".
- **FAQ**: Update to include trial-related questions.

### Industry Focus Updates

#### [MODIFY] [ForLawFirms.tsx](file:///c:/Users/LENOVO/Desktop/LexSovereign/marketing/src/pages/ForLawFirms.tsx)
- Add a section on "Rapid Onboarding" (.docx import of legacy matters).
- Highlight "Standardized Drafting" via the Global Clause Library.

## Open Questions

1. **Pricing Tiers**: The app uses `Starter`, `Standard`, `Professional`, `Sovereign`, `Enclave`. The marketing page currently uses `Solo`, `Professional`, `Institutional`. Should I align them exactly?
2. **Demo Link**: Should we keep the "Schedule Demo" link as a secondary option for Enterprise clients?

## Verification Plan

### Manual Verification
- View updated pages to ensure consistency in tone and feature descriptions.
- Verify that all CTAs point to the registration/onboarding flow correctly.
