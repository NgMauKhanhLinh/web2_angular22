# Features

`features/` contains business functionality.

Initial feature boundaries:

```text
auth/
home/
products/
booking/
pets/
orders/
admin/
```

## Feature ownership

A feature may contain its own:

- Pages/components
- Feature-specific services
- Feature-specific models
- Feature-specific routes
- Feature-specific helpers

## Dependency rule

Features may depend on `core/` and `shared/`.

Avoid direct coupling between unrelated features. If code becomes truly reusable, move it to an appropriate shared/core abstraction.
