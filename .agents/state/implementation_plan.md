# Implementation Plan: structural_maturity_migration

This plan outlines the transition of NomosDesk from a **Modal-Centric** architecture to a **Route-Driven** and **Context-Aware** system.

## User Review Required

> [!IMPORTANT]
> This refactor will change how users navigate the application. Instead of constant pop-ups, users will move between full-page workspaces. Deep-linking will become possible.

## Proposed Changes

### 1. Unified Identity & Permissions Logic
Centralize `userRole` and `tenantId` in a new `useSovereign` hook.

### 2. Router-First Navigation
Define top-level routes for Dashboard, Registry, Matters, Practitioners, and Settings in `App.tsx`.

### 3. Workspace Migration
Migrate heavy modals (Settings, Dossiers, Accounting) into dedicated layouts.

### 4. URL-Addressability (Deep Linking)
Ensure system states (like active settings tab) are reflected in query parameters.

## Verification Plan
- **Context Integrity**: Verify role-based permissions in the new context.
- **Deep Linking**: Confirm that refreshing the page on a Practitioner route restores the correct view.
