# Phase 4 - Customer and Admin Shells

## Goal

Implement the two application shells required by task 2.7 without mixing business feature logic into layout components.

## Implemented

### CustomerLayoutComponent

Provides:

- sticky customer header
- brand area
- customer navigation placeholders
- account area placeholder
- nested `router-outlet`
- customer footer
- responsive behavior
- keyboard skip link

### AdminLayoutComponent

Provides:

- administration sidebar
- admin navigation placeholders
- workspace header
- profile placeholder
- nested `router-outlet`
- responsive behavior
- keyboard skip link

## Architecture decisions

- Both shells are standalone Angular components.
- Both use `ChangeDetectionStrategy.OnPush`.
- Both import `RouterOutlet`.
- Shells contain no API calls or feature-specific business logic.
- Navigation labels are structural placeholders in this phase.
- `RouterLink`, route configuration, active route state, and lazy child routes are deliberately deferred to Phase 5.

This keeps Phase 4 focused on layout composition and prevents incomplete navigation behavior before the route tree is defined.

## Phase 4 Definition of Done

- [x] Customer shell component created.
- [x] Customer shell has header, content outlet, and footer.
- [x] Admin shell component created.
- [x] Admin shell has sidebar, header, and content outlet.
- [x] Both shells are responsive at a basic foundation level.
- [x] Both shells are standalone and OnPush.
- [x] Layouts contain no backend/business logic.
- [x] Layout documentation updated.
- [x] `npm run build` verified locally after pulling Phase 4.

Phase 4 is fully verified and complete.


## Verification Evidence

Verified locally on 2026-10-05:

- `git pull` fast-forwarded the local branch to the Phase 4 implementation.
- `npm run build` completed successfully.
- Build output was generated at `dist/dr-pets-house-angular`.
