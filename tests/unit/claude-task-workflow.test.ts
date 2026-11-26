/**
 * Acceptance tests for .github/workflows/claude-task.yml.
 *
 * These exist because CI validates the repository's code but not its other
 * workflow files: an unparseable or behaviourally broken claude-task.yml
 * would not fail any check. The seven acceptance cases in Issue #10 are
 * covered here, so a regression in the finalize logic is caught by
 * `npm run test:unit` rather than by a live task being stranded.
 *
 * The real `run:` scripts are lifted out of the workflow and executed with a
 * stubbed `gh`, so what is tested is the shell the workflow actually runs,
 * not a paraphrase of it. The extractor asserts sentinels from each step, so
 * a mis-extraction fails loudly instead of quietly testing nothing.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const WORKFLOW = resolve(import.meta.dirname, "../../.github/workflows/claude-task.yml");
const GH_STUB = resolve(import.meta.dirname, "../workflow/gh-stub.sh");

const RUN_ID = "77001";
const ISSUE = "10";
const BODY = "task body";
const SPEC = "a".repeat(39) + "7";
const REV = createHash("sha256").update(BODY).digest("hex");
const BRANCH_A1 = `claude/issue-${ISSUE}-run-${RUN_ID}-1`;
const BRANCH_A2 = `claude/issue-${ISSUE}-run-${RUN_ID}-2`;

// The build window recorded by the ORIGINAL attempt. Fixed here so the
// wrong-time cases are deterministic rather than clock-dependent.
const WSTART = 1764000000;
const WEND = WSTART + 1800 + 240;
const TRUSTED = "claude";
const iso = (epoch: number): string => new Date(epoch * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");

/** The claim marker exactly as the Claim step writes it. */
function marker(
  branch: string,
  runId = RUN_ID,
  rev = REV,
  spec = SPEC,
  wstart = WSTART,
  wend = WEND,
): string {
  return `<!-- claude-task run=${runId} rev=${rev} spec=${spec} branch=${branch} window=${wstart}-${wend} -->`;
}

/* ------------------------------------------------------------------ *
 * Lifting the real scripts out of the workflow
 * ------------------------------------------------------------------ */

function extractRunSteps(text: string): Map<string, string> {
  const lines = text.split("\n");
  const steps = new Map<string, string>();
  let name: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const nameMatch = /^ {6}- name: (.+)$/.exec(lines[i]);
    if (nameMatch) {
      name = nameMatch[1].trim();
      continue;
    }
    if (!/^ {8}run: \|-?$/.test(lines[i]) || name === null) continue;
    const body: string[] = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const line = lines[j];
      if (line.trim() === "") {
        body.push("");
        continue;
      }
      if (!line.startsWith(" ".repeat(10))) break;
      body.push(line.slice(10));
    }
    steps.set(name, body.join("\n"));
    i = j - 1;
  }
  return steps;
}

let steps: Map<string, string>;
let workflowText: string;

function step(name: string): string {
  const s = steps.get(name);
  assert.ok(s, `step not extracted: ${name}`);
  return s;
}

/* ------------------------------------------------------------------ *
 * Running one step against fixtures
 * ------------------------------------------------------------------ */

interface Fixtures {
  comments?: string[];
  labels?: string[];
  prs?: unknown[];
  issueBody?: string;
  specSha?: string;
  fail?: string[];
}

interface Result {
  code: number;
  out: string;
  log: string;
  outputs: Record<string, string>;
  fixtures: string;
}

/**
 * One Issue's world on disk. The gh stub mutates it, so several steps run
 * against the same directory see each other's label and comment changes -
 * which is what makes a Preflight -> Claim -> Finalize chain meaningful.
 */
