# Task 3.5 — Phase 3 Token / Session / Refresh / Logout

Phase 3 completes the frontend token lifecycle for Admin authentication.

## Implemented

- Access token stays in the in-memory `AuthSessionService`.
- Refresh token remains HttpOnly and is never read by frontend JavaScript.
- All API requests use `withCredentials: true`.
- Bearer access token is attached by `authInterceptor`.
- On backend `401 TOKEN_EXPIRED`, the frontend:
  1. calls `POST /auth/refresh`,
  2. receives a new access token,
  3. updates the in-memory session,
  4. retries the failed request once.
- Concurrent expired-token requests share one refresh request.
- If refresh fails, the local session is cleared and the user is redirected to `/admin/login`.
- Admin layout exposes the authenticated user's name/role and a logout action.
- Logout calls `POST /auth/logout`; local session is cleared even if the server request fails.

## Security notes

- Access tokens are not written to localStorage/sessionStorage.
- Refresh token ownership remains with the browser cookie configured by the backend.
- The refresh cookie uses the backend contract path `/api/v1/auth`.

## Phase 4

Route enforcement (auth guard + role/permission guard + 403 page) is intentionally deferred to Phase 4.
