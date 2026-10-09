# Workflow: run, validate, finish

Applies to every task in this repo.

## Before starting

1. Read `AGENTS.md`, every file in `.agents/rules/`, and `memory-bank/activeContext.md` + `memory-bank/progress.md`.
2. Check `git status`. Work on a feature branch (`feature/<topic>`), never directly on `main`.

## Running the app

The only documented way to run the project is Docker Compose (see `README.md`, `docker-compose.yml`):

```bash
docker compose up --build        # add -d to run detached
docker compose down              # stop
```

| Service  | URL                          | Notes                                              |
| -------- | ---------------------------- | -------------------------------------------------- |
| frontend | http://localhost:5173        | Vite dev server, hot reload via bind mount         |
| backend  | http://localhost:8000        | uvicorn `--reload`; `/` returns 404 by design       |
| API docs | http://localhost:8000/docs   | FastAPI Swagger UI                                 |
| debugpy  | localhost:5678               | Attach a Python debugger to the backend container  |

- The Vite proxy forwards `/api` to `http://backend:8000`. That hostname only resolves **inside** the Compose network, so running `npm run dev` on the host breaks `/api` calls unless `frontend/.env` sets `VITE_API_BASE_URL=http://localhost:8000`.
- Do not assume Node or Python are installed on the host with the right versions (containers use `node:24-alpine` and `python:3.13-slim`). Run tooling inside the containers.

## Validation commands (run inside the containers)

With the stack up, run from the repo root:

| Check              | Command                                              | What it proves                         |
| ------------------ | ---------------------------------------------------- | -------------------------------------- |
| Frontend build     | `docker compose exec frontend npm run build`         | `tsc -b` type check + Vite production build. **This is the frontend validation gate.** |
| Frontend lint      | `docker compose exec frontend npm run lint`          | ESLint (typescript-eslint, react-hooks, react-refresh) |
| Frontend tests     | `docker compose exec frontend npm test`              | Vitest (`*.test.ts` next to source)    |
| Backend tests      | `docker compose exec backend pytest -q`              | pytest + FastAPI `TestClient`          |

Known, accepted output: the build warns that the main chunk is > 500 kB (Recharts). Not a failure.

## Definition of done

A change is done only when:

1. The checks for every layer you touched pass (frontend: build + lint + test; backend: pytest). Report the actual command output, never "should pass".
2. New logic has tests (see `frontend.md` / `backend.md`).
3. If you changed an API shape, both sides were updated in the same change (see `api-contract.md`).
4. `memory-bank/activeContext.md` and `memory-bank/progress.md` reflect what changed.

## Git

- Small, focused commits with conventional prefixes (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`), matching existing history.
- Never commit `.env`, `frontend/dist/`, `node_modules/`, caches (all in `.gitignore`).
