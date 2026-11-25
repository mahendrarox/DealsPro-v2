/**
 * Fix 3 — the guards must actually run at server startup.
 *
 * Tests `register()` itself, the function Next.js calls, rather than
 * re-testing assertStartupSafety in isolation: the defect was that
 * nothing invoked it, so a test that skipped the wiring would have
 * passed while the server booted unguarded.
 */
import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "../../instrumentation.ts";
import { GuardRefusal } from "../../lib/env/guards.ts";

const SAFE = {
  DEALSPRO_ENV: "staging",
  STRIPE_SECRET_KEY: "sk_test_abc",
  NEXT_PUBLIC_SUPABASE_URL: "https://stagingprojectref.supabase.co",
  DEALSPRO_PRODUCTION_SUPABASE_REF: "prodprojectrefxx",
};

const saved = { ...process.env };
function setEnv(vars: Record<string, string | undefined>) {
  for (const k of Object.keys(SAFE)) delete process.env[k];
  delete process.env.DEALSPRO_ALLOW_SMS;
  for (const [k, v] of Object.entries(vars)) if (v !== undefined) process.env[k] = v;
}
afterEach(() => {
  for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
  Object.assign(process.env, saved);
});

describe("startup wiring", () => {
  test("a safe staging configuration boots", () => {
    setEnv(SAFE);
    assert.doesNotThrow(() => register());
  });

  test("a LIVE Stripe key in staging stops the boot", () => {
    setEnv({ ...SAFE, STRIPE_SECRET_KEY: "sk_live_abc" });
    assert.throws(() => register(), (e: unknown) => e instanceof GuardRefusal);
  });

  test("a missing environment stops the boot", () => {
    setEnv({ ...SAFE, DEALSPRO_ENV: undefined });
    assert.throws(() => register(), (e: unknown) => e instanceof GuardRefusal);
  });

  test("a missing opposite Supabase ref stops the boot", () => {
    setEnv({ ...SAFE, DEALSPRO_PRODUCTION_SUPABASE_REF: undefined });
    assert.throws(() => register(), (e: unknown) => e instanceof GuardRefusal);
  });

  test("a missing Stripe key stops the boot", () => {
    setEnv({ ...SAFE, STRIPE_SECRET_KEY: undefined });
    assert.throws(() => register(), (e: unknown) => e instanceof GuardRefusal);
  });

  // Structural: the wiring must stay wired. If someone removes the call,
  // every behavioural test above would still pass against a direct
  // import, so assert the file actually invokes the guard.
  test("instrumentation.ts invokes assertStartupSafety", () => {
    const src = readFileSync(new URL("../../instrumentation.ts", import.meta.url), "utf8");
    assert.match(src, /assertStartupSafety\(process\.env\)/);
    assert.match(src, /export function register\(/);
  });

  test("the startup log leaks no secret", () => {
    const src = readFileSync(new URL("../../instrumentation.ts", import.meta.url), "utf8");
    assert.doesNotMatch(src, /STRIPE_SECRET_KEY|SUPABASE_URL|AUTH_TOKEN/);
  });
});
