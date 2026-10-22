# Task 3.5 — Phase 2 Admin Login API

Phase 2 connects the approved Admin Login UI to the backend Auth API handed over by the backend team.

## Backend contract used

- Base URL (development): `http://localhost:8080/api/v1`
- Login: `POST /auth/login`
- Cookies: requests use `withCredentials: true`
- Successful response: `accessToken` + `user`
- Refresh token: HttpOnly cookie owned by the backend/browser

## Frontend behavior

1. Validate identifier/password.
2. Call the real login endpoint.
3. Store the access token and current user in `AuthSessionService`.
4. Store `systemRole` in the session role list.
5. Redirect successful login to `/admin/dashboard`.
6. Map backend RFC 9457 codes to Vietnamese login messages.

Handled login error codes:

- `INVALID_CREDENTIALS`
- `ACCOUNT_NOT_ACTIVATED`
- `ACCOUNT_BLOCKED`
- `ACCOUNT_LOCKED`

## Deferred

- Automatic `TOKEN_EXPIRED` refresh/retry flow
- Logout integration
- Auth/role/permission route enforcement
- OTP screen/navigation

Those belong to the next auth phases.
