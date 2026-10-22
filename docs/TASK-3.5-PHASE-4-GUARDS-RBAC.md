# Task 3.5 — Phase 4 Auth Guard / Role Guard / 403

Phase 4 enforces frontend route access for the back-office area.

## Implemented

- `authGuard` restores an existing HttpOnly refresh-cookie session after a browser reload.
- If the refresh cookie is valid:
  1. `POST /auth/refresh`
  2. store the new in-memory access token
  3. `GET /auth/me`
  4. restore current user + role
- If session restore fails, protected routes redirect to `/admin/login?returnUrl=...`.
- `roleGuard` checks route `data.roles`.
- Back-office shell currently allows `ADMIN`, `MANAGER`, and `STAFF`.
- `CUSTOMER` and other unauthorized roles are redirected to `/admin/forbidden`.
- A dedicated 403 page is available outside the protected admin shell to avoid redirect loops.

## Security boundary

Frontend guards are navigation/UX controls only. Backend middleware remains the authority for authorization and must return 401/403 for unauthorized API calls.

## Next phase

Phase 5 will apply finer-grained permission UI and Admin-only controls (for example internal account / role / permission management).