function setupFixtures(fx: Fixtures = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "cltask-"));
  const fixtures = join(dir, "fx");
  mkdirSync(fixtures);
  writeFileSync(join(fixtures, "body.txt"), fx.issueBody ?? BODY);
  writeFileSync(join(fixtures, "state.txt"), "OPEN");
  // Trailing newline matters: the stub APPENDS to both of these, so a file
  // without one would splice the next label or comment onto the last line.
  const lines = (a: string[]): string => (a.length ? `${a.join("\n")}\n` : "");
  writeFileSync(join(fixtures, "labels.state"), lines(fx.labels ?? ["approved-task"]));
  writeFileSync(join(fixtures, "comments.txt"), lines(fx.comments ?? []));
  // The labels that exist in the repository, for Preflight's existence check.
  writeFileSync(
    join(fixtures, "labels.repo"),
    ["approved-task", "building", "ready-for-review", "blocked"].join("\n"),
  );
  writeFileSync(
    join(fixtures, "contents.json"),
    JSON.stringify([{ name: "use-cases-v2-revised.md", sha: fx.specSha ?? SPEC }]),
  );
  writeFileSync(join(fixtures, "prs.json"), JSON.stringify(fx.prs ?? []));
  for (const f of fx.fail ?? []) writeFileSync(join(fixtures, `${f}.fail`), "");
  return fixtures;
}

/** The Issue's labels as they now stand. */
function readLabels(fixtures: string): string[] {
  return readFileSync(join(fixtures, "labels.state"), "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "")
    .sort();
}

function runStep(
  name: string,
  env: Record<string, string>,
  fx: Fixtures = {},
  reuse?: string,
): Result {
  const fixtures = reuse ?? setupFixtures(fx);
  if (reuse) {
    // Continuing a chain: carry the live Issue state, and only lay down what
    // this step needs on top of it.
    if (fx.prs !== undefined) writeFileSync(join(fixtures, "prs.json"), JSON.stringify(fx.prs));
    for (const f of fx.fail ?? []) writeFileSync(join(fixtures, `${f}.fail`), "");
  }
  const dir = mkdtempSync(join(tmpdir(), "clrun-"));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  // The stub is reached as `gh` only through PATH, so the script under test
  // is unmodified.
  writeFileSync(join(bin, "gh"), readFileSync(GH_STUB));
  execFileSync("chmod", ["+x", join(bin, "gh")]);

  const scriptPath = join(dir, "step.sh");
  writeFileSync(scriptPath, step(name));
  const outputPath = join(dir, "github_output");
  writeFileSync(outputPath, "");
  const logPath = join(dir, "gh.log");
  writeFileSync(logPath, "");

  let code = 0;
  let out = "";
  try {
    out = execFileSync("bash", [scriptPath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH ?? ""}`,
        GH_FIXTURE_DIR: fixtures,
        GH_LOG: logPath,
        GITHUB_OUTPUT: outputPath,
        GITHUB_RUN_ID: RUN_ID,
        GH_TOKEN: "stub",
        REPO: "owner/repo",
        RUN_URL: "http://run",
        SPEC_PATH: "docs/use-cases-v2-revised.md",
        ...env,
      },
    });
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    code = err.status ?? 1;
    out = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }

  const outputs: Record<string, string> = {};
  for (const line of readFileSync(outputPath, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) outputs[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return { code, out, log: readFileSync(logPath, "utf8"), outputs, fixtures };
}

function preflight(env: Record<string, string> = {}, fx: Fixtures = {}): Result {
  return runStep(
    "Preflight",
    {
      ISSUE_NUMBER: ISSUE,
      EVENT_NAME: "issues",
      APPROVED_BODY: BODY,
      GITHUB_RUN_ATTEMPT: "1",
      CLAUDE_CODE_OAUTH_TOKEN: "stub-token",
      ...env,
    },
    fx,
  );
}

function finalize(env: Record<string, string> = {}, fx: Fixtures = {}): Result {
  return runStep(
    "Verify the result, then release the Issue",
    {
      ISSUE_NUMBER: ISSUE,
      EXPECTED_REV: REV,
      EXPECTED_SPEC: SPEC,
      EXPECTED_BRANCH: BRANCH_A1,
      ACTION_BRANCH: "",
      WINDOW_START: String(WSTART),
      WINDOW_END: String(WEND),
      TRUSTED_PR_AUTHORS: TRUSTED,
      ...env,
    },
    { comments: [marker(BRANCH_A1)], labels: ["approved-task", "building"], ...fx },
  );
}

const pr = (head: string, over: Record<string, unknown> = {}) => ({
  url: `https://github.com/owner/repo/pull/1`,
  headRefName: head,
  baseRefName: "main",
  isCrossRepository: false,
  author: { login: `${TRUSTED}[bot]` },
  createdAt: iso(WSTART + 300),
  ...over,
});

/* ------------------------------------------------------------------ *
 * Tests
 * ------------------------------------------------------------------ */

before(() => {
  assert.ok(existsSync(WORKFLOW), "workflow file is missing");
  workflowText = readFileSync(WORKFLOW, "utf8");
  steps = extractRunSteps(workflowText);
});

describe("claude-task.yml: the harness lifts the real scripts", () => {
  it("extracts all five run steps", () => {
    assert.deepEqual(
      [...steps.keys()].sort(),
      [
        "Claim the Issue",
        "Preflight",
        "Release the Issue if this run failed",
        "Release the Issue if this run was cancelled",
        "Verify the result, then release the Issue",
      ].sort(),
    );
  });

  // Sentinels: if the extractor ever drifts, these fail rather than the
  // behavioural tests passing vacuously against an empty script.
  it("each extracted script is the real one", () => {
    assert.match(step("Preflight"), /THE BRANCH THIS RUN WILL USE/);
    assert.match(step("Preflight"), /RECOVERY, OR A FRESH BUILD/);
    assert.match(step("Preflight"), /THE WINDOW in which this run's pull request/);
    assert.match(step("Verify the result, then release the Issue"), /SUPPORTING SAFEGUARDS/);
    assert.match(step("Claim the Issue"), /claude-task run=\$\{GITHUB_RUN_ID\}/);
    assert.match(step("Verify the result, then release the Issue"), /fail_task\(\)/);
    for (const name of steps.keys()) {
      assert.match(step(name), /^set -[eu]/m, `${name} does not set shell flags`);
    }
  });
});

describe("Issue #10 case 1: successful discovery", () => {
  it("attributes the pull request on the recorded branch and moves to ready-for-review", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)] });
    assert.equal(r.code, 0);
    assert.match(r.out, /Found the pull request for this task/);
    assert.match(r.log, /EDIT .*--remove-label building --add-label ready-for-review/);
    assert.doesNotMatch(r.log, /--add-label blocked/);
  });

  it("the branch it looks up is the recorded one", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)] });
    assert.match(r.log, new RegExp(`PRLIST .*--head ${BRANCH_A1}\\b`));
  });
});

