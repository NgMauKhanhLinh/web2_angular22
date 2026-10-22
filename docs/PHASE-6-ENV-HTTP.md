# Phase 6 - Environment and HTTP Service Layer

## Goal

Provide Angular environment configuration and a typed low-level HTTP client without hard-coding an unconfirmed backend contract.

## Environment files

```text
src/environments/
├── environment.model.ts
├── environment.ts
└── environment.development.ts
```

`angular.json` replaces `environment.ts` with `environment.development.ts` for the development build configuration used by `ng serve`.

Current values:

```ts
apiBaseUrl: ''
```

This is deliberate. The backend base URL and API prefix are still marked TBD in `docs/BACKEND-CONTRACT.md`.

### Security note

Angular environment files are bundled into client-side JavaScript. They are configuration, **not secret storage**. API keys, passwords, private tokens, or other secrets must never be placed in these files.

## HttpClient provider

`provideHttpClient()` is registered in `app.config.ts`.

Interceptors are intentionally deferred to Phase 7.

## ApiClientService

Created:

```text
src/app/core/services/api-client.service.ts
```

Supported methods:

- `get<TResponse>()`
- `post<TResponse, TBody>()`
- `put<TResponse, TBody>()`
- `patch<TResponse, TBody>()`
- `delete<TResponse>()`

Optional request settings currently support:

- `HttpHeaders`
- `HttpParams`
- `withCredentials`

The service normalizes endpoint paths and prefixes them with `environment.apiBaseUrl`.

If `apiBaseUrl` is blank, the service fails fast with an explicit configuration error. This prevents accidental API calls to the Angular frontend origin while the backend contract is unresolved.

## Dependency direction

```text
Feature Component
      ↓
Domain Service
      ↓
ApiClientService
      ↓
Angular HttpClient
      ↓
Backend
```

Business/domain services will be added as features are migrated. Components should not use `HttpClient` directly.

## Backend contract dependency

Before real API integration, Backend must confirm at minimum:

- development/staging/production base URL
- API prefix
- authentication endpoints
- token/credential behavior
- response envelope
- CORS behavior

See `docs/BACKEND-CONTRACT.md`.

## Phase 6 Definition of Done

- [x] Production environment file created.
- [x] Development environment file created.
- [x] Environment type defined.
- [x] Development file replacement configured in `angular.json`.
- [x] `provideHttpClient()` registered.
- [x] Typed `ApiClientService` created.
- [x] GET/POST/PUT/PATCH/DELETE foundations implemented.
- [x] Missing API base URL fails fast.
- [x] Secrets/configuration boundary documented.
- [x] Component -> Domain Service -> ApiClient -> HttpClient convention documented.
- [x] `npm run build` verified locally after pulling Phase 6.
- [x] `npm start` verified locally after pulling Phase 6.

Phase 6 is fully verified and complete.


## Verification Evidence

Verified locally on 2026-10-05:

- `npm run build` completed successfully.
- Lazy Customer/Admin route chunks were still generated.
- `npm start` completed successfully.
- The application served at `http://localhost:4200/`.
- Customer routing continued to render correctly after registering `HttpClient` and environment file replacements.
