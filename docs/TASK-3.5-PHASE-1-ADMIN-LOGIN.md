# Task 3.5 — Phase 1 Admin Login UI

Phase 1 implements the Admin Login page as a standalone Angular feature.

## Route

`/admin/login`

## Included

- Standalone Angular component
- Reactive form foundation
- Identifier and password fields
- Show/hide password interaction
- Client-side required/min-length validation
- Responsive Admin Login composition based on the approved Figma reference
- Dedicated `start:admin` script using port 3001 (matches current Backend CORS handover)

## Deferred from Phase 1

These items were intentionally deferred from Phase 1 and were implemented in later Task 3.5 phases:

- Real `POST /api/v1/auth/login` integration
- Backend error-code mapping
- Access-token session handling
- Refresh-token flow
- Route guards / RBAC enforcement

## Visual asset note

Most approved Figma assets used by the login page are repository-owned under `public/assets/admin-login/`.

The final approved visual currently keeps a small set of raster artwork references from Figma MCP at runtime (mascot, two paws and brand logo) because the earlier screenshot-based localization changed transparency/geometry. This is tracked as production-hardening technical debt; do not replace those assets with screenshot exports because that regresses the approved design.
