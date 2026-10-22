# Core Layer

`core/` contains app-wide infrastructure that should have a single responsibility across the entire Angular application.

## Allowed content

- Guards
- HTTP interceptors
- App-wide services
- App-wide models
- Constants
- Utility helpers

## Dependency rule

`core/` must not depend on feature-specific implementation details.

Good:

```text
features -> core
layouts  -> core
shared   -> core (only when truly generic)
```

Avoid:

```text
core -> features
```

Implemented infrastructure:

```text
guards/auth.guard.ts
guards/role.guard.ts
interceptors/auth.interceptor.ts
interceptors/error.interceptor.ts
services/api-client.service.ts
services/auth-session.service.ts
models/app-http-error.model.ts
```


## HTTP foundation

`services/api-client.service.ts` is the low-level HTTP boundary for domain services.

Rules:

- Feature components do not inject `HttpClient` directly.
- Domain services may depend on `ApiClientService`.
- `ApiClientService` reads the API base URL from Angular environment configuration.
- The base URL is intentionally blank until the backend contract is confirmed.
- Calling the API client without a configured base URL fails fast instead of silently targeting the frontend origin.
- Authentication header skeleton and centralized error mapping are implemented in Phase 7.


## Auth and error foundation

Phase 7 adds:

- `AuthSessionService` for in-memory authentication state.
- `authInterceptor` for conditional Bearer headers on API requests only.
- `errorInterceptor` for centralized `HttpErrorResponse` mapping.
- `HttpErrorService` for normalized application HTTP errors.
- `authGuard` and `roleGuard` skeletons.

Important boundaries:

- Token persistence is intentionally not implemented yet.
- Refresh-token behavior is intentionally not implemented yet.
- Guard role values are not hard-coded; routes will supply role metadata after Backend confirms exact role codes.
- Guards are intentionally not applied to current routes yet, because the login/authentication flow is not implemented.
- The interceptor only attaches Authorization to URLs under the configured API base URL, preventing token leakage to unrelated origins.


## Model conventions

Shared transport primitives and canonical frontend response types live in `core/models/`.

Important rules:

- Backend-specific DTOs should normally live with the owning feature.
- `ApiClientService` returns the generic type requested by the calling domain service and does not globally unwrap response envelopes.
- DTO-to-domain mapping belongs in a domain service or mapper.
- Use explicit nullability.
- Keep transport dates as strings until domain/presentation logic needs interpretation.
- Prefer `unknown` over `any` for unresolved external shapes.

See `docs/PHASE-8-MODEL-CONVENTIONS.md`.
