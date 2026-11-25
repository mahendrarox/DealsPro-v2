# Working rules

Binding for every agent and every change in this repo. The spec
(`docs/use-cases-v2-revised.md`) owns requirements; this file owns how we
work. `HANDOFF.md` is the live board.

## One at a time
- **One use case per change.** Never batch. A PR that touches two UCs
  should be two PRs.
- **Three repair attempts per root defect**, then stop and report. Do not
  keep trying variations — report what was tried, what was learned, and
  what is blocked. A fourth attempt is a decision for Mahendra, not the agent.

## Traceability — spec UC → issue → PR/commit → acceptance test
- Every change references a UC number.
- GitHub issue titles carry `[UC-NNN]`. Commit subjects carry `[UC-NNN]`.
- Every case needs an acceptance test named `test_ucNNN_…`.
- `npm run rtm` regenerates `docs/RTM.md`. **Commit it with every release.**
- `npm run rtm:check` runs in CI and fails on a test naming a case the
  spec does not define.
- The repo is the board. Linear is not used for build tracking.

## Receipts
No change is done until Mahendra has seen a **plain-words receipt**:
two or three lines — what changed, why — plus a preview link. Not a diff,
not a test log. If he has not seen it, it is not done.

## Never
- Never merge to `main` without Mahendra's approval.
- Never auto-publish. Two human gates, always: the restaurant confirms the
  exact offer version, and Mahendra authorizes every publish.
- Never move real money. Staging carries test Stripe keys only; startup
  refuses a live key outside production.
- Never send SMS outside staging, and not even there without an explicit
  allow flag.
- Never copy prototype HTML into production code. It is a visual reference.
- Never recreate requirements from memory. Read the spec.

## Environments
Staging and production are separate by construction: separate Supabase
projects, Stripe test vs live, secrets per environment in Vercel.
`lib/env/guards.ts` enforces this at startup and refuses to boot otherwise.
**Production deploy requires Mahendra's explicit approval every time.**

## Tests
- `npm test` — typecheck, unit guards, RTM check. Must pass before any merge.
- `npm run test:e2e` — Playwright, mobile-first. Phone is the primary
  project; desktop runs second.
- CI runs on every push and PR. Green is the gate, not a nice-to-have.
