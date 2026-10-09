# Tech context

## Versions (from manifests / Dockerfiles)

| Layer     | Tech                                                                 |
| --------- | -------------------------------------------------------------------- |
| Runtime   | Docker Compose. `node:24-alpine`, `python:3.13-slim`                 |
| Frontend  | React ^19.2, TypeScript ~6.0, Vite ^8 (Rolldown), Tailwind ^4.2 via `@tailwindcss/vite`, Recharts ^3.8, lucide-react, clsx + tailwind-merge, class-variance-authority |
| Lint      | ESLint 9 flat config: `@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh` |
| FE tests  | Vitest ^4 (+ `@vitest/coverage-v8`). No jsdom or Testing Library     |
| Backend   | FastAPI, Pydantic v2, uvicorn[standard], debugpy (all unpinned)      |
| BE tests  | pytest, pytest-cov, httpx                                            |

## Commands

| Purpose               | Command                                              |
| --------------------- | ---------------------------------------------------- |
| Run everything        | `docker compose up --build`                          |
| Validate frontend     | `docker compose exec frontend npm run build` (`tsc -b && vite build`) |
| Lint frontend         | `docker compose exec frontend npm run lint`          |
| Test frontend         | `docker compose exec frontend npm test`              |
| Coverage frontend     | `docker compose exec frontend npm run test:coverage` |
| Test backend          | `docker compose exec backend pytest -q`              |

## Config facts

- Path alias `@/*` → `frontend/src/*` (`tsconfig.app.json` + `vite.config.ts`).
- TS flags that bite: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`.
- `frontend/.env.example` holds only `VITE_API_BASE_URL=` (empty → use proxy). `.env*` files are git-ignored except the example.
- Backend runs under `debugpy --listen 0.0.0.0:5678` with uvicorn `--reload`.
- `backend/tests/conftest.py` adds `backend/` to `sys.path`, so run pytest from `backend/` (the container WORKDIR).

## Local machine notes (this fork's owner, macOS)

- Docker Desktop is the runtime. Its CLI lives at `~/.docker/bin/docker`, which may not be on `PATH` in non-login shells. Use `export PATH="$HOME/.docker/bin:$PATH"` if `docker` is not found.
- Host Python is 3.9 while the backend image uses 3.13. Don't run the backend or pytest on the host. Use the container.
