# Progress

## Works

- Docker Compose stack: frontend :5173, backend :8000, Swagger at `/docs`.
- Dashboard: 4 KPI cards + Income vs. Outcome chart + Profit Margin % chart, with loading skeletons, empty states and an error banner. Header shows the real data range (e.g. "Oct 2025 – Sep 2026").
- Backend endpoints: `/health`, `/api/metrics` (+ `/b2b`, `/b2c`), `/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, all tested.
- Quality gates green as of 2026-10-09: `npm run build` (no warnings), `npm run lint`, `npm test` (9, in UTC and `TZ=America/Mexico_City`), `pytest` (15). Lighthouse accessibility 100.

## Agent skills (branch `feature/agent-skills`, 2026-10-09)

Community skills were installed with `npx skills add` into `.agents/skills/` (`.claude/skills` is a symlink to it), with versions pinned in `skills-lock.json`. The internal skill lives in `.skills/financial-data-formatting/` (course requirement) and is symlinked into `.agents/skills/` (repo convention from `AGENTS.md`).

| Skill | Source | Type | Commit |
| ----- | ------ | ---- | ------ |
| `accessibility` | `addyosmani/web-quality-skills` | community (required) | `18483d6` |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | community (required) | `babd106` |
| `fastapi` | `fastapi/fastapi` | ecosystem (own choice) | `29b4efc` |
| `financial-data-formatting` | this repo (`.skills/`) | internal | `12bd54f` |

### Verified changes per skill

**accessibility**. Audit: Lighthouse (100 before and after) plus manual checks of the accessibility tree, keyboard and contrast.
- Chart SVGs were keyboard-focusable (`role="application"`) with no name, so they got Recharts `title`/`desc` (text alternatives, ARIA names).
- Card and KPI titles were `div`/`span`, so they became `h2` under the `h1` (heading structure).
- The error banner got `role="alert"`, and sections get `aria-busy` while loading (live regions).
- The skeleton pulse now respects `prefers-reduced-motion`.
- The `<title>` changed from "frontend" to a descriptive title (2.4.2).
- Already OK, no change: contrast (text ≥ 5.1:1, chart strokes ≥ 5.1:1), visible keyboard focus, lucide icons `aria-hidden`, `lang="en"`.

**vercel-react-best-practices** (Vite SPA, so the Next-only rules don't apply):
- `bundle-dynamic-imports`: charts load with `React.lazy` + `Suspense`. Main chunk went from 584 kB to 188 kB and the build warning is gone.
- `async-suspense-boundaries` (avoid layout shift): the fallback is `ChartCardSkeleton`, with the same 280 px footprint.
- `rerender-derived-state-no-effect`: only `movements` is kept in state. KPIs and the monthly series are derived during render.
- `js-combine-iterations`: `computeKPIs` now makes a single pass.
- Skipped with reason: `next/image` (no rendered images), `server-*` (no SSR), `bundle-barrel-imports` (the fix is Next-only, and Vite tree-shakes).

**fastapi** (ecosystem choice). Why this one: `npx skills find` was run for `testing`, `typescript`, `fastapi` and `vitest`. The official FastAPI skill covers the backend, which is half of the repo and untouched by the other two skills. Its rules map 1:1 onto `routes.py` (`Annotated`, no Ellipsis, return types). `antfu/skills@vitest` was the runner-up, but the frontend was already covered.
- Query params use `Annotated` with reusable aliases, `Query(...)` is gone, redundant `response_model=` was removed, and `filter_by_business_type()` was extracted.
- Verified: identical responses, 422s and OpenAPI params for 14 requests before and after; pytest 15/15.

**financial-data-formatting** (internal). Gap: the money/percent/date/period rules are specific to this API and `financial-utils.ts`, and no community skill covers them. It has an objective, inputs, rules, procedure, expected output and acceptance criteria.
- Validated on a real task: it found `new Date(create_date)` and the hardcoded "2024". The timezone bug was reproduced with a test under `TZ=America/Mexico_City` (it passes in UTC, which is why it was hidden), then fixed. The period label is now derived from the data.

## Not built yet

- Frontend uses only `/api/metrics`. No filters (date range, category, B2B/B2C), no comparison, top categories or alerts UI.
- No component tests (no jsdom / Testing Library).
- No CI workflow. If added, run frontend tests under a UTC− `TZ` too.

## Known issues

1. ~~Hardcoded period label~~: fixed in `12bd54f`.
2. ~~Timezone month shift in `computeMonthlyData`~~: fixed in `12bd54f`, with a regression test.
3. ~~Bundle size warning~~: fixed in `babd106` (code-split charts).
4. **Dead code**: `frontend/src/lib/mock-data.ts` (2024 static data) and `frontend/src/assets/hero.png` are not imported anywhere.
5. ~~`index.html` title is the scaffold default~~: fixed in `18483d6`.
6. Backend dependencies are unpinned (`requirements.txt`), so builds are not reproducible.
7. `index.css` declares the `Inter` font but never loads it, so the system font is used. Harmless, but misleading.
8. Editing files while Vite runs can crash the container (`ENOENT` on an atomic save over the bind mount). Fix with `docker compose start frontend`.
