# Task 3.7 — Branch Management / Service & Capacity (FE Preview)

## Target UI and ownership
- Service Catalog is the global Service Master: list, view, create, edit.
- Branch Management is the owner of BranchService operations: enabled, capacity and temporary blocked time windows.
- Branch listing/detail follows the ADMIN Figma wireframes `6120:18054` and `6120:18267`. The BranchService control reuses the approved phase-3 dialog.
- The existing CatalogShell/NavBar is shared with Product; the Dịch vụ → Chi nhánh link is now active.

## Routes / review flow
1. `/admin/services`: three-dot → Cấu hình tại chi nhánh no longer opens a modal. If a branch is filtered, navigate to `/admin/branches/:id?serviceId=...`; with ALL navigate to `/admin/branches?serviceId=...` to choose branch first.
2. `/admin/branches`: choose one of the permitted demo branches; ADMIN sees all 3 illustrative branches, MANAGER sees first branch only (NOT real BE scope).
3. `/admin/branches/:id`: inspect the Dịch vụ & Capacity table; select Cấu hình on a service row to open the dialog in the selected branch context.
4. `/admin/services/new` or `/:id/edit`: the Service Master form no longer edits per-branch capacity/activation; links to Branch Management instead.

## Configurations
- Toggle branch service enabled/disabled.
- Capacity: 0 forces OFF; inactive global Service Master cannot be ON.
- Availability: **read-only BE-computed**. No `BY_SHIFT` / `CONTACT` dropdown remains in the branch config dialog or Service Create/Edit.
- Temporary blocked windows: choose a start and end date/time, add/remove entries in a local form draft; reject invalid or overlapping ranges.
- On cancel/Escape, warn if draft is unsaved; saving validates but does not call a backend.
- Catalog keeps a read-only Availability column with the placeholder 'Chờ BE' until the backend supplies a computed value.

## Backend boundary
- This branch has no verified BranchService API contract. Save validates a preview but must never claim successful persistence.
- Real branch permissions and assignedBranches must be enforced by BE. The one-branch MANAGER mock is illustrative only.
- Blocked-window existing data, scheduling/booking implications, capacity upper limits and BE-computed Availability need confirmation through the BE/PO contract.
- Branch Detail Figma also shows address, hotline and schedules, which are acknowledged as pending BE data rather than filled with invented information.

## Manual verification
- [ ] ADMIN: Catalogue row action navigates to branch selection or filtered branch, never opens a Catalog modal.
- [ ] MANAGER: only demo assigned branch visible; verify guards and permission once BE is available.
- [ ] Service Editor no longer offers any branch activation/capacity or availability dropdown.
- [ ] Branch Detail > Service & Capacity > Config controls enabled and capacity, no editable Availability.
- [ ] Blocked window: start < end; overlapping range rejected; adding/deleting works within preview; nothing persists on reload.
- [ ] Modal keyboard Esc, outside close behavior as supported, and unsaved confirmation.
- [ ] No change to Task 3.5 Auth, Product or Customer pages; CI build passes.
