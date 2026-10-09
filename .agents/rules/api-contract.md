# API contract between frontend and backend

The frontend's TypeScript types mirror the backend's Pydantic models by hand. There is no codegen. Keep them in sync.

| Backend (`backend/app/routes.py`)           | Frontend (`frontend/src/lib/financial-types.ts`) |
| ------------------------------------------- | ------------------------------------------------ |
| `OperationType = Literal["income","outcome"]` | `OperationType = 'income' \| 'outcome'`          |
| `Category = Literal[...5 values]`            | `Category = ...same 5 values`                     |
| `BusinessType = Literal["B2B","B2C"]`        | `BusinessType = 'B2B' \| 'B2C'`                   |
| `FinancialMovement` (`create_date: date`)    | `FinancialMovement` (`create_date: string`, ISO)  |

Frontend-only derived types: `KPIMetrics`, `MonthlyDataPoint` (camelCase, computed in `financial-utils.ts`).

## Rules

- JSON fields are `snake_case` on the wire. Frontend types for API payloads keep `snake_case`. Derived/view types may be camelCase.
- When adding or changing a backend model or Literal, update `financial-types.ts` in the same change, and vice versa.
- When the frontend starts consuming an endpoint it doesn't use yet, add the response type to `financial-types.ts` mirroring the backend `response_model`.
- Breaking a response shape requires updating every consumer and the tests on both sides.

## Endpoints (source of truth: http://localhost:8000/docs)

| Method + path                       | Params                                                                                  | Response                    | Used by frontend |
| ----------------------------------- | --------------------------------------------------------------------------------------- | --------------------------- | ---------------- |
| `GET /health`                       | —                                                                                       | `{status: "ok"}`            | no               |
| `GET /api/metrics`                  | `start_date`, `end_date`, `category`, `operation_type`                                  | `FinancialMovement[]`       | **yes** (only call) |
| `GET /api/metrics/b2b`, `/b2c`      | same as above                                                                           | `FinancialMovement[]`       | no               |
| `GET /api/metrics/facets`           | —                                                                                       | `MetricsFacets`             | no               |
| `GET /api/metrics/summary`          | `group_by` (day\|week\|month, default month), dates, `category`, `operation_type`, `business_type` | `MetricsSummaryItem[]` (`period`, `income`, `outcome`, `net`) | no |
| `GET /api/metrics/categories/top`   | `operation_type` (default outcome), `limit` 1–20 (default 5), dates, `business_type`    | `TopCategoryItem[]`         | no               |
| `GET /api/metrics/comparison`       | **required** `start_date`, `end_date`; `business_type`                                  | `MetricsComparison` (`delta_pct` may be `null`) | no |
| `GET /api/metrics/alerts`           | `threshold` ≥ 0 (default 0.3), `group_by`, dates, `business_type`                        | `MetricsAlert[]`            | no               |

Dates are `YYYY-MM-DD`, inclusive on both ends. Period keys: day `YYYY-MM-DD`, week `YYYY-Www` (ISO), month `YYYY-MM`.

Today the frontend aggregates client-side from `/api/metrics`. The backend already has `/summary`, `/comparison`, etc. Prefer server aggregation for new features instead of duplicating logic in `financial-utils.ts`.
