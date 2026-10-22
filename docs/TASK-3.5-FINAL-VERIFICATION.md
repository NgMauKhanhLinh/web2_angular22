# Task 3.5 — Final Verification (FE Admin)

## Scope

Frontend Admin portion of WBS 3.5 Auth / User / Role / Permission.

Backend implementation is out of scope. FE consumes the backend contract from branch `feat/p0-auth-rbac`.

## Implemented

### Authentication
- Admin login UI from Figma, including the final approved form layout.
- Password visibility toggle switches between Design System `visibility` and `visibility_off` icons.
- Identifier field supports phone or email with a neutral account icon.
- `POST /api/v1/auth/login`.
- Access token kept in memory.
- HttpOnly refresh cookie via `withCredentials: true`.
- Bearer token interceptor.
- Automatic `TOKEN_EXPIRED` refresh + failed-request retry.
- Session restore after browser reload using `/auth/refresh` + `/auth/me`.
- Logout via `POST /api/v1/auth/logout`.
- `/admin` is the Admin login entry page for unauthenticated users; an existing valid session is sent to `/admin/dashboard`.
- `/admin/login` uses the same session-aware entry behavior.
- Login honors a safe internal `returnUrl` for protected Admin routes.

### Authorization / RBAC
- Auth guard for `/admin/**`.
- Role guard driven by route `data.roles`.
- Dedicated `/admin/forbidden` 403 page.
- Back-office roles: ADMIN, MANAGER, STAFF.
- Customer is blocked from Admin routes.
- `/admin/users` is limited to ADMIN + MANAGER.
- Manager management controls are hidden; backend branch scoping remains authoritative.
- ADMIN-only UI controls for internal-account creation, role/sub-role changes, and account status changes.

### Account / profile
- `GET /auth/me`.
- `PUT /auth/me`.
- Profile updates synchronize the current in-memory user/header.

### Admin user management
- `GET /admin/users`.
- `POST /admin/users`.
- `PUT /admin/users/:id/status`.
- `PUT /admin/users/:id/role`.
- Internal-account form validation mirrors backend phone/password rules.
- Current signed-in account does not expose self role/status controls in FE.

### Assets
- Login UI was re-synced to the approved Admin Login composition, including the updated form, password visibility states and attention marks. The Google continuation section was removed per final team direction and the form was rebalanced vertically.
- Most login assets are stored under `public/assets/admin-login/`.
- Current known production-hardening debt: four approved raster artwork references (mascot, two paws and brand logo) still use short-lived Figma MCP URLs to preserve visual fidelity. Earlier screenshot-based localization caused incorrect white backgrounds/geometry and was intentionally not reused.

## Verification matrix

| Case | Expected result | Status |
| --- | --- | --- |
| Unauthenticated `/admin` | Render Admin login page | Implemented |
| Authenticated `/admin` | Restore/use session and redirect to `/admin/dashboard` | Implemented |
| Admin valid login | 200, session created, redirect to dashboard | Verified manually |
| Admin logout | Refresh session revoked/cleared and redirect to login | Verified manually |
| Browser reload while authenticated | Refresh cookie restores access token + user | Verified manually |
| Customer enters Admin area | Redirect to `/admin/forbidden` | Verified manually |
| Manager opens Users & Roles | Scoped list only; no create/role/status controls | Verified manually |
| Manager branch scope | Only backend-authorized branch users visible | Verified manually |
| Admin profile update | Name/email saved and header synchronized | Verified manually |
| Unauthenticated direct `/admin/**` | Redirect to login with safe `returnUrl` | Verified manually |
| Invalid login form input | Client validation blocks invalid request | Implemented |
| Invalid internal account input | Phone/email/password validation blocks invalid request | Implemented |
| Expired access token | Refresh once, rotate token, retry original request | Implemented; code path covered by CI/build review, no timed manual expiry wait |
| Refresh failure | Clear local session and redirect to login | Implemented |
| Wrong role on `/admin/users` | 403 route handling | Implemented |

## Security boundary

Frontend authorization is a UX/navigation layer only. Backend remains authoritative for:
- unauthorized / forbidden responses,
- system role and staff sub-role,
- branch scope,
- ownership,
- assignment,
- account status,
- token/session validity.

The current backend branch does not expose standalone permission CRUD endpoints, so FE does not invent a permission-management API.

## Final commands

```powershell
npm ci
npm run build
npm run start:admin
```

Admin FE: `http://localhost:3001`

Local backend contract: `http://localhost:8080/api/v1`

## Manual smoke accounts

Use the demo credentials provided by the backend seed for ADMIN, MANAGER, STAFF and CUSTOMER. Do not commit real secrets or local backend `.env` files.


## Final Phase 6 status

- Final Admin Login visual approved manually, then updated per leader direction to remove the Google continuation section and rebalance the form.
- Safe protected-route `returnUrl` redirect verified manually.
- ADMIN, MANAGER and CUSTOMER role flows verified during Task 3.5 smoke testing.
- Latest Angular CI for the feature branch passed before final documentation cleanup.
- PR can move to Ready for review; merge remains a reviewer/maintainer decision.
