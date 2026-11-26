#!/usr/bin/env bash
# A stand-in for the `gh` CLI, driven entirely by files in $GH_FIXTURE_DIR.
#
# STATEFUL, deliberately. Label edits mutate labels.state and posted comments
# are appended to comments.txt, so several steps can be chained in one
# fixture directory and the Issue's final state asserted. An earlier version
# only logged the commands; that is why its isolated-step assertions missed a
# sequence whose defect depended on one step's label changes being visible to
# the next (Issue #10, repair attempt 3).
#
# Every mutating call is still appended to $GH_LOG, so a test can assert which
# label commands were issued as well as where they ended up. A fixture named
# <call>.fail makes that call exit non-zero, which is how the "the lookup
# itself failed" cases are driven.
set -uo pipefail
log() { printf '%s\n' "$*" >> "$GH_LOG"; }
fx() { printf '%s' "$GH_FIXTURE_DIR/$1"; }
die_if_marked() { [ -f "$(fx "$1.fail")" ] && { echo "stub: $1 failed" >&2; exit 1; }; return 0; }

case "${1:-} ${2:-}" in
  "issue view")
    die_if_marked issue_view
    # Labels come from the live state file rather than a frozen fixture, so a
    # read that follows an edit sees that edit.
    mapfile -t _labels < <(grep -v '^$' "$(fx labels.state)" 2>/dev/null || true)
    jq -n \
      --arg body "$(cat "$(fx body.txt)" 2>/dev/null || true)" \
      --arg state "$(cat "$(fx state.txt)" 2>/dev/null || echo OPEN)" \
      --args '{state: $state, body: $body, labels: ($ARGS.positional | map({name: .}))}' \
      ${_labels[@]+"${_labels[@]}"}
    exit 0 ;;

  "issue edit")
    log "EDIT $*"
    die_if_marked issue_edit
    shift 2
    while [ $# -gt 0 ]; do
      case "$1" in
        --add-label)
          grep -qxF "$2" "$(fx labels.state)" 2>/dev/null \
            || printf '%s\n' "$2" >> "$(fx labels.state)"
          shift 2 ;;
        --remove-label)
          grep -vxF "$2" "$(fx labels.state)" > "$(fx labels.next)" 2>/dev/null
          mv -f "$(fx labels.next)" "$(fx labels.state)"
          shift 2 ;;
        *) shift ;;
      esac
    done
    exit 0 ;;

  "issue comment")
    log "COMMENT $*"
    die_if_marked issue_comment
    # The posted body joins the comment list, so a marker written by the Claim
    # step is visible to every step that reads ownership afterwards.
    while [ $# -gt 0 ]; do
      if [ "$1" = "--body" ]; then printf '%s\n' "${2:-}" >> "$(fx comments.txt)"; break; fi
      shift
    done
    exit 0 ;;

  "pr list")
    log "PRLIST $*"
    die_if_marked pr_list
    cat "$(fx prs.json)"
    exit 0 ;;

  "api "*)
    case "$*" in
      *"/comments"*)
        die_if_marked comments
        [ -f "$(fx comments.txt)" ] && cat "$(fx comments.txt)"
        exit 0 ;;
      *"/labels"*)
        die_if_marked labels
        cat "$(fx labels.repo)"
        exit 0 ;;
      *contents*)
        die_if_marked contents
        cat "$(fx contents.json)"
        exit 0 ;;
    esac
    echo "stub: unhandled api call: $*" >&2; exit 1 ;;
esac

echo "stub: unhandled gh call: $*" >&2
exit 1
