# Task: Pricing Visibility Control

- [/] Implementation
    - [ ] Create `VITE_SHOW_PRICING` feature flag in `.env`
    - [ ] Update `marketing/src/layouts/Layout.tsx` to conditionally hide Pricing links
    - [ ] Update `marketing/src/App.tsx` to handle `/pricing` route redirection
    - [ ] Update `marketing/src/pages/HomePage.tsx` to hide Pricing CTA
    - [ ] Update dashboard `App.tsx` to conditionally hide `SovereignBilling` or related tabs
- [ ] Verification
    - [ ] Verify pricing is hidden in marketing header, footer, and mobile menu
    - [ ] Verify `/pricing` URL redirects or shows placeholder
    - [ ] Verify dashboard billing/pricing links are hidden if applicable
