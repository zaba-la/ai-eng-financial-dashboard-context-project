# Active context

_Last updated: 2026-10-09_

## Current focus

Branch `feature/agent-skills`: course exercise "apply agent skills". Pushed, PR open: https://github.com/zaba-la/ai-eng-financial-dashboard-context-project/pull/1

1. Discovered and installed `accessibility` + `vercel-react-best-practices`.
2. Applied both (agent-led, verified).
3. Explored the ecosystem (`testing`, `typescript`, `fastapi`, `vitest`) and applied `fastapi`.
4. Authored the internal skill `financial-data-formatting` and validated it on the timezone and period-label bugs.

Details and the rationale per skill are in `progress.md` → Agent skills.

## Recent changes

- 2026-10-09: rules + memory bank generated from the code (`57d527c`).
- 2026-10-09: skills installed and applied (`f6e1560`, `18483d6`, `babd106`, `29b4efc`, `12bd54f`).

## Open decisions / next steps

- Review and merge PR #1 (no CI on the repo; all checks were run locally).
- The internal skill lives in `.skills/` (course rubric) and is symlinked into `.agents/skills/` (repo convention). `AGENTS.md` documents both.
- Candidate internal skills next: "add backend endpoint + test", "pre-merge QA".
- Remove dead code (`mock-data.ts`, `hero.png`)?
