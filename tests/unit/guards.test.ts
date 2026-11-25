/**
 * Unit tests for the day-one guards.
 *
 * Dependency-free: no network, no database, no Stripe, no Twilio. Every
 * environment below is fabricated, so each refusal path is proven without
 * ever pointing at a real service.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  GuardRefusal, resolveEnv, assertStripeKeyMode, assertSmsAllowed, smsIsLive,
  normalizeConsent, DEFAULT_CONSENT, assertPublishAuthorized,
  assertSupabaseSeparation, assertStartupSafety,
} from "../../lib/env/guards.ts";
import { UC568_CLAIM_INTERACTIVE_BUDGET_MS } from "../../lib/env/budget.ts";

const refuses = (fn: () => unknown, why: string) =>
  assert.throws(fn, (e: unknown) => e instanceof GuardRefusal, why);

const stagingEnv = (over: Record<string, string | undefined> = {}) => ({
  DEALSPRO_ENV: "staging",
  STRIPE_SECRET_KEY: "sk_test_abc",
  NEXT_PUBLIC_SUPABASE_URL: "https://stagingprojectref.supabase.co",
  DEALSPRO_PRODUCTION_SUPABASE_REF: "prodprojectrefxx",
  ...over,
});

describe("environment identity", () => {
  test("staging and production are accepted", () => {
    assert.equal(resolveEnv({ DEALSPRO_ENV: "staging" }), "staging");
    assert.equal(resolveEnv({ DEALSPRO_ENV: "production" }), "production");
  });
  test("an unset environment is refused, never defaulted", () =>
    refuses(() => resolveEnv({}), "unset should refuse"));
  test("NODE_ENV cannot stand in for DEALSPRO_ENV", () =>
    refuses(() => resolveEnv({ NODE_ENV: "production" }), "NODE_ENV must not count"));
  test("a near-miss value is refused", () => {
    for (const v of ["Staging", "prod", "test", "dev", ""]) {
      refuses(() => resolveEnv({ DEALSPRO_ENV: v }), `${v} should refuse`);
    }
  });
});

describe("stripe key mode", () => {
  test("test key in staging is accepted", () =>
    assert.equal(assertStripeKeyMode(stagingEnv()), "staging"));
  test("LIVE key in staging is refused — real money could move", () =>
    refuses(() => assertStripeKeyMode(stagingEnv({ STRIPE_SECRET_KEY: "sk_live_abc" })), "live in staging"));
  test("TEST key in production is refused", () =>
    refuses(() => assertStripeKeyMode(stagingEnv({
      DEALSPRO_ENV: "production", STRIPE_SECRET_KEY: "sk_test_abc",
      NEXT_PUBLIC_SUPABASE_URL: "https://prodprojectrefxx.supabase.co",
    })), "test in production"));
  test("a malformed key is refused", () =>
    refuses(() => assertStripeKeyMode(stagingEnv({ STRIPE_SECRET_KEY: "pk_test_abc" })), "wrong prefix"));
  test("a missing key is refused", () => {
    const e = stagingEnv(); delete (e as Record<string, unknown>).STRIPE_SECRET_KEY;
    refuses(() => assertStripeKeyMode(e), "missing key");
  });
});

describe("sms confinement", () => {
  test("staging with explicit allow may send", () =>
    assert.doesNotThrow(() => assertSmsAllowed(stagingEnv({ DEALSPRO_ALLOW_SMS: "true" }))));
  test("staging without the allow flag is refused", () =>
    refuses(() => assertSmsAllowed(stagingEnv()), "staging alone is not enough"));
  test("production can never send, even with the allow flag", () =>
    refuses(() => assertSmsAllowed(stagingEnv({
      DEALSPRO_ENV: "production", STRIPE_SECRET_KEY: "sk_live_abc", DEALSPRO_ALLOW_SMS: "true",
      NEXT_PUBLIC_SUPABASE_URL: "https://prodprojectrefxx.supabase.co",
    })), "production must refuse"));
  test("smsIsLive reports false rather than throwing", () => {
    assert.equal(smsIsLive(stagingEnv()), false);
    assert.equal(smsIsLive(stagingEnv({ DEALSPRO_ALLOW_SMS: "true" })), true);
  });
});

describe("consent defaults to false", () => {
  test("the default is false", () => assert.equal(DEFAULT_CONSENT, false));
  test("only boolean true is consent", () => assert.equal(normalizeConsent(true), true));
  test("truthy look-alikes are NOT consent", () => {
    for (const v of ["true", "TRUE", 1, "1", "yes", "on", {}, [], "false", 0, null, undefined]) {
      assert.equal(normalizeConsent(v), false, `${JSON.stringify(v)} must not be consent`);
    }
  });
});

describe("nothing auto-publishes", () => {
  test("both gates present is authorized", () =>
    assert.doesNotThrow(() => assertPublishAuthorized({
      restaurantConfirmedOfferVersionId: "ov_1", operatorAuthorizedBy: "mahendra",
    })));
  test("operator alone is refused", () =>
    refuses(() => assertPublishAuthorized({
      restaurantConfirmedOfferVersionId: null, operatorAuthorizedBy: "mahendra",
    }), "restaurant gate missing"));
  test("restaurant alone is refused", () =>
    refuses(() => assertPublishAuthorized({
      restaurantConfirmedOfferVersionId: "ov_1", operatorAuthorizedBy: null,
    }), "operator gate missing"));
  test("neither gate is refused", () =>
    refuses(() => assertPublishAuthorized({
      restaurantConfirmedOfferVersionId: null, operatorAuthorizedBy: null,
    }), "no gates"));
});

describe("supabase project separation", () => {
  test("a distinct staging project is accepted", () =>
    assert.equal(assertSupabaseSeparation(stagingEnv()), "stagingprojectref"));
  test("staging pointing at the production project is refused", () =>
    refuses(() => assertSupabaseSeparation(stagingEnv({
      DEALSPRO_PRODUCTION_SUPABASE_REF: "stagingprojectref",
    })), "same project both sides"));

  // Fail-closed: a missing opposite ref used to SKIP the comparison and
  // accept whatever this environment pointed at — including production.
  test("staging with NO production ref is refused, not skipped", () =>
    refuses(() => assertSupabaseSeparation(stagingEnv({
      DEALSPRO_PRODUCTION_SUPABASE_REF: undefined,
    })), "missing opposite ref must refuse"));
  test("production with NO staging ref is refused, not skipped", () =>
    refuses(() => assertSupabaseSeparation({
      DEALSPRO_ENV: "production",
      STRIPE_SECRET_KEY: "sk_live_abc",
      NEXT_PUBLIC_SUPABASE_URL: "https://prodprojectrefxx.supabase.co",
    }), "missing opposite ref must refuse"));
  test("the exact fail-open case: staging aimed at production, no opposite ref", () =>
    refuses(() => assertSupabaseSeparation({
      DEALSPRO_ENV: "staging",
      NEXT_PUBLIC_SUPABASE_URL: "https://prodprojectrefxx.supabase.co",
    }), "this previously ACCEPTED and is the defect C2 reported"));
  test("a malformed opposite ref is refused", () => {
    for (const bad of ["", "   ", "short", "UPPERCASE", "has-dash", "has_underscore"]) {
      refuses(() => assertSupabaseSeparation(stagingEnv({
        DEALSPRO_PRODUCTION_SUPABASE_REF: bad,
      })), `${JSON.stringify(bad)} must refuse`);
    }
  });
  test("a loopback target still requires the opposite ref", () =>
    refuses(() => assertSupabaseSeparation({
      DEALSPRO_ENV: "staging",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    }), "local is not exempt from separation config"));
  test("a loopback target with the opposite ref is accepted", () =>
    assert.equal(assertSupabaseSeparation({
      DEALSPRO_ENV: "staging",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      DEALSPRO_PRODUCTION_SUPABASE_REF: "prodprojectrefxx",
    }), "local:127.0.0.1"));
  test("an unidentifiable host is refused", () =>
    refuses(() => assertSupabaseSeparation(stagingEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://db.internal.example.com",
    })), "unknown host"));
  test("a lookalike domain is refused", () =>
    refuses(() => assertSupabaseSeparation(stagingEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co.evil.com",
    })), "lookalike"));
});

describe("startup safety", () => {
  test("a correct staging environment starts", () => {
    const r = assertStartupSafety(stagingEnv());
    assert.equal(r.environment, "staging");
    assert.equal(r.smsLive, false, "SMS must be off unless explicitly allowed");
  });
  test("startup refuses when any single guard fails", () =>
    refuses(() => assertStartupSafety(stagingEnv({ STRIPE_SECRET_KEY: "sk_live_abc" })), "live key"));
});

describe("§50 / UC-568 budget", () => {
  test("the locked budget is 2000ms", () =>
    assert.equal(UC568_CLAIM_INTERACTIVE_BUDGET_MS, 2000));
});
