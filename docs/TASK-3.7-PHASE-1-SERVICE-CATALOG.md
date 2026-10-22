# Task 3.7 — Phase 1: Service Catalog List

## Sources and purpose

Updated ADMIN Service Catalog List, Figma node 6599:27221, ALL branches variant 7160:38863, and FE Display & Interaction Logic — Danh mục dịch vụ (14/10/2026).

This is an Angular Phase 1 UI prototype with a local typed demo repository, not a live backend integration.

## Local test

1. Run npm run start:admin.
2. Sign in with a permitted backoffice account.
3. Open http://localhost:3001/admin/services.
4. This route reuses the exact shared AdminCatalogShell and source artwork from the Product branch (header, logo, avatar, sidebar); Service navigation has its own active/expanded state. Task 3.5 screens retain their existing shell.

## Phase 1 implemented

- 9 columns: code, service+category, executor role, booking mode, duration, price, activation, availability, row actions.
- Search code/name (debounce 350ms), AND filters for branch/mode/Service Master status, pagination preserving filters.
- Branch context swaps Kích hoạt / CN đang bật. Enabled counts use actual scoped demo branch set, NEVER a fixed denominator of 10.
- Effective branch enabled = service.status ACTIVE && branchService.enabled && capacity > 0.
- BOOKABLE, REQUEST_ONLY, CONTACT_ONLY badge; null duration displayed —; price from min fixed tier, reference price or quote.
- Label-only role display mapping CARE_STAFF_GROOMER → CARE STAFF; the technical BE enum is untouched.
- One accessible row menu at a time; closes on outside click or Escape. Prototype role actions ADMIN view/edit/configure, MANAGER view/configure, STAFF view.
- Loading skeleton, initial empty, empty search, retryable error and live result range.
- Figma search and three-dot icon files are repository-owned local SVGs.
- Sales/Service group dropdowns, header profile caret and filter selects use `expand_more` / `expand_less` exported from Figma Design System > Navigation.
- The shared Product navbar/sidebar and source images were copied intact from `feature/admin-product-category`; Service-only dropdown state and disabled future branch link are added without duplicating the shell.

## Phase 1 boundaries and honest mock notice

- 12 illustrative services, branches, capacities and prices live in ServiceCatalogMockRepository. They are NOT server data, authoritative role scopes or production counts.
- MANAGER/STAFF demo shows one sample branch only. Actual scope MUST be supplied/enforced by BE.
- Button/menu selections for create/detail/edit/configure display a clear Phase 2/3 notice; no silent dead controls and no fake successful save.
- No Product Master changes, SKU generation, Service Master writes or BranchService writes in this phase.
- BE will provide the service list contract and enforce role/branch authorization.

## Manual smoke cases

1. ADMIN sees + Thêm dịch vụ, three-dot menu has View/Edit/Configure.
2. Search GRM01 with filters preserved; changing filters resets page 1.
3. Branch Quận 1 → Kích hoạt; ALL → CN đang bật, no fixed /10.
4. CONTACT_ONLY may show — duration and quote text.
5. Pagination updates range, one menu open at a time, click outside/Escape closes.
6. Empty state: /admin/services?demoState=empty.
7. Error/retry: /admin/services?demoState=error (fails once then retry succeeds).
8. MANAGER and STAFF menu actions match prototype role matrix only, not BE authorization.
9. Phase 2/3 actions show a truthful pending notice.

## BE contract to confirm

List API should accept query, branchId/ALL, bookingMode, status, page/pageSize and return count, unique IDs, enabledBranchCount/eligibleBranchCount and scoped branch/permission data. PO/BE must confirm role capability matrix and behavior for mixed availability, capacity and booking implications before production integration.