describe("Issue #10 case 2: no pull request", () => {
  it("blocks with the no-pull-request reason", () => {
    const r = finalize({}, { prs: [] });
    assert.equal(r.code, 1);
    assert.match(r.out, /without leaving an open pull request on this run's branch/);
    assert.match(r.log, /EDIT .*--add-label blocked/);
  });
});

describe("Issue #10 case 3: an unrelated pull request never satisfies the check", () => {
  // The author/creation-window checks are a recorded spec gap awaiting the
  // owner's decision (Issue #10); the branch-based cases below are what the
  // current trust model enforces.
  for (const [label, candidate] of [
    ["a different branch", pr("docs/aidlc-2.0-architecture")],
    ["a branch named after the Issue", pr(`claude/issue-${ISSUE}`)],
    ["a title mentioning the Issue", pr("attacker/pr", { title: `Fixes #${ISSUE}` })],
    ["a cross-repository head", pr(BRANCH_A1, { isCrossRepository: true })],
    ["a base other than main", pr(BRANCH_A1, { baseRefName: "dev" })],
    ["a near-miss branch name", pr(`${BRANCH_A1}-fix`)],
    ["the previous attempt's branch", pr(BRANCH_A2)],
  ] as const) {
    it(`rejects ${label}`, () => {
      const r = finalize({}, { prs: [candidate] });
      assert.equal(r.code, 1, `${label} was accepted`);
      assert.match(r.log, /EDIT .*--add-label blocked/);
    });
  }
});

describe("Issue #10 case 4: ambiguous matches block", () => {
  it("two matching pull requests block rather than picking one", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1), pr(BRANCH_A1)] });
    assert.equal(r.code, 1);
    assert.match(r.out, /ambiguous/);
    assert.doesNotMatch(r.log, /--add-label ready-for-review/);
  });
});

