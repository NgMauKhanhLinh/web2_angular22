# Layouts

`layouts/` contains application shells that host nested routes.

## Implemented shells

```text
layouts/
├── customer-layout/
│   ├── customer-layout.component.ts
│   ├── customer-layout.component.html
│   └── customer-layout.component.scss
└── admin-layout/
    ├── admin-layout.component.ts
    ├── admin-layout.component.html
    └── admin-layout.component.scss
```

## Customer shell

Composition:

```text
Customer Header / Navigation
            ↓
       router-outlet
            ↓
      Customer Footer
```

The Customer shell owns customer-facing page chrome only. Feature pages will be injected into its `router-outlet` in the routing phase.

## Admin shell

Composition:

```text
Admin Sidebar + Header
          ↓
     router-outlet
```

The Admin shell owns administration navigation and workspace chrome only.

## Rules

- Layouts coordinate page chrome and navigation.
- Layouts do not call backend APIs.
- Layouts do not contain business feature logic.
- Child pages are rendered through `router-outlet`.
- Route links and active-route behavior are wired in Phase 5, when the route tree exists.
