#!/usr/bin/env node
/**
 * Proves the gitleaks allowlist exempts the approved placeholder VALUES
 * and nothing else.
 *
 * The allowlist first shipped with `regexTarget = "line"`, which matches
 * the whole source line. That suppressed EVERY finding on any line
 * holding an approved placeholder, so a real credential sharing that
 * line would have been dropped in silence — the one moment the scan has
 * to work. `regexTarget = "secret"` matches only the value gitleaks
 * extracted, anchored, because gitleaks matches allowlist regexes as
 * unanchored substrings.
 *
 * Four assertions, run against the repo's real .gitleaks.toml:
 *
 *   1. a synthetic credential ALONE is flagged      (the probe works)
 *   2. an approved placeholder ALONE is suppressed  (allowlist works)
 *   3. both on ONE line -> still flagged            (the hole is closed)
 *   4. both on one line, OLD config -> suppressed   (the hole was real)
 *
 * (1) is what stops this passing vacuously: if the default rules ever
 * stop detecting the probe, this fails rather than quietly agreeing
 * that nothing is wrong. (4) is what stops it being a tautology: it
 * reproduces the original defect, so a pass means the change fixed
 * something rather than that nothing was ever broken.
 *
 * The probe is random and lives only in a temp directory outside the
 * repo. Nothing key-shaped is committed — not even here, which is why
 * the prefix is assembled from fragments: the scan under test would
 * otherwise flag its own test.
 */
import { spawnSync } from "node:child_process";
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync,
} from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = join(ROOT, ".gitleaks.toml");
const GITLEAKS = process.env.GITLEAKS || "gitleaks";

/** One of the six values the allowlist exempts. Inert. */
const ALLOWED = ["sk", "test", "e2e", "placeholder"].join("_");

/**
 * A live-mode-shaped probe, random per run. Random so it cannot collide
 * with a real credential or with anything allowlisted, and assembled
 * from fragments so no key-shaped literal sits in this file.
 */
const PROBE = ["sk", "live", randomBytes(16).toString("hex")].join("_");

/** Run gitleaks over a directory. Returns true when it found a leak. */
function foundLeak(dir, config) {
  const r = spawnSync(
    GITLEAKS,
    ["dir", dir, "--config", config, "--no-banner", "--redact", "--exit-code", "1", "--log-level", "error"],
    { encoding: "utf8" },
  );
  if (r.error) {
    console.error(`cannot run gitleaks via "${GITLEAKS}": ${r.error.message}`);
    console.error("set GITLEAKS to the binary path");
    process.exit(2);
  }
  // 0 = clean, 1 = leaks found. Anything else is gitleaks itself failing,
  // which must not be read as either answer.
  if (r.status !== 0 && r.status !== 1) {
    console.error(`gitleaks exited ${r.status}\n${r.stdout ?? ""}\n${r.stderr ?? ""}`);
    process.exit(2);
  }
  return r.status === 1;
}

const work = mkdtempSync(join(tmpdir(), "gitleaks-allowlist-scope-"));
let failed = 0;

try {
  /** A fixture directory outside the repo, holding one line. */
  const fixture = (name, line) => {
    const dir = join(work, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "fixture.ts"), `${line}\n`);
    return dir;
  };

  // A keyword ("secret_key") so the generic rule has something to latch
  // onto, which is how the placeholder was detected in the first place.
  const probeOnly = fixture("probe-only", `const stripe_secret_key = "${PROBE}";`);
  const placeholderOnly = fixture("placeholder-only", `const stripe_secret_key = "${ALLOWED}";`);
  const shared = fixture("shared-line", `const stripe_secret_key = "${PROBE}"; // default was ${ALLOWED}`);

  // The old config, rebuilt from the current one so the contrast is
  // exactly the one change under test: line targeting, unanchored.
  const current = readFileSync(CONFIG, "utf8");
  if (!current.includes('regexTarget = "secret"')) {
    console.error('.gitleaks.toml no longer sets regexTarget = "secret" — refusing to run a test that would prove nothing');
    process.exit(2);
  }
  const oldConfig = join(work, "old.gitleaks.toml");
  writeFileSync(
    oldConfig,
    current
      .replace('regexTarget = "secret"', 'regexTarget = "line"')
      .replace(/'''\^([^'\n]+)\$'''/g, "'''\\b$1\\b'''"),
  );

  const check = (name, actual, expected, whyItMatters) => {
    const ok = actual === expected;
    if (!ok) failed++;
    const said = actual ? "flagged" : "not flagged";
    const want = expected ? "flagged" : "not flagged";
    console.log(`  [${ok ? "PASS" : "FAIL"}] ${name} — ${said}${ok ? "" : ` (expected ${want})`}`);
    if (!ok) console.log(`         ${whyItMatters}`);
  };

  check(
    "a synthetic credential on its own is flagged",
    foundLeak(probeOnly, CONFIG), true,
    "the probe is not detected by the default rules, so every other assertion here proves nothing",
  );
  check(
    "an approved placeholder on its own is suppressed",
    foundLeak(placeholderOnly, CONFIG), false,
    "the allowlist no longer exempts its own approved values — the repo scan will fail on the placeholders",
  );
  check(
    "a credential sharing a line with a placeholder is flagged",
    foundLeak(shared, CONFIG), true,
    "THE HOLE IS OPEN: a placeholder is suppressing a real finding that shares its line",
  );
  check(
    "the same line under the OLD line-targeted config is suppressed",
    foundLeak(shared, oldConfig), false,
    "could not reproduce the original defect, so this test does not demonstrate that the change fixed anything",
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(
  failed
    ? `\n${failed} allowlist scope check(s) FAILED\n`
    : "\nAllowlist scope is correct: approved values exempt, everything else still caught\n",
);
process.exit(failed ? 1 : 0);
