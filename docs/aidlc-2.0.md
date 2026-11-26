# AIDLC 2.0 — architecture as implemented

Source records: Issue #4 (the task record for the Claude trigger) and
`.github/workflows/claude-task.yml` (the trigger workflow on `main`). Where
this page and those differ, they win. Requirements live only in
`docs/use-cases-v2-revised.md`; how we work lives in `WORKING-RULES.md`.

## The pipeline

owner → GitHub Issues → Claude trigger → PR → CI → independent review → owner merge

1. The owner writes an Issue and approves it by adding the `approved-task` label.
2. The Claude trigger workflow starts, but only for that label added by the
   repository owner on an open Issue. A comment or an `@claude` mention never
   starts it.
3. Claude builds on a feature branch and opens a pull request against `main`.
4. CI runs on the PR and must be green.
5. A reviewer other than the author reviews the PR.
6. The owner merges. Nothing merges itself.

GitHub is the single source of truth. Claude Code is the only implementation
agent; Codex reviews; Muse assists.

## The five-gate merge contract

A change merges only when all five hold:

1. **Approved requirements** — the Issue the work was built from.
2. **Automated verification** — CI is green on the exact head being merged.
3. **Independent review** — a reviewer who is not the author. The author's own
   self-review does not count.
4. **Verified evidence** — claims about the change are checked against the
   code and the CI results, not taken on trust.
5. **Owner authorization** — the owner decides to merge.

## The four-label state machine

| Label | Meaning |
|---|---|
| `approved-task` | The owner has approved the Issue; it may be built. |
| `building` | The trigger has claimed the Issue and a run is in progress. |
| `ready-for-review` | The run finished and an open PR exists. |
| `blocked` | The run failed or could not be verified; a comment says why. |

Three state rules (adopted Nov 25, 2026, recorded in Issue #4):

1. Only one of `building`, `ready-for-review` or `blocked` may represent the
   current execution state. `approved-task` may sit alongside `building` while
   approval stands. The three states are mutually exclusive.
2. A completed or blocked Issue needs an explicit reset before another build.
   A retry must clear `blocked` or `ready-for-review` first, or the run must be
   rejected when `ready-for-review` is already present.
3. A claimed task must reach a terminal state or be caught by independent
   reconciliation, which must also detect contradictory label combinations and
   a `building` label with no live run.

Normal state transitions and terminal-label guards are enforced. Independent
reconciliation for runner loss and stranded tasks remains outstanding in
Issue #6. Some failures, such as missing credentials, happen before the Issue
is claimed and change no labels; they show only in the Actions log.

## Environments

There are exactly two permanent shared environments: **Staging** and
**Production**. Merging a change and releasing it are separate decisions.
Merging to `main` does not release anything.

## The review loop

- A second reviewer is required; the author cannot be the independent review.
- At most 3 repair attempts per defect. After that, stop and report; a fourth
  attempt is the owner's decision.
- No autonomous merge and no autonomous production deployment. The owner
  merges, and the owner separately authorizes any release.
