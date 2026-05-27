# Claude Code Instructions for VetHaul

## Mission
Build VetHaul as a clean, premium, conversion-focused junk removal site.

## Token Optimization Rules
- Read `docs/CURRENT_PROGRESS.md` first before changing anything.
- Then read `docs/REPO_MAP.md` only once at the start of a session if you need orientation.
- Do not reread every doc on every turn.
- Only open the docs needed for the current task.
- Work in small batches.
- Prefer editing existing files over regenerating entire files.
- Keep status updates short and specific.
- After each completed task, update `docs/CURRENT_PROGRESS.md` in place.
- When uncertain, ask one targeted question instead of making broad assumptions.
-do not start building until you are 90% sure what the ask is.  continue to ask questions until you are 90% sure
- Treat the code already in `app/`, `components/`, and `public/` as the active baseline unless told otherwise.

## Current Working Baseline
- The active codebase is the Next.js app at the project root.
- The homepage already uses the 3 approved uploaded photos.
- Shared layout, header, footer, and starter core pages exist.
- Continue from the current code rather than rebuilding from scratch.

## Product Priorities
1. Trust
2. Conversion
3. Simplicity
4. Low cost to launch
5. Clean upgrade path later

## Design Rules
- Modern / premium, not rugged / patriotic
- Use whitespace, restrained typography, strong hierarchy
- Before/after image belongs in hero
- Working image belongs in process / how-it-works section
- Truck/team portrait belongs in trust / about section
- Veteran-owned should be visible, but subtle
- Avoid clutter, noisy gradients, and stock-photo feel

## Technical Rules
- Use Next.js App Router
- Use TypeScript
- Keep styling simple and production-friendly
- Prefer server-side pricing logic later, not hardcoded in UI only
- Use Postgres for real data
- Keep first release thin but correct
- Defer advanced automations until MVP works

## Scope Rules
Do not jump ahead unless explicitly asked.

Official sequence:
- Day 1: visual direction
- Day 2: foundation
- Day 3: core pages + routing
- Day 4: trust/reviews polish
- Day 5+: booking flow, API, Postgres, deploy

## Asset Usage
Use these exact assets unless told otherwise:
- `public/hero-before-after.png`
- `public/crew-working.png`
- `public/owners-truck.png`
- `assets/original-logo-reference.png` as branding reference only

## Definition of MVP
The MVP is done when:
- site looks premium and trustworthy
- core pages exist
- customer can submit booking request
- booking is stored in Postgres
- confirmation is sent
- owner can view booking internally

## Feature Discipline

Claude must:
- follow FEATURES.md strictly
- respect phase boundaries
- not introduce AI features early

## AI Usage

When implementing AI:
- use external APIs
- keep logic modular
- always include fallback behavior
- log outputs for debugging

## Priority Order

1. Booking flow
2. Data storage
3. Notifications
4. Admin
5. Automation
6. AI

## Deployment Discipline

Claude must:
- follow DEPLOYMENT_PLAN.md for production setup
- assume single VPS architecture first
- avoid introducing managed services unless requested

## Production Rules

- keep system simple
- use Docker Compose
- keep DB and app co-located initially
- prioritize reliability over complexity