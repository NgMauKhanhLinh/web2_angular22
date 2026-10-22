# Task 3.7 — Service Master API integration

## API source
- BE source: `minhllk24/PET_CLINIC_BACKEND`, branch `feat/foundation-v6`
- Base URL (existing FE environments): `https://pet-clinic-backend-a4lj.onrender.com/api/v1`
- Contract: `docs/Task-2.8-v7-confirmed/07-openapi-v7.yaml`
- Backend Render endpoint availability was **not** verified from this environment. Verify which Backend commit is actually deployed.

## Implemented (Service Master only)
| FE | API | Access |
| --- | --- | --- |
| Catalog list, filters, 6 rows/page, totals | `GET /services?page=1&limit=6&search=&bookingMode=&status=&branchId=` | ADMIN/MANAGER |
| Detail / Edit hydration | `GET /services/:id` | ADMIN/MANAGER |
| Add Service | `POST /services`, `Idempotency-Key` header | ADMIN |
| Save edit | `PATCH /services/:id` | ADMIN |
| ADMIN branch filter options | `GET /branches?limit=100` | ADMIN |

Data is from BE; there is no fallback to the 12 demo services on the Service Catalog. A failed request shows an error and retry.

## Field mapping
- FE Type -> `serviceType` (GROOMING/MEDICAL); don't overwrite BE's separate `category`.
- FE CARE STAFF -> `CARE_STAFF_GROOMER`; MEDICAL -> NURSE/VETERINARIAN.
- FE price tiers -> `priceVariants` (label and bounds) + `basePrice`, no null price sent; QUOTE-only uses basePrice 0.
- FE status -> `status`; BE availability -> `availabilityText`; enabled count -> `enabledBranchCount/totalBranchCount`.
- `durationMinutes` is mandatory and >= 1, including CONTACT_ONLY.
- The POST idempotency key is preserved when retrying the **same** draft and reset when the draft changes.
- When editing without changing prices, price payload is not patched, protecting existing BE variants.
- Existing materials use `InventoryItem.materialId` ObjectIDs, not Product SKU; the form displays them read-only and never overwrites `defaultMaterials`. There is no InventoryItem lookup API in the inspected BE routes, so editing these needs a separate contract.

## Explicitly NOT in this PR
- BranchService capacity/enable/blocked windows or branch scope implementation.
- InventoryItem material picker and defaultMaterials write (not wired).
- Service archival action (not requested and BE may deactivate branch configs).
- Real-time availability calculations (displayed status is BE-provided).
- Production merge/deployment.

## Manual QA — with Backend deployed from foundation-v6
1. Sign in as ADMIN; open `/admin/services`. Ensure no demo IDs and no phantom data when BE is unreachable.
2. Check 6 rows/page, search, BOOKABLE/REQUEST_ONLY/CONTACT_ONLY and ACTIVE/INACTIVE filters, real totals and branch count.
3. Open a real service detail and edit form; ensure values are loaded, pricing and materials are not replaced with demo defaults.
4. Create a real service with valid name, price, staff role, duration and booking mode. Confirm a network `POST /services` and response 201.
5. Update an existing service name, without price edits; ensure `PATCH` doesn't include `priceVariants` or `defaultMaterials`.
6. Verify 401 refresh/relogin, 403 Manager write prevention, 422 validation errors, failed network requests, and duplicate-submit prevention.
7. Leave Branch Management and capacity UI untouched; handle in Branch task.

## Known BE compatibility risks
- The public `GET /branches` endpoint returns paginated list; the ADMIN filter fetches one batch of up to 100 branches.
- The `GET /services` optional auth route requires FE's Authorization interceptor to send access token so ADMIN can view INACTIVE records.
- `isAvailable`/AvailabilityText returned by BE is status information, not an editable field.
