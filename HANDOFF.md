# HANDOFF — DealsPro-v2

The shared board for this repo. Every agent working here (Claude Code, ChatGPT, Muse) reads this file first. One task at a time; the human (Mahendra) is the trigger and the approver.

## Current task

- **Test gate + repo skeleton** — Issue #1. Setup only, no features. Status: waiting for Mahendra to paste the task into Claude Code on the web. Done when CI is green on main with the Playwright scaffold passing.
- Do NOT start Scout until the test gate is green and Mahendra says go.

## What's done

- Master spec V2.20 (587 cases, UC-001–UC-606, §§1–53) is in the repo at `docs/use-cases-v2-revised.md` (commit c42f4970). It is the single home for requirements; every change references a UC number.
- Repo is private: mahendrarox/DealsPro-v2, default branch `main`.
- Build approach (locked): one agent at a time (Scout first, then Hunter, then the rest); one use case at a time; staging first; production iteratively, each release approved by Mahendra; 3-repair limit per root defect; two human gates (restaurant confirms the offer, Mahendra authorizes every publish — no auto-publish ever); money reconciles to the cent before real money; staging/production fully separate (separate Supabase projects, Stripe test vs live); V1 live site untouched.
- Receipt rule: no change counts as done until Mahendra has seen a plain-words receipt (2–3 lines: what changed, why) + a preview link. One change at a time.
- Owner principle: Mahendra is the first user, not just the approver.
- Repo is the board: GitHub Issues + Projects is the tracker. Linear is NOT used for build tracking (MAH-5 stays as the Scout record only). RTM: spec UC → GitHub issue `[UC-NNN]` → PR/commit → acceptance test; RTM report committed with every release.
- Continuous delivery: automated tests are the gate (suite green + CI on every change). No upfront agreement phase.

## What's next (in order)

1. Test gate (Issue #1) — in progress.
2. Scout — first slice: area search → ranked top-10 shortlist with evidence (area picker State → Metro → Sub-city, default Texas → DFW → Frisco; segment + sub-segment; Scout score + Quality/Demand/Offer-fit breakdown; "Why this merchant, why now"). Scout never contacts anyone; runs weekly sweeps + scout-now button; shortlist sits at "Needs review" until Mahendra picks 1–3. (Linear MAH-5 is the old record of this; the build issue will be a GitHub issue.)
3. Hunter — drafts up to 5 Drops per picked merchant, one live at a time; restaurant confirms each, Mahendra authorizes each publish.
4. Then the rest, one agent and one use case at a time.

## Open questions (do not decide these alone — ask Mahendra)

- §55 SMS list-building & RCS Drop cards (UC-607–UC-612, PROPOSED) — yes or no?
- HyperDrop.ai purchase — bought yet?
- ChatGPT–GitHub connection — done yet?
- §49 / §51 / §52 / §53 confirmations (open items 30, 32, 33, 34 in the spec).
- Commission form and Stripe allocation (Case A vs B); $99–$199/mo vs $0-to-list + ~12%.

## Rules for agents working here

- Read the spec from `docs/use-cases-v2-revised.md` — never recreate requirements from memory.
- One use case at a time. One change at a time. Never batch 10.
- Never merge to main without Mahendra's approval. Never auto-publish. Never move real money.
- Old code is forgotten; reference it only case by case when a need arises (QR code is the named example).
- Update this file when the current task changes: move the finished task to "What's done", set the new current task, add open questions the same day they arise.
