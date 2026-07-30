# Claude Code Instructions — site-template

## What this repo is
A cloneable Next.js 15 starter pre-wired for the shared VPS infra (vethaul-infra). It is not a finished site. The deploy pipeline is production-ready; the UI is a skeleton meant to be replaced.

## Token Optimization Rules
- Read `docs/CURRENT_PROGRESS.md` first before changing anything.
- Do not reread every doc on every turn.
- Only open docs needed for the current task.
- Prefer editing existing files over regenerating entire files.
- After each completed task, update `docs/CURRENT_PROGRESS.md` in place.
- When uncertain, ask one targeted question instead of making broad assumptions.
- Do not start building until you are 90% sure what the ask is.

## What's reusable vs what needs to be rebuilt
See `docs/CURRENT_PROGRESS.md` for the full breakdown. Short version:
- **Copy-paste:** Dockerfile, docker-compose.prod.yml, scripts/, lib/db.ts, health route, GitHub Actions
- **Skeleton only:** Header, footer, layout, page structure — replace all content and styles
- **Delete and rebuild:** Admin page, DB schema, all images, all copy, all colors

## Technical Rules
- Use Next.js App Router
- Use TypeScript
- Keep styling simple and production-friendly
- Use Postgres for data (via shared infra-postgres)
- HOSTNAME: "0.0.0.0" must stay in docker-compose.prod.yml — required for Docker healthcheck

## Shared Infra Dependency
- Docker network: `vethaul-net` (external)
- Container name in docker-compose.prod.yml must be unique per site
- DB must be provisioned via `vethaul-infra/scripts/add-site.sh` before first deploy

## Scope Rules
Do not add features, refactor, or introduce abstractions beyond what the current site task requires.

## Deploy Workflow
```
git push origin main
```
GitHub Actions handles the rest. See `SETUP.md` for first-time setup.