describe("Issue #10 case 5: a lookup failure is reported as a lookup failure", () => {
  it("does not report a failed lookup as 'no pull request'", () => {
    const r = finalize({}, { prs: [], fail: ["pr_list"] });
    assert.equal(r.code, 1);
    assert.match(r.out, /could not be read/);
    assert.doesNotMatch(r.out, /without leaving an open pull request/);
  });

  it("an unreadable Issue is not reported as withdrawn approval", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)], fail: ["issue_view"] });
    assert.equal(r.code, 1);
    assert.match(r.out, /could not be re-read/);
    assert.doesNotMatch(r.out, /approval was withdrawn/);
  });
});

describe("Issue #10 case 6: withdrawn approval or changed requirements cannot advance", () => {
  it("a changed Issue body blocks", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)], issueBody: "edited after approval" });
    assert.equal(r.code, 1);
    assert.match(r.out, /the Issue text changed while the task was running/);
  });

  it("a changed spec blocks", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)], specSha: "b".repeat(40) });
    assert.equal(r.code, 1);
    assert.match(r.out, /the spec changed while the task was running/);
  });

  it("a withdrawn approved-task label blocks", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)], labels: ["building"] });
    assert.equal(r.code, 1);
    assert.match(r.out, /approval was withdrawn/);
  });
});

describe("Issue #10 case 7: a finalization retry neither rebuilds nor contradicts", () => {
  it("attempt 1 is a fresh build and records its branch", () => {
    const r = preflight({ GITHUB_RUN_ATTEMPT: "1" });
    assert.equal(r.code, 0);
    assert.equal(r.outputs.skip, "false");
    assert.equal(r.outputs.recovery, "false");
    assert.equal(r.outputs.expected_branch, BRANCH_A1);
    // A window is recorded before Claude starts, spanning the job timeout.
    const ws = Number(r.outputs.window_start);
    const we = Number(r.outputs.window_end);
    assert.ok(Number.isInteger(ws) && Number.isInteger(we), "window is not integral");
    assert.equal(we - ws, 1800 + 240);
  });

  it("attempt 2 of the same run is a recovery that reuses the recorded branch", () => {
    const r = preflight({ GITHUB_RUN_ATTEMPT: "2" }, { comments: [marker(BRANCH_A1)] });
    assert.equal(r.code, 0);
    assert.equal(r.outputs.skip, "false");
    assert.equal(r.outputs.recovery, "true");
    // Not BRANCH_A2: the branch the earlier attempt actually pushed.
    assert.equal(r.outputs.expected_branch, BRANCH_A1);
  });

  it("a recovery reuses the ORIGINAL attempt's window, not its own clock", () => {
    const r = preflight({ GITHUB_RUN_ATTEMPT: "2" }, { comments: [marker(BRANCH_A1)] });
    assert.equal(r.outputs.recovery, "true");
    assert.equal(r.outputs.window_start, String(WSTART));
    assert.equal(r.outputs.window_end, String(WEND));
    // The recovery runs now, decades after WSTART; had it invented the
    // window from its own clock, the recorded value would not survive.
    assert.ok(Number(r.outputs.window_start) < Date.now() / 1000 - 86400);
  });

  it("a recovery reuses the approval hashes recorded at the original claim", () => {
    const otherRev = "c".repeat(64);
    const otherSpec = "d".repeat(40);
    const r = preflight(
      { GITHUB_RUN_ATTEMPT: "2" },
      { comments: [marker(BRANCH_A1, RUN_ID, otherRev, otherSpec)] },
    );
    assert.equal(r.outputs.recovery, "true");
    assert.equal(r.outputs.rev, otherRev);
    assert.equal(r.outputs.spec_sha, otherSpec);
  });

  it("Claude is not run on a recovery", () => {
    const claudeStep = /- name: Run Claude Code\n\s+id: claude\n\s+if: ([^\n]+)/.exec(workflowText);
    assert.ok(claudeStep, "the Claude step's if condition was not found");
    assert.match(claudeStep[1], /steps\.preflight\.outputs\.recovery != 'true'/);
  });

  it("a recovery does not claim again, and clears the stale terminal labels", () => {
    const r = runStep(
      "Claim the Issue",
      {
        ISSUE_NUMBER: ISSUE,
        REV: REV,
        SPEC_SHA: SPEC,
        EXPECTED_BRANCH: BRANCH_A1,
        RECOVERY: "true",
        GITHUB_RUN_ATTEMPT: "2",
      },
      // Its own marker must be the latest, or the claim refuses - see the
      // superseded-run suite below.
      { comments: [marker(BRANCH_A1)], labels: ["approved-task", "blocked"] },
    );
    assert.equal(r.code, 0);
    assert.equal(r.outputs.claimed, "true");
    assert.match(r.log, /EDIT .*--remove-label blocked/);
    assert.match(r.log, /EDIT .*--remove-label ready-for-review/);
    // No second marker: ownership is already recorded by its own claim.
    assert.doesNotMatch(r.log, /<!-- claude-task run=/);
  });

  it("a fresh claim does post the marker, carrying the branch", () => {
    const r = runStep("Claim the Issue", {
      ISSUE_NUMBER: ISSUE,
      REV: REV,
      SPEC_SHA: SPEC,
      EXPECTED_BRANCH: BRANCH_A1,
      WINDOW_START: String(WSTART),
      WINDOW_END: String(WEND),
      RECOVERY: "false",
      GITHUB_RUN_ATTEMPT: "1",
    });
    assert.equal(r.code, 0);
    assert.match(r.log, new RegExp(`branch=${BRANCH_A1} window=${WSTART}-${WEND} -->`));
    assert.match(r.log, /EDIT .*--add-label building/);
  });

  it("a fresh run refuses to start a second build over a terminal label", () => {
    for (const terminal of ["blocked", "ready-for-review"]) {
      const r = preflight({ GITHUB_RUN_ATTEMPT: "1" }, { labels: ["approved-task", terminal] });
      assert.equal(r.outputs.skip, "true", `${terminal} did not stop a fresh build`);
      assert.match(r.out, /second build of a task that already finished/);
      // Pre-claim refusal: no label may move.
      assert.equal(r.log.trim(), "", `${terminal} refusal touched a label`);
    }
  });

  it("a successful replay leaves no blocked label behind", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)], labels: ["approved-task", "building", "blocked"] });
    assert.equal(r.code, 0);
    assert.match(r.log, /EDIT .*--remove-label blocked/);
    assert.match(r.log, /--add-label ready-for-review/);
  });

  it("a failed replay leaves no ready-for-review label behind", () => {
    const r = finalize(
      {},
      { prs: [], labels: ["approved-task", "building", "ready-for-review"] },
    );
    assert.equal(r.code, 1);
    assert.match(r.log, /EDIT .*--remove-label ready-for-review/);
    assert.match(r.log, /EDIT .*--add-label blocked/);
  });

  it("every terminal transition clears the opposite terminal label", () => {
    // Statically, across all four sites, so a new transition cannot be added
    // without the pairing.
    const addsBlocked = workflowText.split("\n").filter((l) => l.includes("--add-label blocked"));
    assert.equal(addsBlocked.length, 3);
    for (const site of ["Verify the result, then release the Issue", "Release the Issue if this run was cancelled", "Release the Issue if this run failed"]) {
      const sc = step(site);
      if (!sc.includes("--add-label blocked")) continue;
      assert.ok(
        sc.includes("--remove-label ready-for-review"),
        `${site} adds blocked without clearing ready-for-review`,
      );
    }
  });
});

