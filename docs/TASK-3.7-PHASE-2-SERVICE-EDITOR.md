# Task 3.7 — Phase 2: Service Catalog Create / Edit / View (FE-only)

## Design sources

- WEB-2 Figma Service Catalog / Create: node 6599:27534.
- WEB-2 Figma Service Catalog / Edit / SKU lookup: node 7128:38338.
- WEB-2 Figma Service Catalog / Edit / price mode: node 7133:38746.
- Uses the same AdminCatalogShell copied from Product branch, including the Design System expand icons.

## Routes

- ADMIN: /admin/services/new — Create.
- ADMIN: /admin/services/:id/edit — Edit.
- ADMIN/MANAGER/STAFF: /admin/services/:id — Read-only view.
- /admin/services — list from Phase 1.

## UI and validation

- Name, category (GROOMING, MEDICAL), booking mode, description.
- Duration and executor role, global status.
- Five tier price matrix (XS/S/M/L/XL) with per-tier FIXED or QUOTE, or one shared price when weight pricing is off.
- Quote tiers do not accept numeric prices. Fixed price must be a positive whole number.
- Materials: search existing Product SKUs using a datalist; locked SKU and editable quantity/unit, no duplicates; no Product creation.
- Service Master Create/Edit does NOT allow BranchService configuration. It links to `/admin/branches`; Bật/Tắt, Capacity and blocked windows are managed only under Branch Detail.
- Cancel warns about unsaved FE changes.
- View is readonly, permissions enforced by existing frontend role guard, pending BE RBAC authority.

## Important: demo-only behavior

**No Service Create/Edit write API exists yet on the integrated BE branch.**
The 'Lưu dịch vụ' button validates only. A valid form explicitly says **not saved** and does NOT mutate the demo list, claim Backend success, or issue any write request.

The Product Material options MAT014/MAT015/MAT016/MAT002/MAT018 and Branches Q1/Q3/Q7 are illustrative local fixtures; they are not fetched from Product or Branch APIs. Replace with BE-backed data and authoritative user branch scope before production.

Special demo record constraints:
- MED06 surgery must remain REQUEST_ONLY.
- MED07 emergency must remain CONTACT_ONLY.

Service Master versus BranchService responsibilities and roles still require BE/PO contract confirmation.

## Smoke tests

1. ADMIN opens Create from list, changes name/category/mode/duration, supplies all fixed prices or QUOTE.
2. Invalid Save shows errors; valid Save clearly says Backend has not received data.
3. Enter material SKU text not in catalog => validation rejects; select existing SKU => code automatically locks.
4. Duplicate SKU is rejected; quantity <= 0 and blank unit rejected.
5. Confirm the Service Master form does not expose per-branch capacity, enable switch or availability controls. It links to Branch Management; readonly View doesn't permit editing.
6. Unsaved Cancel opens confirmation before leaving.
7. ADMIN can Edit a demo record, MANAGER/STAFF can only View; unauthorized Edit is blocked by role guard.
8. Readonly editor for an unknown service ID shows not-found state.
9. Check that Product, Auth and Users routes have not changed.
