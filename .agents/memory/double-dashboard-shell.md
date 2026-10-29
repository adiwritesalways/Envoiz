---
name: Double DashboardShell bug
description: Every dashboard route had two nested fixed inset-0 shells; fix and architectural rule to prevent recurrence
---

## The rule
`DashboardShell` must only ever be rendered **once** — inside `src/routes/dashboard/_layout.tsx`. No individual page or wrapper component should render its own `DashboardShell`.

**Why:** `DashboardShell` uses `fixed inset-0`. Two nested `fixed inset-0` elements produce two `#dashboard-scroll` IDs in the DOM. `getElementById` returns the OUTER (wrong) one. Scroll calls silently target an element with no scrollable content; browser-native scroll APIs fall through to `window`. Since `fixed` elements appear over the window scroll position, the page looks blank and the sidebar appears to "scroll away".

**How to apply:** `DashboardPage` (used by invoices, customers, settings, etc.) must be a plain content-wrapper div only. `DashboardOverview` (index.tsx) must also be plain content — no `DashboardShell` import or wrapper. The shell comes from `_layout.tsx`.

## What was fixed
- `src/components/envoiz/DashboardUI.tsx` — removed `import DashboardShell` and removed `<DashboardShell>` wrapper from `DashboardPage`
- `src/routes/dashboard/index.tsx` — removed `import { DashboardShell }` and its `<DashboardShell>` wrapper around the overview JSX