describe("Issue #10: author and creation time as supporting safeguards", () => {
  it("accepts the trusted identity", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1, { author: { login: "claude[bot]" } })] });
    assert.equal(r.code, 0);
    assert.match(r.log, /--add-label ready-for-review/);
  });

  it("accepts the same identity spelled without the [bot] suffix", () => {
    // REST and GraphQL spell the same bot differently and `gh` can return
    // either, so the comparison strips the suffix from both sides.
    const r = finalize({}, { prs: [pr(BRANCH_A1, { author: { login: "claude" } })] });
    assert.equal(r.code, 0);
  });

  it("blocks a wrong author, and says so rather than 'no pull request'", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1, { author: { login: "someone-else" } })] });
    assert.equal(r.code, 1);
    assert.match(r.out, /not opened by a trusted identity/);
    assert.doesNotMatch(r.out, /without leaving an open pull request/);
    assert.match(r.log, /EDIT .*--add-label blocked/);
  });

  it("blocks a missing author", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1, { author: {} })] });
    assert.equal(r.code, 1);
    assert.match(r.out, /not opened by a trusted identity/);
  });

  it("blocks a pull request created before the window", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1, { createdAt: iso(WSTART - 600) })] });
    assert.equal(r.code, 1);
    assert.match(r.out, /created outside this run's build window/);
  });

  it("blocks a pull request created after the window", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1, { createdAt: iso(WEND + 600) })] });
    assert.equal(r.code, 1);
    assert.match(r.out, /created outside this run's build window/);
  });

  it("accepts the window boundaries themselves", () => {
    for (const at of [WSTART, WEND]) {
      const r = finalize({}, { prs: [pr(BRANCH_A1, { createdAt: iso(at) })] });
      assert.equal(r.code, 0, `boundary ${at} was rejected`);
    }
  });

  it("blocks an unreadable creation time", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1, { createdAt: "not a date" })] });
    assert.equal(r.code, 1);
    assert.match(r.out, /creation time could not be read/);
  });

  it("blocks when no window was recorded at all", () => {
    const r = finalize({ WINDOW_START: "", WINDOW_END: "" }, { prs: [pr(BRANCH_A1)] });
    assert.equal(r.code, 1);
    assert.match(r.out, /recorded no build window/);
  });

  it("the safeguards support attribution rather than replace it", () => {
    // A trusted author inside the window, on the wrong branch, is still
    // refused: the exact-branch check decides candidacy.
    const r = finalize({}, { prs: [pr("docs/aidlc-2.0-architecture")] });
    assert.equal(r.code, 1);
    assert.match(r.out, /without leaving an open pull request/);
  });
});

