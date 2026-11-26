#!/usr/bin/env bash
# A stand-in for the `gh` CLI, driven entirely by files in $GH_FIXTURE_DIR.
#
# Every mutating call is appended to $GH_LOG so a test can assert exactly
# which labels moved and which comments were posted. Reads are answered from
# fixture files; a fixture named <call>.fail makes that call exit non-zero,
# which is how the "the lookup itself failed" cases are driven.
set -uo pipefail
log() { printf '%s\n' "$*" >> "$GH_LOG"; }
fx() { printf '%s' "$GH_FIXTURE_DIR/$1"; }
die_if_marked() { [ -f "$(fx "$1.fail")" ] && { echo "stub: $1 failed" >&2; exit 1; }; return 0; }

case "${1:-} ${2:-}" in
  "issue view")
    die_if_marked issue_view
    cat "$(fx issue_view.json)"; exit 0 ;;
  "issue edit")
    log "EDIT $*"
    die_if_marked issue_edit
    exit 0 ;;
  "issue comment")
    log "COMMENT $*"
    die_if_marked issue_comment
    exit 0 ;;
  "pr list")
    log "PRLIST $*"
    die_if_marked pr_list
    cat "$(fx prs.json)"; exit 0 ;;
  "api "*)
    case "$*" in
      *"/comments"*)
        die_if_marked comments
        [ -f "$(fx comments.txt)" ] && cat "$(fx comments.txt)"; exit 0 ;;
      *"/labels"*)
        die_if_marked labels
        cat "$(fx labels.txt)"; exit 0 ;;
      *contents*)
        die_if_marked contents
        cat "$(fx contents.json)"; exit 0 ;;
    esac
    echo "stub: unhandled api call: $*" >&2; exit 1 ;;
esac
echo "stub: unhandled gh call: $*" >&2
exit 1
