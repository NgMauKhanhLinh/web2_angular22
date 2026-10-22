# Task 3.5 — Phase 5 Permission UI + Profile + Internal Accounts

Phase 5 connects the available Auth/RBAC backend account-management contract to the Admin frontend.

## Implemented

- Role-derived UI permission service.
- Back-office navigation is filtered by the current role.
- ADMIN + MANAGER can open the user list route.
- MANAGER only receives the branch-scoped list returned by the backend and has no role/status/create controls in the UI.
- ADMIN can:
  - create internal accounts,
  - update system role,
  - update staff sub-role,
  - block/reactivate accounts.
- Current signed-in account is protected from self status/role controls in the UI.
- Backend remains authoritative: create/role/status endpoints are ADMIN-only.
- Account/profile page uses:
  - `GET /auth/me`
  - `PUT /auth/me`
- Profile updates synchronize the in-memory session/header.

## Permission contract note

The current backend branch exposes role-based authorization and branch scoping but no standalone permission CRUD endpoint. Therefore this phase implements permission-aware UI from the current role contract; it does not invent a permission-management API.

## Backend routes used

- `GET /admin/users` — ADMIN + MANAGER, Manager branch-scoped
- `POST /admin/users` — ADMIN only
- `PUT /admin/users/:id/status` — ADMIN only
- `PUT /admin/users/:id/role` — ADMIN only
- `GET /auth/me`
- `PUT /auth/me`