describe("Issue #10: a superseded run must not touch the Issue", () => {
  const OLD = "123";
  const NEW = "456";
  const BRANCH_OLD = `claude/issue-${ISSUE}-run-${OLD}-1`;
  const BRANCH_NEW = `claude/issue-${ISSUE}-run-${NEW}-1`;

  /** Run OLD claimed first; run NEW claimed after it and finished. */
  const twoOwners = (): string =>
    setupFixtures({
      labels: ["approved-task", "ready-for-review"],
      comments: [marker(BRANCH_OLD, OLD), marker(BRANCH_NEW, NEW)],
    });

  it("Preflight -> Claim -> Finalize with two historical owners leaves the labels unchanged", () => {
    const dir = twoOwners();
    const before = readLabels(dir);
    assert.deepEqual(before, ["approved-task", "ready-for-review"]);

    // 1. Someone retries the older run.
    const pre = runStep(
      "Preflight",
      {
        ISSUE_NUMBER: ISSUE,
        EVENT_NAME: "issues",
        APPROVED_BODY: BODY,
        GITHUB_RUN_ID: OLD,
        GITHUB_RUN_ATTEMPT: "2",
        CLAUDE_CODE_OAUTH_TOKEN: "stub-token",
      },
      {},
      dir,
    );
    assert.equal(pre.outputs.skip, "true", "a superseded run was not skipped");
    assert.notEqual(pre.outputs.recovery, "true", "a superseded run was treated as a recovery");
    assert.match(pre.out, /superseded/);
    assert.equal(pre.log.trim(), "", "Preflight wrote to the Issue");
    assert.deepEqual(readLabels(dir), before, "Preflight changed the labels");

    // 2. Were the Claim step reached anyway, it must refuse BEFORE mutating.
    const claim = runStep(
      "Claim the Issue",
      {
        ISSUE_NUMBER: ISSUE,
        REV: REV,
        SPEC_SHA: SPEC,
        EXPECTED_BRANCH: BRANCH_OLD,
        WINDOW_START: String(WSTART),
        WINDOW_END: String(WEND),
        RECOVERY: "true",
        GITHUB_RUN_ID: OLD,
        GITHUB_RUN_ATTEMPT: "2",
      },
      {},
      dir,
    );
    assert.notEqual(claim.code, 0, "the claim recovered a superseded run");
    assert.match(claim.out, /no longer the owner/);
    assert.deepEqual(readLabels(dir), before, "the recovery claim changed the labels");

    // 3. And finalize cannot advance it either.
    const fin = runStep(
      "Verify the result, then release the Issue",
      {
        ISSUE_NUMBER: ISSUE,
        EXPECTED_REV: REV,
        EXPECTED_SPEC: SPEC,
        EXPECTED_BRANCH: BRANCH_OLD,
        ACTION_BRANCH: "",
        WINDOW_START: String(WSTART),
        WINDOW_END: String(WEND),
        TRUSTED_PR_AUTHORS: TRUSTED,
        GITHUB_RUN_ID: OLD,
      },
      { prs: [pr(BRANCH_OLD)] },
      dir,
    );
    assert.notEqual(fin.code, 0);
    assert.match(fin.out, /cannot prove it owns Issue/);

    // The whole chain left the Issue exactly as it found it: in particular
    // `ready-for-review` survives and `building` was never set, so a later
    // run is not locked out.
    assert.deepEqual(readLabels(dir), before, "the chain changed the Issue's labels");
    assert.ok(!readLabels(dir).includes("building"), "the Issue was left on building");
  });

  it("the newest owner can still recover its own run", () => {
    const dir = twoOwners();
    const pre = runStep(
      "Preflight",
      {
        ISSUE_NUMBER: ISSUE,
        EVENT_NAME: "issues",
        APPROVED_BODY: BODY,
        GITHUB_RUN_ID: NEW,
        GITHUB_RUN_ATTEMPT: "2",
        CLAUDE_CODE_OAUTH_TOKEN: "stub-token",
      },
      {},
      dir,
    );
    assert.equal(pre.outputs.skip, "false");
    assert.equal(pre.outputs.recovery, "true");
    assert.equal(pre.outputs.expected_branch, BRANCH_NEW);
  });

  it("Preflight and the claim name the owner with the same pipeline as finalize", () => {
    // Four steps decide ownership; if their pipelines diverge, one of them
    // mutates on a judgement another would refuse.
    const sites = workflowText.split(
      "grep -oE 'claude-task run=[0-9]+' | tail -1 | grep -oE '[0-9]+$'",
    ).length - 1;
    assert.equal(sites, 5, "the ownership pipeline is not identical at all five sites");
  });
});

