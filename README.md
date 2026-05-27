# VetHaul Claude Code Project v2

This is the working Claude Code handoff package for building VetHaul end to end with minimal wasted context.

It now includes:
- the current Next.js codebase at the project root
- docs that explain product, architecture, build plan, schema, API, hosting, and current progress
- config examples for local and production setup
- the approved image assets

## Start here
1. `CLAUDE.md`
2. `docs/CURRENT_PROGRESS.md`
3. `docs/REPO_MAP.md`
4. `docs/RUN_LOCALLY.md`
5. `docs/IMPLEMENTATION_PLAN.md`

## What is already included
- current homepage implementation using the 3 approved images
- shared layout and navigation
- starter components
- core pages scaffold
- docs and configs for end-to-end build

## Project structure
- `app/` Next.js App Router pages
- `components/` shared UI
- `public/` approved images for the site
- `docs/` planning and implementation docs
- `db/` Postgres schema
- `config/` Caddy, Docker Compose, env examples
- `assets/` original source images and references
- `prompts/` focused prompts for Claude Code

## How to run locally
See `docs/RUN_LOCALLY.md`.

## Important note on scope
The current codebase contains the approved visual direction plus some preview work beyond strict Day 2. Follow `docs/IMPLEMENTATION_PLAN.md` for the official sequence going forward and use `docs/CURRENT_PROGRESS.md` as the source of truth.
