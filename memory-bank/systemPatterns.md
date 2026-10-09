# System patterns

## Architecture

```text
Browser ──► Vite dev server :5173 ──(/api proxy)──► FastAPI :8000
            React SPA (App.tsx)                     app/routes.py
            client-side aggregation                 generate_mock_movements(seed=42)
```

- Docker Compose runs two services, `frontend` and `backend`, on one network. The Vite proxy target is `http://backend:8000` (service DNS name).
- Both services bind-mount their source (`./frontend:/app`, `./backend:/app`), so edits hot-reload. `node_modules` is an anonymous volume inside the container.

## Data flow

1. `App.tsx` `useEffect` → `fetch('/api/metrics')` (all 360 movements, no filters).
2. Only `movements` is kept in state. During render (`useMemo`): `computeKPIs` → `KPIMetrics`, `computeMonthlyData` → `MonthlyDataPoint[]` (`YYYY-MM` keys sliced from the ISO string, labeled "Dec 2025"), `formatPeriodLabel` → header badge.
3. Props go down to `KPIRow` and the two charts, which are `React.lazy` chunks behind `Suspense` with a `ChartCardSkeleton` fallback. No global state and no data-fetching library.

## Backend pattern

Each endpoint: `generate_mock_movements(seed=42)` → `filter_by_business_type` → `filter_movements(dates, category, operation_type)` → pure helper (`summarize_movements`, `build_top_categories`, `calculate_net_value`, `detect_outcome_alerts`, `build_metrics_facets`) → return-type annotation as the response schema. Query params are `Annotated` aliases (fastapi skill).

- `comparison`: previous period = the same duration immediately before `start_date`. `delta_pct` is `null` when the previous net is 0.
- `alerts`: running-average baseline over earlier periods. Flagged when `(outcome − baseline) / baseline > threshold`.

## Frontend pattern

- `components/ui/*` = shadcn primitives. `components/dashboard/*` = domain presentational components with `loading` prop + skeleton + empty state.
- Pure logic in `lib/financial-utils.ts` with colocated Vitest tests.
- Theming via CSS variables in `index.css` (`:root` + `.dark`), exposed to Tailwind through `@theme inline`. Chart colors come from `--chart-income/outcome/profit`.

## Key decisions (inferred from code/history)

- Vite proxy instead of hardcoded backend URL (commit `eeece05`), so no env vars are needed locally or in Codespaces. `VITE_API_BASE_URL` is an optional override.
- Deterministic seed so the data is stable across requests and tests.
- Mock dates are relative to "today" so the dashboard always shows a recent year.
