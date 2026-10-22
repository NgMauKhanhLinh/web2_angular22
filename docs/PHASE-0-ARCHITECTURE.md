# Phase 0 - Architecture and Repository Baseline

This document records the decisions that must be stable before Angular scaffolding begins.

## 1. Repository Roles

### New Angular repository

`chungvinhhung/DR_PETS_HOUSE_ANGULAR`

Purpose:
- New frontend source of truth.
- All new frontend development happens here.
- Angular application starts from this repository.

### Previous React/Vite repository

`minhllk24/BE_A_PET_CLINIC-FRONTEND`

Purpose:
- Legacy/reference implementation only.
- Reference existing UI, routes, business flows, service behavior, and API assumptions.
- Do not continue feature development there unless the team explicitly decides otherwise.

The React source must not be copied line-by-line into Angular. It should be used as a behavioral reference.

## 2. Technology Baseline

- Angular 22.
- TypeScript.
- Standalone Components.
- npm.
- Angular Router.
- Angular HttpClient.
- Tailwind CSS plus component-scoped styles.
- Angular services/signals for initial state management.
- No NgRx in the foundation unless a concrete state-management requirement appears.

Angular core and Angular CLI must remain on matching major versions.

## 3. Application Boundary

Use one Angular application with two route/layout shells.

### Customer shell

Responsibilities:
- Public/customer navigation.
- Customer-facing content.
- Customer footer.
- Nested customer routes.

Representative routes:
- `/`
- `/products`
- `/booking`
- `/pets`
- `/orders`

### Admin shell

Responsibilities:
- Admin header.
- Admin sidebar/navigation.
- Admin content outlet.
- Nested admin routes.
- Role guard boundary.

Representative routes:
- `/admin/dashboard`
- `/admin/orders`
- `/admin/appointments`

Do not create two independent Angular workspaces for Customer and Admin at this stage.

## 4. Planned Folder Architecture

```text
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   ├── models/
│   ├── constants/
│   └── utils/
├── shared/
│   ├── components/
│   ├── directives/
│   └── pipes/
├── layouts/
│   ├── customer-layout/
│   └── admin-layout/
├── features/
│   ├── auth/
│   ├── home/
│   ├── products/
│   ├── booking/
│   ├── pets/
│   ├── orders/
│   └── admin/
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

Dependency direction:

```text
Component
   ↓
Domain Service
   ↓
Angular HttpClient
   ↓
Backend API
```

Components must not call `HttpClient` directly.

## 5. Authentication Boundary

Foundation design:

```text
Login
  ↓
AuthService
  ↓
Access token/session state
  ↓
Auth interceptor
  ↓
Backend
```

Route protection:

```text
Protected route
  ↓
AuthGuard
  ↓
Role/Admin Guard where required
  ↓
Page/Layout
```

Phase 2.7 requires the guard/interceptor foundation, not a complete RBAC system.

## 6. Error Handling Boundary

HTTP errors should be normalized centrally rather than duplicated in components.

Minimum categories:
- 400 - validation/bad request.
- 401 - unauthenticated/expired session.
- 403 - forbidden.
- 404 - resource not found.
- 500+ - backend/server failure.

A typed API error model should be introduced during the implementation phase.

## 7. Naming Convention

Use kebab-case for files.

Examples:

```text
customer-layout.component.ts
customer-layout.component.html
customer-layout.component.scss

auth.service.ts
product.service.ts

auth.guard.ts
admin.guard.ts

auth.interceptor.ts
error.interceptor.ts

user.model.ts
appointment.model.ts
api-response.model.ts
```

Class/interface names use PascalCase.

## 8. Git Workflow

Branches:

```text
main
  ↑
develop
  ↑
feature/*
```

Rules:
- `main` is stable/demo-ready.
- `develop` is the integration branch.
- New work branches from `develop`.
- Merge feature work through Pull Requests.
- Do not commit feature work directly to `main`.

Task 2.7 branch:

`feature/angular-shared-foundation`

## 9. Security Baseline

Never commit:
- Access tokens.
- Refresh tokens.
- Passwords.
- Private API keys.
- Production secrets.
- Personal credentials.

Environment-specific backend URLs must not be hard-coded in page components.

## 10. Open Backend Decisions

The following items remain intentionally unresolved until Backend confirms them:
- Development API base URL.
- Production API base URL.
- API prefix/version.
- Login endpoint.
- Refresh endpoint.
- Access-token response field.
- Refresh-token storage/transport mechanism.
- Role values.
- Success/error response envelope.
- CORS and credential requirements.

See `BACKEND-CONTRACT.md`.

## 11. Phase 0 Definition of Done

Completed:
- [x] New Angular GitHub repository exists.
- [x] React repository is designated legacy/reference.
- [x] `main` branch exists.
- [x] `develop` branch exists.
- [x] `feature/angular-shared-foundation` branch exists.
- [x] Angular Standalone architecture is selected.
- [x] One-app Customer/Admin shell strategy is selected.
- [x] Folder architecture is documented.
- [x] Naming convention is documented.
- [x] Branch workflow is documented.
- [x] API/auth integration boundaries are documented.

Pending external confirmation:
- [ ] Backend API/auth contract is confirmed by the Backend team.

Phase 1 may begin before the backend contract is finalized because workspace scaffolding does not depend on live API integration.
