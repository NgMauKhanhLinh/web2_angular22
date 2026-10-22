# Task 3.8 — Staff / Shift Management: FE implementation contract

Source of truth: BA attachment "TÀI LIỆU LOGIC FE – MODULE NHÂN SỰ" (2026-10-16). This is an implementation plan, not a claim that BE routes are available.

## Confirmed existing main UI foundation (main: 8b34a5a)
- Reuse `AdminCatalogShellComponent` in `src/app/shared/admin-catalog-shell/` (single 88px sticky header, 342px sidebar >1100px, Figma export icons).
- Operations submenu currently contains Kho, Chi nhánh, Nhân sự; only Chi nhánh is linked.
- Shell `activeItem` currently has categories/products/services/branches; add `staff` and auto-expand Operations. Do not duplicate header or sidebar.
- Product edit/create page layout in `src/styles.scss` is the spacing baseline; use the same breadcrumb gap 16px, heading 28px and header/form spacing 24px where corresponding Figma Staff frames agree.
- Do NOT reuse legacy `/admin/users` for staff lifecycle. The old route manages internal RBAC accounts separately.

## Intended routes (verify against Figma before coding)
- `/admin/staff`: Staff table; tab 'Nhân viên'
- `/admin/staff/new`: Create Staff + new internal account
- `/admin/staff/:staffId`: Staff read-only details, weekly shifts
- `/admin/staff/:staffId/edit`: Edit Staff; Admin-only account status/reset actions
- `/admin/staff/schedule`: Weekly schedule; tab 'Lịch làm việc'
- `/admin/staff/shifts/assign`: Weekly assignment; staff preselection query param

## Core data + UI rules
- Job role vs SystemRole are distinct. Prefix mapping: VETERINARIAN→BS., NURSE→YT., RECEPTIONIST→LT., CARE_STAFF→CS., MANAGER→QL. Confirm technical BE enums before wiring payloads.
- Account status ACTIVE / BLOCKED only for current Admin UI, use success/error Status Badge.
- List columns: staff code, prefixed name, job role, assigned branches, today's actual Shift, account status, actions. Use 6 rows/page per approved admin table convention.
- Search by code/name; role/branch/account status AND filters; reset pagination when search/filters change, server filters before pagination.
- Weekly view Monday–Sunday; supports multiple non-overlapping shifts in a day, records exact staffId/branchId/date/startTime/endTime. Branch must be assigned; no manual booking slot creation.
- Staff detail is read-only despite Figma buttons; edits and shift changes live on their own screens.
- Create Staff requires name, job role, valid assigned branches incl. homeBranch, internal account identifier/password and confirmation. 'Create and assign shifts' only navigates after successful BE creation with returned staffId.
- Reset password / block / unblock are Admin-only, require confirmation, BE result controls success; never display current password.
- No attendance, payroll, recruitment, leave balances or biometric functionality in Task 3.8 P0.

## Backend contract not yet verified
- Staff CRUD endpoint schema and transaction for Staff + internal account
- Manager create-profile-vs-Admin create-account ownership
- Shift templates by branch; Shift CRUD and overlap/appointment conflict policy
- Password uniqueness/policy/first-login reset
- Existing schedules' treatment when blocking account or unassigning branch
- Backend paginated filters/permission scope and total count
No fake API writes or success notifications. Use clearly marked FE preview where API is absent.

## Screens requiring Figma design context
- Staff list 6161:20321
- Staff detail 6413:26693
- Create 6357:26405
- Edit 6359:26563
- Reset password modal 7316:38067
- Blocked state 7316:37857
- Weekly schedule 6334:25009
- Weekly shift assignment 6357:26732

## Phase 2 — Staff Detail FE preview (implemented)
- Reference: Figma Staff Detail node `6413:26693`, including approved read-only data cards, account status badge, and 7-day shift table.
- Route: `/admin/staff/:id` protected by ADMIN/MANAGER role guard. Eye/View action on Staff List now navigates to it; Edit remains planned for next phase.
- Shared sample in `models/staff-preview.model.ts`, preserving list rows; NV001 assigned branches and login name follow Staff Detail Figma so sample shifts stay in assigned branches.
- Personal info: id, prefixed name, job role, phone, email; branch card: home/assigned branches; account card: login id and status. Unknown sample fields show an em dash, never fabricated.
- Sample schedule: 19–25 Oct 2026 for NV001 from Figma; weekday table supports zero or multiple shifts for a day and next/previous week selection. Empty weeks are preview placeholders, not proof of no actual shifts.
- Figma calendar icon exported at 16px into `public/assets/admin-staff/calendar-today.svg`; shared header/sidebar remain unchanged.
- Figma renders Hủy / Lưu thay đổi / Chặn tài khoản but BA defines Detail as read-only: Hủy returns to Staff list; Save / Block stay disabled here, with explanatory tooltips.
- Error state for unknown `:id` leads back to Staff list.
- No real Staff API / Shift API writes or unverified Manager branch permission claims. Browser regression and Angular CI still need verification.

## Suggested sequence
1. Review all Figma nodes, reusable component inventory and role/capability contracts.
2. Shared models/mappings, staff shell submenu, routes, list (first FE-only).
3. Staff read-only detail & weekly schedule.
4. Create/Edit forms with validation and honest nonpersisted preview states.
5. Shift assignment/template UI, collision guard, confirmation, RBAC actions.
6. CI build, role/regression QA, PR; await BE contract before real writes.

## Integration safety
Branch from main HEAD 8b34a5a, isolated as `feature/admin-staff-shift-management`; no changes merged to main/develop yet.
