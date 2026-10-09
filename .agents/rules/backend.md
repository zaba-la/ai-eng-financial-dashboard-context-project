# Backend rules (`backend/`)

Stack: Python 3.13 + FastAPI + Pydantic v2 + uvicorn. Tests with pytest + `fastapi.testclient`. Dependencies in `backend/requirements.txt` (unpinned).

## Structure

```text
backend/
├─ app/
│  ├─ main.py      # FastAPI app, CORS middleware, include_router
│  └─ routes.py    # types, Pydantic models, mock data generator, pure helpers, endpoints
└─ tests/
   ├─ conftest.py  # puts backend/ on sys.path
   └─ test_routes.py
```

Everything domain-related lives in `app/routes.py`, ordered as: type aliases → Pydantic models → private builders → pure helper functions → `@router.get` endpoints. Keep that order. If the file grows a lot, propose splitting into `models.py` / `services.py` before doing it.

## Data source

- There is **no database**. Every request calls `generate_mock_movements(seed=42)`: 12 months × 30 movements = 360 records, sorted by `create_date`, covering the **last 12 months relative to today** (`_year_for_month`). Values are deterministic for a given day, but dates roll forward over time. Never hardcode years in code or tests.
- `random.seed()` mutates the global `random` state. Don't add other `random` calls on the request path without accounting for that.
- Income: category `sales` (90 %) or `others`, amount 800–12 000. Outcome: `suppliers|operational|administrative|others`, amount 500–9 000. B2B ≈ 55 %.

## Conventions

- Domain enums are `Literal` aliases (`OperationType`, `Category`, `BusinessType`, `GroupBy`). Reuse them in models and query params so FastAPI validates input (invalid value → 422).
- Follow the installed `fastapi` skill (`.agents/skills/fastapi/SKILL.md`). In this repo that means:
  - Every endpoint declares a **return type** (`-> list[FinancialMovement]`). That return type is the response model. Add `response_model=` only when the public schema differs from what the function returns.
  - Query params use `Annotated[...]` with the default as the plain default value. Reuse the module-level aliases (`StartDateQuery`, `EndDateQuery`, `CategoryQuery`, `OperationTypeQuery`, `BusinessTypeQuery`, `GroupByQuery`). Bounds go inside `Query`: `limit: Annotated[int, Query(ge=1, le=20)] = 5`.
  - Required params have no default: `start_date: Annotated[date, Query()]`. Never use `...` (Ellipsis).
  - Endpoints stay sync `def` (no awaitable work inside).
- Business logic goes in **pure helper functions** that take `list[FinancialMovement]` and return data (`filter_by_business_type`, `filter_movements`, `summarize_movements`, `build_top_categories`, `calculate_net_value`, `detect_outcome_alerts`). Endpoints only compose: generate → `filter_by_business_type` → `filter_movements` → helper → return.
- Money is rounded with `round(x, 2)` at the output boundary. Ratios use `round(x, 4)` and percents `round(x, 2)`.
- Field names are `snake_case`. All public routes are under `/api/metrics...`, except `/health`.
- `from __future__ import annotations` at the top. Use `X | None` unions, built-in generics (`list[...]`, `dict[...]`).

## Tests

- Add at least one test per new endpoint or helper in `tests/test_routes.py`: status code, shape, filter correctness, ordering.
- Use `generate_mock_movements(seed=42)` or the API's own first record for fixtures. Never hardcode dates or totals, because they change with the current date.
- Run: `docker compose exec backend pytest -q`.

## Don'ts

- Don't add a database, auth or new dependencies without asking.
- Don't tighten CORS (`allow_origins=["*"]`) without checking the frontend dev flow.
- Don't add a `/` route just to "fix" the 404. It is expected.
