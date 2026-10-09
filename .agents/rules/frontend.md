# Frontend rules (`frontend/`)

Stack: React 19 + TypeScript 6 (strict-ish, see `tsconfig.app.json`) + Vite 8 + Tailwind CSS 4 + shadcn/ui primitives ("new-york", zinc) + Recharts 3 + lucide-react. Tests with Vitest 4.

## Structure

```text
src/
├─ App.tsx                     # data fetching + page layout (single page, no router)
├─ main.tsx                    # entry, StrictMode
├─ index.css                   # Tailwind import + design tokens (CSS variables)
├─ components/
│  ├─ ui/                      # shadcn primitives (card, skeleton). Generic, no domain logic.
│  └─ dashboard/               # domain components (kpi-card, kpi-row, charts, chart-card-skeleton, header)
└─ lib/
   ├─ financial-types.ts       # domain types mirroring the backend models
   ├─ financial-utils.ts       # pure calculations + formatters
   ├─ financial-utils.test.ts  # unit tests for the above
   └─ utils.ts                 # cn() = clsx + tailwind-merge
```

- Put new domain UI in `components/dashboard/`, new shadcn primitives in `components/ui/`.
- Put calculations and formatting in `lib/` as **pure functions**, never inline in components. Components only render.
- `lib/mock-data.ts` and `assets/hero.png` are currently unused. Don't wire them in without a reason. The app reads real data from the API.

## Conventions

- **Imports**: use the `@/` alias for anything under `src/` (`@/lib/...`, `@/components/...`); relative imports only for siblings in the same folder (e.g. `./kpi-card`).
- **Type-only imports** must use `type` (`verbatimModuleSyntax` is on): `import { type MonthlyDataPoint } from '@/lib/financial-types'`.
- `erasableSyntaxOnly` is on: no `enum`, no `namespace`, no constructor parameter properties. Use string-literal unions (as in `financial-types.ts`).
- `noUnusedLocals` / `noUnusedParameters` are on. Unused code breaks `npm run build`.
- Files: kebab-case (`income-outcome-chart.tsx`). Components: PascalCase named exports (`export function KPICard`). Only `App.tsx` uses a default export.
- Props: declare a local `interface <Component>Props`. Optional flags such as `loading?: boolean`.
- Formatting of money/percent goes through `formatCurrency` / `formatPercent` in `financial-utils.ts` (USD, `en-US`, no decimals; percent one decimal).

## Styling

- Tailwind utility classes only, no CSS modules or inline style objects (except Recharts props and dynamic colors).
- Use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`), never raw colors. Domain colors live in `index.css` as CSS variables: `--chart-income`, `--chart-outcome`, `--chart-profit`, `--income-badge(-fg)`, `--outcome-badge(-fg)`, `--profit-badge(-fg)`. Define new ones in **both** `:root` and `.dark`.
- The app forces dark mode via `className="dark"` on `<main>` in `App.tsx`.
- Merge classes with `cn()` from `@/lib/utils`.

## Component patterns (follow existing ones)

- Accessibility and React performance follow the installed skills `.agents/skills/accessibility` and `.agents/skills/vercel-react-best-practices`. In this repo: section/card titles are `h2`; charts pass `title` + `desc` to the Recharts chart; error banners use `role="alert"`; heavy chart components load with `React.lazy` + `Suspense` and a `ChartCardSkeleton` fallback; derive values from state during render instead of storing them.

- Every data component handles three states: **loading** (render `Skeleton` blocks with the same footprint), **empty** ("No data available to display"), **data**.
- Charts: wrap in `Card` → `CardHeader` (title + description) → `CardContent` → `ResponsiveContainer height={280}`. Axis ticks use `var(--color-muted-foreground)`, grid uses `var(--color-border)`. Custom tooltips are local `CustomTooltip` components.
- Data fetching lives in `App.tsx` (`fetch` + `useEffect`, no data library). Only the raw `movements` are kept in state. Base URL: `import.meta.env.VITE_API_BASE_URL ?? ""` + `/api/...`. Fetch errors set a user-facing message (currently in Spanish) and the page keeps rendering.

## Dates

- API dates are timezone-less `YYYY-MM-DD` strings. Never `new Date("YYYY-MM-DD")` + local getters: it parses as UTC midnight and shifts the 1st into the previous month in the Americas. Use string slicing (`create_date.slice(0, 7)`).
- Any change to money, percent, date or period formatting must follow `.skills/financial-data-formatting/SKILL.md`, including its acceptance checks (tests under `TZ=America/Mexico_City`).

## Tests

- Vitest, colocated as `<module>.test.ts`. Test every exported function in `lib/` including edge cases (no income → 0 %, cross-year ordering, rounding).
- Component tests are not set up (no jsdom / Testing Library installed). Ask before adding dependencies.
