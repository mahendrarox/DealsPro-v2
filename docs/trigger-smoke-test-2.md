# Trigger smoke test 2 — the four task labels

Sources: Issue #4 and `.github/workflows/claude-task.yml` only.
A task moves through these labels on its Issue. Only the repository
owner adding `approved-task` can start a run.

## `approved-task`

The owner's approval. Adding it (by the owner, on an open Issue) starts
the Claude workflow. The workflow re-checks it before and after the run;
if it is removed mid-run, approval is withdrawn and the task is blocked.
Re-applying it is the documented way to retry.

## `building`

Set by the workflow when it claims the Issue: Claude is working on it.
While it is present, a second trigger must not start a second run. It is
cleared when the run ends, whether it succeeds, fails or is cancelled.

## `ready-for-review`

Set on success, replacing `building`. The workflow first confirms an open
pull request exists from this run's own branch into `main`. A human then
reviews the pull request; nothing is merged automatically. An Issue that
already carries it is not built a second time.

## `blocked`

Set on failure or cancellation, replacing `building`, with a comment
saying why. Typical causes: the Issue text or spec changed after approval,
approval was withdrawn, or no matching pull request was found. Re-applying
`approved-task` starts a fresh run.
