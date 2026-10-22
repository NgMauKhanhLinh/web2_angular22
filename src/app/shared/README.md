# Shared Layer

`shared/` contains reusable presentation building blocks with no ownership by one business feature.

## Current shared components

```text
components/
├── button/
├── loading/
└── page-title/
```

### ButtonComponent

Generic action button supporting:

- primary/secondary variants
- disabled state
- loading state
- projected button content
- button type selection

### LoadingComponent

Generic inline loading/status indicator with a configurable label.

### PageTitleComponent

Reusable page heading with a required title and optional subtitle.

## Rules

A component belongs in `shared/` only when it is reusable across multiple features or shells.

Shared components should:

- avoid feature-specific business logic
- expose small, explicit inputs
- remain presentation-focused
- use standalone Angular components
- use `ChangeDetectionStrategy.OnPush`

Feature-specific UI should stay inside its feature folder.
