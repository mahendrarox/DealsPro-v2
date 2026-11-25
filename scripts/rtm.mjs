#!/usr/bin/env node
/**
 * Requirements Traceability Matrix.
 *
 *   spec UC  ->  GitHub issue [UC-NNN]  ->  PR / commit  ->  acceptance test
 *
 * Read-only over the repo. Derives the matrix from facts on disk rather
 * than a hand-maintained list, because a hand-maintained RTM drifts the
 * first week and then quietly lies.
 *
 *   --check   exit non-zero if an acceptance test names a UC the spec
 *             does not define. Run in CI.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPEC = join(ROOT, "docs", "use-cases-v2-revised.md");
const E2E = join(ROOT, "tests", "e2e");
const OUT = join(ROOT, "docs", "RTM.md");
// The config pins the JSON report to the repo root, but a relative
// Playwright reporter path would resolve against tests/e2e/ instead.
// Both are checked so a config change cannot quietly turn every case
// back into "no results" without anyone noticing.
const RESULT_PATHS = [
  join(ROOT, "playwright-report", "results.json"),
  join(ROOT, "tests", "e2e", "playwright-report", "results.json"),
];
const CHECK = process.argv.includes("--check");

/** Catalog cases. Normalized to integers: the spec pads ids, tests do not. */
function specCases() {
  if (!existsSync(SPEC)) {
    console.error(`RTM: spec not found at ${SPEC} — refusing to generate from memory.`);
    process.exit(2);
  }
  const txt = readFileSync(SPEC, "utf8");
  const cases = new Map();
  let section = "(unsectioned)";
  for (const line of txt.split("\n")) {
    const s = line.match(/^##\s+§(\d+)\s+(.*)$/);
    if (s) { section = `§${s[1]} ${s[2].trim()}`; continue; }
    const c = line.match(/^-\s+\*\*UC-(\d{1,4})\*\*\s*(.*)$/);
    if (c) {
      const n = Number(c[1]);
      if (!cases.has(n)) cases.set(n, { section, title: c[2].replace(/\s+—.*$/, "").slice(0, 90) });
    }
  }
  const version = (txt.match(/Version\s+([0-9]+\.[0-9]+)/) || [, "unknown"])[1];
  return { cases, version };
}

/**
 * Acceptance tests, keyed by UC id, with whether each actually PASSED.
 *
 * A test's NAME is a mapping claim, not evidence. A `fixme` or skipped
 * test carries a UC id and runs nothing — counting it as traced is how an
 * RTM reports coverage that does not exist. So the name gives the
 * mapping and the Playwright JSON report gives the verdict.
 */
function acceptanceTests() {
  const found = new Map(); // uc -> [{ file, name, status }]
  if (!existsSync(E2E)) return { found, haveResults: false };

  // 1. Mapping, from the source: every test_ucNNN_... name that exists.
  for (const f of readdirSync(E2E).filter((f) => f.endsWith(".spec.ts"))) {
    const txt = readFileSync(join(E2E, f), "utf8");
    for (const m of txt.matchAll(/\btest_uc(\d{1,4})_([a-z0-9_]+)/gi)) {
      const n = Number(m[1]);
      const name = `test_uc${m[1]}_${m[2]}`;
      if (!found.has(n)) found.set(n, []);
      if (!found.get(n).some((t) => t.name === name)) {
        found.get(n).push({ file: f, name, status: "not-run" });
      }
    }
  }

  // 2. Verdict, from the run. Absent report => nothing is claimed passed.
  let haveResults = false;
  const resultsFile = RESULT_PATHS.find((p) => existsSync(p));
  if (resultsFile) {
    try {
      const report = JSON.parse(readFileSync(resultsFile, "utf8"));
      haveResults = true;
      const outcomes = new Map(); // test name -> best status seen
      const rank = { passed: 3, flaky: 2, skipped: 1, failed: 0 };
      const walk = (suite) => {
        for (const spec of suite.specs || []) {
          const m = String(spec.title || "").match(/\btest_uc\d{1,4}_[a-z0-9_]+/i);
          if (!m) continue;
          for (const t of spec.tests || []) {
            // Playwright: "expected" = passed as expected; a fixme or
            // skip reports "skipped" and executed no assertion.
            const st = t.status === "expected" ? "passed"
              : t.status === "flaky" ? "flaky"
              : t.status === "skipped" ? "skipped" : "failed";
            const prev = outcomes.get(m[0]);
            if (!prev || rank[st] > rank[prev]) outcomes.set(m[0], st);
          }
        }
        for (const child of suite.suites || []) walk(child);
      };
      for (const suite of report.suites || []) walk(suite);
      for (const list of found.values()) {
        for (const t of list) if (outcomes.has(t.name)) t.status = outcomes.get(t.name);
      }
    } catch { /* unreadable report: treat as no results */ }
  }
  return { found, haveResults };
}

/** Commits whose subject carries [UC-NNN]. Shallow clones see recent history only. */
function commitsByCase() {
  const byCase = new Map();
  try {
    const log = execSync('git log --no-merges --pretty=format:%h%x1f%s', {
      cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    });
    for (const line of log.split("\n").filter(Boolean)) {
      const [sha, subject] = line.split("\x1f");
      for (const m of subject.matchAll(/\[UC-(\d{1,4})\]/g)) {
        const n = Number(m[1]);
        if (!byCase.has(n)) byCase.set(n, []);
        byCase.get(n).push({ sha, subject });
      }
    }
  } catch { /* no history available; the matrix still renders */ }
  return byCase;
}

const { cases, version } = specCases();
const { found: tests, haveResults } = acceptanceTests();
const commits = commitsByCase();

// A test naming a case the spec does not define is a traceability break:
// either a typo, or work against a requirement nobody wrote down.
const orphans = [...tests.keys()].filter((n) => !cases.has(n) && n !== 0).sort((a, b) => a - b);

const pad = (n) => `UC-${String(n).padStart(3, "0")}`;
const known = [...tests.keys()].filter((n) => cases.has(n));

// THREE states, deliberately distinct. "Mapped" is a claim; "verified"
// is evidence. Conflating them is how an RTM reports coverage it does
// not have — which is exactly what this file used to do.
// Verified requires EVERY test naming the case to have run and passed —
// not merely one of them. A case with a passing harness test and a
// `fixme` acceptance test is NOT verified: that is the original defect
// reproduced one level down, where the rig passes and the requirement
// itself has never been exercised.
//
// Status is already the best outcome per test NAME across projects, so a
// phone-only test that passes on mobile and is skipped on desktop counts
// as passed rather than being punished for project filtering.
const passedStatus = (t) => t.status === "passed" || t.status === "flaky";
const verified = known
  .filter((n) => tests.get(n).length > 0 && tests.get(n).every(passedStatus))
  .sort((a, b) => a - b);
const mappedOnly = known.filter((n) => !verified.includes(n)).sort((a, b) => a - b);
const untested = [...cases.keys()].filter((n) => !known.includes(n)).length;

const statusMark = (t) =>
  t.status === "passed" ? "passed"
  : t.status === "flaky" ? "flaky"
  : t.status === "skipped" ? "skipped / fixme"
  : t.status === "failed" ? "FAILED"
  : "not run";

const row = (n) => {
  const c = cases.get(n);
  const t = tests.get(n).map((x) => `\`${x.name}\` (${statusMark(x)})`).join("<br>");
  const cm = (commits.get(n) || []).map((x) => `\`${x.sha}\``).join(", ") || "—";
  return `| ${pad(n)} | ${c.section} | ${c.title} | [UC-${String(n).padStart(3, "0")}] | ${cm} | ${t} |`;
};
const head = "| UC | Section | Title | Issue tag | Commits | Acceptance test |\n|---|---|---|---|---|---|";
const pct = cases.size ? ((verified.length / cases.size) * 100).toFixed(1) : "0.0";

const md = `# Requirements Traceability Matrix

Generated by \`npm run rtm\` — do not hand-edit.

| | |
|---|---|
| Spec | \`docs/use-cases-v2-revised.md\` **V${version}** |
| Cases defined in spec | **${cases.size}** |
| **Acceptance-verified** (test ran and passed) | **${verified.length}** |
| Mapped but NOT verified (fixme / skipped / not run) | ${mappedOnly.length} |
| Untested (no test names the case) | ${untested} |
| **Verified coverage** | **${pct}%** |
| Test results read | ${haveResults ? "yes — \`playwright-report/results.json\`" : "**NO** — run \`npm run test:e2e\` first; nothing is claimed verified without evidence"} |
| Generated | ${new Date().toISOString()} |

Chain: **spec UC → GitHub issue \`[UC-NNN]\` → PR/commit → acceptance test.**

A case is **verified** only when a test carrying its id actually executed
and passed. A test name is a mapping claim; the run is the evidence. A
\`fixme\` or skipped test maps a case but verifies nothing, and is listed
separately rather than counted — otherwise coverage reports work that has
never run.

## Acceptance-verified

${verified.length ? `${head}\n${verified.map(row).join("\n")}` : "_None yet._"}

## Mapped but NOT verified

${mappedOnly.length
  ? `These name a spec case but did not execute and pass. They do **not** count toward coverage.\n\n${head}\n${mappedOnly.map(row).join("\n")}`
  : "_None._"}

## Orphan tests

${orphans.length
  ? `These name a UC the spec does not define — a typo, or work against an unwritten requirement:\n\n${orphans.map((n) => `- \`${pad(n)}\``).join("\n")}`
  : "_None._ Every acceptance test names a case the spec defines."}

---
\`UC-000\` is reserved for scaffold proofs and is excluded from coverage.
`;

if (CHECK) {
  if (orphans.length) {
    console.error(`RTM check FAILED: ${orphans.length} test(s) name undefined cases: ${orphans.map(pad).join(", ")}`);
    process.exit(1);
  }
  console.log(`RTM check OK — spec V${version}, ${cases.size} cases, ${verified.length} verified, ${mappedOnly.length} mapped-not-verified, 0 orphans.`);
  process.exit(0);
}

writeFileSync(OUT, md);
console.log(`RTM written to docs/RTM.md — V${version}, ${cases.size} cases, ${verified.length} verified, ${mappedOnly.length} mapped-not-verified${haveResults ? "" : " (no test results found)"}.`);
