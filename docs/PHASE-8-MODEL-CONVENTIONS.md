# Model and API Response Conventions

## Goal

Define how frontend models, backend transport DTOs, pagination, validation errors, nullability, and response mapping should be handled during the React-to-Angular migration.

## Important boundary

The backend response envelope is still **not confirmed**.

Therefore the models introduced in this phase are frontend conventions, not assertions about the backend wire format.

Do not assume the backend returns:

```json
{
  "data": {},
  "message": "...",
  "meta": {}
}
```

until Backend confirms it.

## Core canonical models

Created:

```text
src/app/core/models/
├── api-contract.model.ts
├── api-response.model.ts
└── app-http-error.model.ts
```

### FrontendApiResponse<TData, TMeta>

Optional normalized frontend shape:

```ts
interface FrontendApiResponse<TData, TMeta = unknown> {
  data: TData;
  message?: string;
  meta?: TMeta;
}
```

Use this only after a domain service intentionally maps a backend DTO into a stable frontend representation.

### PaginationMeta

Canonical frontend pagination metadata:

```ts
interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

If Backend uses fields such as `pageNumber`, `size`, `totalElements`, or zero-based paging, the domain service/mapper must translate them.

### PaginatedData<TItem>

Canonical paginated list representation:

```ts
interface PaginatedData<TItem> {
  items: readonly TItem[];
  pagination: PaginationMeta;
}
```

### ValidationIssue

Canonical field-level validation issue:

```ts
interface ValidationIssue {
  field: string;
  message: string;
  code?: string;
}
```

## Transport primitives

`api-contract.model.ts` defines small shared types:

- `ApiId = string | number`
- `IsoDateString = string`
- `IsoDateTimeString = string`
- `Nullable<T> = T | null`
- `RequestContext`

These types make transport assumptions explicit without inventing domain fields.

## File naming convention

Use:

```text
*.model.ts     application/domain/shared model
*.dto.ts       backend wire-format DTO
*.request.ts   request payload
*.response.ts  backend-specific response payload
*.mapper.ts    DTO -> domain/frontend mapping
*.service.ts   API/domain service
```

Examples:

```text
product.model.ts
product.dto.ts
create-booking.request.ts
login.response.ts
product.mapper.ts
product.service.ts
```

## Placement convention

App-wide transport primitives belong in:

```text
core/models/
```

Feature-specific models belong with the feature:

```text
features/products/models/
features/booking/models/
features/pets/models/
```

Do not put Product, Pet, Booking, Order, User, etc. domain models into `core/models` merely because multiple files use them.

## Mapping convention

Preferred boundary:

```text
Backend DTO
    ↓
Domain Service / Mapper
    ↓
Frontend Domain Model
    ↓
Component
```

Components should not know backend field names when a mapping boundary is justified.

## Nullability

Be explicit:

```ts
name: string;
avatarUrl: string | null;
middleName?: string;
```

Meaning:

- `T | null`: field exists but can be empty/null
- optional `?:`: field may be absent
- do not use both unless the backend contract genuinely allows both states

## Date/time convention

At the HTTP boundary, keep date/time values as strings unless there is a clear reason to convert them.

Use:

```ts
IsoDateString
IsoDateTimeString
```

Do not silently construct JavaScript `Date` objects in low-level transport code. Timezone interpretation belongs in the domain/presentation layer where requirements are known.

## Avoid `any`

Use concrete types whenever the contract is known.

When the shape is genuinely unknown, use:

```ts
unknown
```

and narrow/validate before use.

## ApiClientService convention

`ApiClientService` remains transport-generic.

For example:

```ts
this.apiClient.get<ProductListResponseDto>('/products')
```

The domain service decides whether to:

- return the DTO directly
- map it to `PaginatedData<Product>`
- map it to another feature-specific model

The low-level client must not globally unwrap a `data` property while the backend response envelope is still unconfirmed.

## Error convention

HTTP failures are normalized separately through:

```text
HttpErrorResponse
      ↓
HttpErrorService
      ↓
AppHttpError
```

Do not mix success response models with error models.

## Phase 8 Definition of Done

- [x] Canonical frontend response model defined.
- [x] Pagination model defined.
- [x] Validation issue model defined.
- [x] Shared API transport primitives defined.
- [x] DTO/request/response/model/mapper naming convention documented.
- [x] Core-vs-feature model placement documented.
- [x] DTO-to-domain mapping boundary documented.
- [x] Nullability convention documented.
- [x] Date/time boundary convention documented.
- [x] `unknown` preferred over `any` when shape is unresolved.
- [x] ApiClientService explicitly does not assume a backend response envelope.
- [x] `npm run build` verified locally after pulling Phase 8.
- [x] `npm start` verified locally after pulling Phase 8.

Phase 8 is fully verified and complete.


## Verification Evidence

Verified locally on 2026-10-05:

- `npm run build` completed successfully.
- Existing lazy Customer/Admin route chunks continued to compile successfully.
- `npm start` completed successfully.
- The application served at `http://localhost:4200/`.
- Customer shell rendering remained stable after introducing the shared model conventions.
