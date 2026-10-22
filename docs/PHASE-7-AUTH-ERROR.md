# Phase 7 - Interceptors, Auth Guards, and Error Handling

## Goal

Add the frontend security/error-handling skeleton required by task 2.7 without inventing backend authentication details that are still unconfirmed.

## Implemented files

```text
src/app/core/
├── guards/
│   ├── auth.guard.ts
│   └── role.guard.ts
├── interceptors/
│   ├── auth.interceptor.ts
│   └── error.interceptor.ts
├── models/
│   └── app-http-error.model.ts
└── services/
    ├── auth-session.service.ts
    └── http-error.service.ts
```

## AuthSessionService

Provides in-memory state for:

- access token
- roles
- authenticated state
- role checks

Persistence is deliberately omitted until Backend confirms whether authentication uses local storage, session storage, cookies, HttpOnly cookies, or another mechanism.

## Auth interceptor

`authInterceptor` is registered globally through:

```ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

Behavior:

- does nothing when no access token is present
- does nothing when `apiBaseUrl` is not configured
- only attaches the token to requests under the configured API base URL
- currently uses a provisional `Authorization: Bearer <token>` header, matching the Phase 0 architecture decision

The exact token contract must still be confirmed by Backend.

## Error interceptor

`errorInterceptor` catches Angular `HttpErrorResponse` values and maps them into `AppHttpError`.

Current normalized kinds:

- network
- bad-request
- unauthorized
- forbidden
- not-found
- conflict
- validation
- server
- unknown

If the backend response contains a string `message` field, it is used as the application error message. The final response envelope still needs Backend confirmation.

## Guard skeletons

### authGuard

Checks whether `AuthSessionService` currently has an access token.

### roleGuard

Checks authentication first, then optional route metadata:

```ts
data: {
  roles: ['...']
}
```

Exact role codes are not hard-coded because Backend has not confirmed them.

## Why guards are not applied yet

Applying the guards now would make the current Customer/Admin route demo inaccessible because no real login flow exists yet.

The guard skeletons are compile-ready infrastructure only. They should be attached to protected routes after:

- login endpoint is confirmed
- session persistence is decided
- role codes are confirmed
- unauthorized/forbidden UX is defined

## Centralized error flow

```text
Backend / Network
      ↓
Angular HttpClient
      ↓
errorInterceptor
      ↓
HttpErrorService
      ↓
AppHttpError
      ↓
Domain service / feature
```

## Phase 7 Definition of Done

- [x] Functional auth interceptor created.
- [x] Authorization header restricted to configured API origin.
- [x] Centralized HTTP error interceptor created.
- [x] Normalized application HTTP error model created.
- [x] HTTP error service created.
- [x] In-memory auth session service created.
- [x] Auth guard skeleton created.
- [x] Role guard skeleton created.
- [x] Exact backend roles are not hard-coded.
- [x] Token persistence/refresh assumptions are deferred.
- [x] Interceptors registered with `provideHttpClient`.
- [x] `npm run build` verified locally after pulling Phase 7.
- [x] `npm start` verified locally after pulling Phase 7.

Phase 7 is fully verified and complete.


## Verification Evidence

Verified locally on 2026-10-05:

- `npm run build` completed successfully after adding guards, interceptors, and error services.
- Lazy Customer/Admin route chunks continued to build successfully.
- `npm start` completed successfully.
- The application served at `http://localhost:4200/`.
- Customer shell rendering remained unchanged, confirming the interceptor/guard skeleton did not break the current unauthenticated demo flow.
