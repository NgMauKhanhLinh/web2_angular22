# Phase 2 - Folder Architecture

## Goal

Create the agreed Angular folder boundaries before Customer/Admin shells and feature implementation begin.

## Created structure

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
└── features/
    ├── auth/
    ├── home/
    ├── products/
    ├── booking/
    ├── pets/
    ├── orders/
    └── admin/
```

Because Git does not track empty directories, leaf folders contain `.gitkeep` placeholders until implementation files are added.

## Layer responsibilities

### core

App-wide infrastructure:
- guards
- interceptors
- singleton services
- global models
- constants
- utilities

### shared

Generic reusable presentation code:
- UI components
- directives
- pipes

### layouts

Application shells:
- Customer shell
- Admin shell

### features

Business functionality:
- auth
- home
- products
- booking
- pets
- orders
- admin

## Rules

- Components must not call `HttpClient` directly.
- Feature code may depend on `core/` and `shared/`.
- `core/` must not import business feature implementation.
- Reusable presentation belongs in `shared/`.
- Customer/Admin chrome belongs in `layouts/`.
- Business-specific code belongs in `features/`.
- File names use kebab-case.

## Phase 2 Definition of Done

- [x] `core/` created.
- [x] `shared/` created.
- [x] `layouts/` created.
- [x] `features/` created.
- [x] Core subfolders created.
- [x] Shared subfolders created.
- [x] Customer/Admin layout folders created.
- [x] Initial business feature folders created.
- [x] Layer responsibilities documented.
- [x] Dependency direction documented.
- [x] Naming and placement rules documented.

Phase 2 intentionally does not implement UI, routing, services, guards, or interceptors. Those are separate implementation phases.


## Verification Evidence

Verified locally on 2026-10-05:

- Repository changes pulled successfully with a fast-forward update.
- `tree src\app /F` confirmed the expected `core/`, `shared/`, `layouts/`, and `features/` structure.
- Production build completed successfully with `npm run build`.
- Build output was generated at `dist/dr-pets-house-angular`.

Phase 2 is fully verified and complete.
