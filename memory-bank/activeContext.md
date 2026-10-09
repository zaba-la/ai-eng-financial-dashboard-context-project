# Active context

_Last updated: 2026-10-09_

## Current focus

Branch `feature/agent-skills`. Next step of the course: create agent skills under `.agents/skills/<skill-name>/SKILL.md`.

## Recent changes

- 2026-10-09: generated `.agents/rules/` (workflow, frontend, backend, api-contract) and this `memory-bank/` from code inspection. Baseline verified at the same time: frontend build, lint and 5 Vitest tests pass; backend 15 pytest tests pass.

## Open decisions / next steps

- Decide which skills to add (candidates: "add backend endpoint + test", "add dashboard chart/KPI card", "run validation suite").
- Header period badge is hardcoded (`"2024 - Full Year"`) while data covers the last 12 months. Fix or leave it? (see `progress.md`)