describe("Issue #10: the ordinary chain still reaches ready-for-review", () => {
  it("Preflight -> Claim -> Finalize on a fresh task ends at exactly one terminal label", () => {
    const RUN = "900900";
    const dir = setupFixtures({ labels: ["approved-task"], comments: [] });

    const pre = runStep(
      "Preflight",
      {
        ISSUE_NUMBER: ISSUE,
        EVENT_NAME: "issues",
        APPROVED_BODY: BODY,
        GITHUB_RUN_ID: RUN,
        GITHUB_RUN_ATTEMPT: "1",
        CLAUDE_CODE_OAUTH_TOKEN: "stub-token",
      },
      {},
      dir,
    );
    assert.equal(pre.outputs.skip, "false");
    assert.equal(pre.outputs.recovery, "false");
    const branch = pre.outputs.expected_branch;
    assert.equal(branch, `claude/issue-${ISSUE}-run-${RUN}-1`);

    const claim = runStep(
      "Claim the Issue",
      {
        ISSUE_NUMBER: ISSUE,
        REV: pre.outputs.rev,
        SPEC_SHA: pre.outputs.spec_sha,
        EXPECTED_BRANCH: branch,
        WINDOW_START: pre.outputs.window_start,
        WINDOW_END: pre.outputs.window_end,
        RECOVERY: "false",
        GITHUB_RUN_ID: RUN,
        GITHUB_RUN_ATTEMPT: "1",
      },
      {},
      dir,
    );
    assert.equal(claim.code, 0);
    assert.deepEqual(readLabels(dir), ["approved-task", "building"]);

    // Claude's pull request, created inside the window Preflight recorded.
    const created = iso(Number(pre.outputs.window_start) + 180);
    const fin = runStep(
      "Verify the result, then release the Issue",
      {
        ISSUE_NUMBER: ISSUE,
        EXPECTED_REV: pre.outputs.rev,
        EXPECTED_SPEC: pre.outputs.spec_sha,
        EXPECTED_BRANCH: branch,
        ACTION_BRANCH: "",
        WINDOW_START: pre.outputs.window_start,
        WINDOW_END: pre.outputs.window_end,
        TRUSTED_PR_AUTHORS: TRUSTED,
        GITHUB_RUN_ID: RUN,
      },
      { prs: [pr(branch, { createdAt: created })] },
      dir,
    );
    assert.equal(fin.code, 0, fin.out);
    assert.deepEqual(readLabels(dir), ["approved-task", "ready-for-review"]);
  });

  it("a failed finalize on a fresh task ends at exactly one terminal label", () => {
    const RUN = "900901";
    const dir = setupFixtures({ labels: ["approved-task"], comments: [] });
    const pre = runStep(
      "Preflight",
      {
        ISSUE_NUMBER: ISSUE,
        EVENT_NAME: "issues",
        APPROVED_BODY: BODY,
        GITHUB_RUN_ID: RUN,
        GITHUB_RUN_ATTEMPT: "1",
        CLAUDE_CODE_OAUTH_TOKEN: "stub-token",
      },
      {},
      dir,
    );
    runStep(
      "Claim the Issue",
      {
        ISSUE_NUMBER: ISSUE,
        REV: pre.outputs.rev,
        SPEC_SHA: pre.outputs.spec_sha,
        EXPECTED_BRANCH: pre.outputs.expected_branch,
        WINDOW_START: pre.outputs.window_start,
        WINDOW_END: pre.outputs.window_end,
        RECOVERY: "false",
        GITHUB_RUN_ID: RUN,
        GITHUB_RUN_ATTEMPT: "1",
      },
      {},
      dir,
    );
    const fin = runStep(
      "Verify the result, then release the Issue",
      {
        ISSUE_NUMBER: ISSUE,
        EXPECTED_REV: pre.outputs.rev,
        EXPECTED_SPEC: pre.outputs.spec_sha,
        EXPECTED_BRANCH: pre.outputs.expected_branch,
        ACTION_BRANCH: "",
        WINDOW_START: pre.outputs.window_start,
        WINDOW_END: pre.outputs.window_end,
        TRUSTED_PR_AUTHORS: TRUSTED,
        GITHUB_RUN_ID: RUN,
      },
      { prs: [] },
      dir,
    );
    assert.notEqual(fin.code, 0);
    assert.deepEqual(readLabels(dir), ["approved-task", "blocked"]);
  });
});

