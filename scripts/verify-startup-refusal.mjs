#!/usr/bin/env node
/**
 * Proves the BUILT server refuses to boot on an unsafe configuration.
 *
 * The unit tests prove register() throws. This proves Next actually calls
 * it and dies — the end-to-end claim the audit found untrue. Requires a
 * prior `next build`.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";

/**
 * Ask the OS for a port nobody is using.
 *
 * An earlier version walked a fixed sequence (3210, 3211, ...). That made
 * the run order-dependent: a server still shutting down, or its port in
 * TIME_WAIT, made the NEXT check fail with EADDRINUSE and look like a
 * guard refusal — a false pass on a refusal check, and a false failure on
 * the safe one. The OS picking a free port removes that coupling.
 */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

const SAFE = {
  DEALSPRO_ENV: "staging",
  STRIPE_SECRET_KEY: "sk_test_ci_placeholder",
  NEXT_PUBLIC_SUPABASE_URL: "https://stagingprojectref.supabase.co",
  DEALSPRO_PRODUCTION_SUPABASE_REF: "prodprojectrefxx",
};

/** Start the built server and report whether it served a request. */
function tryBoot(env, port, timeoutMs = 25_000) {
  return new Promise((resolve) => {
    // detached gives the child its own process group. `npx next start`
    // spawns the actual server as a grandchild, so signalling only the
    // npx wrapper left a live server holding the port — which then broke
    // the next check rather than this one.
    const child = spawn("npx", ["next", "start", "-p", String(port)], {
      env: { ...process.env, ...env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    });
    let out = "";
    let settled = false;
    let exited = false;

    child.on("exit", () => { exited = true; });

    /** Take down the whole group, then wait for it to actually be gone. */
    const reap = async () => {
      for (const sig of ["SIGTERM", "SIGKILL"]) {
        if (exited) break;
        try { process.kill(-child.pid, sig); } catch { /* already gone */ }
        for (let i = 0; i < 20 && !exited; i++) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    };

    const done = async (served) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(poll);
      await reap();
      resolve({ served, out });
    };

    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { out += d; });
    // A server that exits on its own refused to boot. Give the pipes a
    // moment to flush first so the reason is in `out`.
    child.on("exit", () => setTimeout(() => done(false), 200));
    child.on("error", () => done(false));

    const poll = setInterval(async () => {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) });
        if (r.ok) done(true);
      } catch { /* not up yet */ }
    }, 700);
    const timer = setTimeout(() => done(false), timeoutMs);
  });
}

const checks = [
  ["live Stripe key in staging", { ...SAFE, STRIPE_SECRET_KEY: "sk_live_should_be_refused" }, false],
  ["missing DEALSPRO_ENV", { ...SAFE, DEALSPRO_ENV: "" }, false],
  ["missing opposite Supabase ref", { ...SAFE, DEALSPRO_PRODUCTION_SUPABASE_REF: "" }, false],
  ["a correct staging configuration", SAFE, true],
];

let failed = 0;
for (const [name, env, shouldServe] of checks) {
  const { served, out } = await tryBoot(env, await freePort());
  const ok = served === shouldServe;
  if (!ok) failed++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name} — ${served ? "SERVED" : "did not serve"}${ok ? "" : ` (expected ${shouldServe ? "SERVED" : "refusal"})`}`);
  if (!ok) console.log(out.split("\n").slice(-6).map((l) => `        ${l}`).join("\n"));
}
console.log(failed ? `\n${failed} startup check(s) FAILED\n` : "\nAll startup refusal checks passed\n");
process.exit(failed ? 1 : 0);
