# Progress

## Works

- Docker Compose stack: frontend :5173, backend :8000, Swagger at `/docs`.
- Dashboard: 4 KPI cards + Income vs. Outcome chart + Profit Margin % chart, with loading skeletons, empty states and an error banner.
- Backend endpoints: `/health`, `/api/metrics` (+ `/b2b`, `/b2c`), `/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, all tested.
- Quality gates green as of 2026-10-09: `npm run build`, `npm run lint`, `npm test` (5), `pytest` (15).

## Not built yet

- Frontend uses only `/api/metrics`. No filters (date range, category, B2B/B2C), no comparison, top categories or alerts UI.
- No component tests (no jsdom / Testing Library).
- No CI workflow.
- `.agents/skills/` is empty.

## Known issues

1. **Hardcoded period label**: `App.tsx` passes `period="2024 - Full Year"`, but the API returns the 12 months before the current month (e.g. 2025-10 → 2026-09). `DashboardHeader` also has its own different default (`'2024 — Full Year'`, em dash).
2. **Timezone month shift**: `computeMonthlyData` does `new Date("YYYY-MM-DD")` (UTC) then `getMonth()` (local). In UTC− timezones, movements dated the 1st are counted in the previous month. As of 2026-10-09, 16 of 360 records fall on the 1st. If one is in the earliest month, it creates an extra month bucket. Tests don't catch it because the fixtures avoid day 1.
3. **Bundle size warning**: main chunk ~584 kB (> 500 kB Vite warning), mostly Recharts. Cosmetic.
4. **Dead code**: `frontend/src/lib/mock-data.ts` (2024 static data) and `frontend/src/assets/hero.png` are not imported anywhere.
5. `index.html` title is still the scaffold default `frontend`.
6. Backend dependencies are unpinned (`requirements.txt`), so builds are not reproducible.
