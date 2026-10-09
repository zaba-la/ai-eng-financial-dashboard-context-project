---
name: financial-data-formatting
description: Project rules for formatting and bucketing financial data in this dashboard. Covers money, percentages, API dates (YYYY-MM-DD), month/week/day period keys, period labels and empty placeholders. Use when adding or changing a KPI, chart, tooltip, axis tick, period label, or any code in frontend/src/lib/financial-utils.ts that turns API values into displayed text or groups movements by date.
metadata:
  author: zaba-la
  version: "1.0"
  scope: internal (this repo only)
---

# Financial data formatting (internal)

## Objective

Every number and date the dashboard shows must be formatted **one way, in one place**, and must land in the **right period regardless of the viewer's timezone**. Community skills don't cover this. It depends on this repo's API contract (`backend/app/routes.py`) and helpers (`frontend/src/lib/financial-utils.ts`).

## Inputs

Before changing anything, collect:

1. **The value and its source**: API field (`amount`, `create_date`, `income`, `net`, `delta_pct`, `period`…) or derived value (`profitPercent`…). Check the shape in `.agents/rules/api-contract.md`.
2. **Where it is displayed**: KPI card value, chart tooltip, chart axis tick, header/period label, or table cell. Each has a different format (see the table below).
3. **Grouping, if any**: day, week, or month bucketing, or a date range.

## Rules

### Money

| Context              | Format                         | How                                             |
| -------------------- | ------------------------------ | ----------------------------------------------- |
| KPI value, tooltip   | `$1,258,147` (USD, en-US, 0 dp) | `formatCurrency(value)`                        |
| Chart Y-axis tick    | `$12k`                         | `` tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} `` (existing pattern) |

- Never call `toFixed`/`toLocaleString` on money in components. Use `formatCurrency`.
- Sum raw `amount`s and format once at display time. Don't round intermediate sums. The backend already rounds its outputs to 2 dp.

### Percentages

| Context              | Format    | How                                     |
| -------------------- | --------- | --------------------------------------- |
| KPI value, tooltip   | `39.4%`   | `formatPercent(value)` (1 dp)           |
| Chart Y-axis tick    | `40%`     | `` tickFormatter={(v) => `${v.toFixed(0)}%`} `` |

- Profit margin = `profit / income * 100`. When income is `0`, the margin is `0`, never `NaN`/`Infinity`.
- Backend ratios differ: `increase_ratio` is a fraction (0.35 = 35 %) and `delta_pct` is already a percent and may be `null`. Convert or guard explicitly. Show `—` for `null`.

### Dates and periods (the important part)

- API dates are **calendar dates without a timezone** (`"2025-12-01"`).
- **Never** do `new Date("YYYY-MM-DD")` and then use local getters (`getMonth()`, `getDate()`, `getFullYear()`). JS parses that string as UTC midnight, so in any UTC− timezone (all of the Americas) the 1st of a month becomes the last day of the previous month.
- Derive keys from the string itself:
  - month key: `create_date.slice(0, 7)` → `"2025-12"`
  - day key: `create_date` as-is
- Backend period keys (`/api/metrics/summary`, `/alerts`): day `YYYY-MM-DD`, week `YYYY-Www` (ISO week), month `YYYY-MM`. They sort correctly as strings.
- Month label: build a **local** date from parts, `new Date(year, monthIndex, 1)`, then `toLocaleDateString("en-US", { month: "short", year: "numeric" })` → `"Dec 2025"`. Use `formatMonthYearLabel` in `financial-utils.ts`.
- Period/range label: **derive it from the data** (first and last month, e.g. `"Oct 2025 – Sep 2026"`, en dash with spaces). Never hardcode a year. The backend always returns the 12 months before the current month.

### Placeholders and locale

- Missing or not-yet-loaded value: `—` (em dash). Empty chart: `"No data available to display"`.
- Locale is `en-US` and currency is `USD` everywhere, defined only in `financial-utils.ts`.

## Procedure

1. Find or add a **pure** helper in `frontend/src/lib/financial-utils.ts`. Components only call helpers, they never format inline (except the two axis tick patterns above).
2. Add or extend tests in `frontend/src/lib/financial-utils.test.ts`. Any date logic **must** have a case on the 1st of a month and a case crossing a year boundary.
3. Run the acceptance checks below.

## Expected output

- A diff limited to `financial-utils.ts`, its test file, and the components or `App.tsx` that consume the helper.
- A short note: which rule above the change follows, and the test that proves it.

## Acceptance criteria

All must hold. Report the command output.

- [ ] `docker compose exec -e TZ=America/Mexico_City frontend npm test` passes. A UTC− timezone is mandatory, because the default container TZ is UTC and hides date bugs.
- [ ] `docker compose exec frontend npm test` passes (UTC).
- [ ] `docker compose exec frontend npm run build` and `npm run lint` pass.
- [ ] `grep -rn "new Date(.*create_date" frontend/src` returns nothing.
- [ ] No hardcoded years in UI strings: `grep -rnE "\b20[0-9]{2}\b" frontend/src --include='*.tsx'` returns nothing.
- [ ] In the browser, KPI totals match the sum of `/api/metrics` and each chart shows exactly 12 months.
