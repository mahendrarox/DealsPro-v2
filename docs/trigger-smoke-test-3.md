# Trigger smoke test 3 — the recovery path

Sources: Issue #4 and `.github/workflows/claude-task.yml` (the Preflight step). Nothing else.

## What a re-run is

A GitHub re-run keeps the same run id but raises the attempt number. If a
trusted claim marker on the Issue already names this run id, the workflow treats
the re-run as a **recovery** of that run, not as a new task. Issue #4 asks for
this so a retry neither builds twice nor leaves contradictory labels.

## What a recovery reuses

It reads these from the marker the original attempt recorded:

- **The branch.** The recorded branch is used, not a fresh one named for the new
  attempt number.
- **The approval hashes.** The approved Issue-body hash and the spec SHA from
  the original claim are reused. The original approval hashes remain
  authoritative. Finalize compares the current Issue body and spec against
  them; any mismatch blocks recovery.
- **The build window.** The recorded start and end times of the original build
  are reused, so the pull request is judged against the time it was made, not
  the time of the re-run.

## What a recovery skips

- It does **not run Claude**. Nothing is built again.
- It does **not claim again**. The marker is already on the Issue, so no second
  one is posted.
- It does not need Claude authentication, because Claude is not run.

## What it still does

1. Re-proves it still owns the Issue. If a newer run has claimed it since, this
   run is superseded and exits without touching any label.
2. Clears the old terminal label (for example `blocked`) so the Issue shows one
   in-flight state, `building`.
3. Re-verifies the existing pull request in the finalize step, then sets the
   final label.

## Safe failures

- If the Issue's comments cannot be read, a recovery cannot be told from a new
  task, so the run stops and no label moves.
- If the marker cannot be read back in full, the run stops rather than guess.

## What this test proves

Per Issue #15, the fixed workflow from PR #14 should land this run on
`ready-for-review`.