describe("ownership and provenance are not weakened", () => {
  it("a marker naming another run is refused without touching labels", () => {
    const r = finalize({}, { prs: [pr(BRANCH_A1)], comments: [marker(BRANCH_A1, "88002")] });
    assert.equal(r.code, 1);
    assert.match(r.out, /cannot prove it owns Issue/);
    assert.equal(r.log.trim(), "");
  });

  it("the pull-request filter still requires same repo, base main and the exact branch", () => {
    const f = step("Verify the result, then release the Issue");
    assert.match(f, /isCrossRepository == false/);
    assert.match(f, /\.baseRefName == "main"/);
    assert.match(f, /\.headRefName == \$br/);
  });

  it("a forged marker in a non-bot comment is not trusted", () => {
    // The stub returns only bot-authored bodies, mirroring the --jq filter in
    // the workflow; this asserts the filter is still what selects them.
    assert.match(step("Preflight"), /select\(\.user\.login == "github-actions\[bot\]"\)/);
  });

  it("the branch is anchored to the run, never to the Issue alone", () => {
    assert.match(
      step("Preflight"),
      /expected_branch="claude\/issue-\$\{ISSUE_NUMBER\}-run-\$\{GITHUB_RUN_ID\}-\$\{GITHUB_RUN_ATTEMPT\}"/,
    );
  });

  it("an unreadable comment list stops a run rather than guessing", () => {
    const r = preflight({ GITHUB_RUN_ATTEMPT: "2" }, { fail: ["comments"] });
    assert.equal(r.code, 1);
    assert.match(r.out, /cannot be told from a new task/);
    assert.equal(r.log.trim(), "");
  });

  it("the issue number is validated as a whole string", () => {
    const r = preflight({ ISSUE_NUMBER: `7\nskip=INJECTED` });
    assert.equal(r.code, 1);
    assert.equal(r.outputs.skip, undefined);
    assert.equal(r.outputs.INJECTED, undefined);
  });

  it("a unique nonce in the body changes the recorded revision", () => {
    // Guards against the revision check comparing a constant to itself.
    const nonce = randomUUID();
    const r = preflight({ APPROVED_BODY: nonce }, { issueBody: nonce });
    assert.equal(r.outputs.rev, createHash("sha256").update(nonce).digest("hex"));
  });
});
