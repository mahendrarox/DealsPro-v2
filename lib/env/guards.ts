/**
 * Day-one safety guards. Fail-closed by construction.
 *
 * Every guard here refuses unless the safe condition is AFFIRMATIVELY
 * proven. Absence of configuration is refusal, never a default to
 * permissive. None of these may be relaxed without the spec case that
 * owns it changing first.
 *
 * Traceability:
 *   staging/production separation  — spec §4, hard rule 12
 *   Stripe key mode               — hard rule 12, "no real money moves"
 *   SMS confined to staging        — hard rule 9 / §4 ("SMS mocked in staging")
 *   consent defaults to false      — hard rule 9 (opt-in, unchecked by default)
 *   nothing auto-publishes         — hard rule 1 (two human gates)
 */

export type DealsProEnv = "staging" | "production";

/**
 * A plain environment-shaped record. Deliberately NOT NodeJS.ProcessEnv:
 * these guards only read string values, and depending on the fuller type
 * would force every caller — tests included — to fabricate unrelated
 * fields such as NODE_ENV just to satisfy the compiler.
 */
export type EnvLike = Record<string, string | undefined>;

export class GuardRefusal extends Error {
  readonly guard: string;
  constructor(guard: string, message: string) {
    super(`[${guard}] REFUSED: ${message}`);
    this.name = "GuardRefusal";
    this.guard = guard;
  }
}

/* ── Environment identity ─────────────────────────────────────────── */

/**
 * The environment must be stated explicitly. There is no default and no
 * inference from NODE_ENV: NODE_ENV is "production" for any built Next.js
 * app, staging included, so using it here would classify staging as
 * production and vice versa.
 */
export function resolveEnv(env: EnvLike = process.env): DealsProEnv {
  const raw = env.DEALSPRO_ENV;
  if (raw === "staging" || raw === "production") return raw;
  throw new GuardRefusal(
    "env",
    `DEALSPRO_ENV must be exactly "staging" or "production"; got ${JSON.stringify(raw)}`,
  );
}

/* ── Stripe key mode ──────────────────────────────────────────────── */

export function assertStripeKeyMode(env: EnvLike = process.env): DealsProEnv {
  const target = resolveEnv(env);
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new GuardRefusal("stripe", "STRIPE_SECRET_KEY is not set");

  const isTest = key.startsWith("sk_test_");
  const isLive = key.startsWith("sk_live_");
  if (!isTest && !isLive) {
    throw new GuardRefusal("stripe", "STRIPE_SECRET_KEY is neither sk_test_ nor sk_live_");
  }
  if (target === "staging" && isLive) {
    throw new GuardRefusal("stripe", "a LIVE Stripe key is present in staging — real money could move");
  }
  if (target === "production" && isTest) {
    throw new GuardRefusal("stripe", "a TEST Stripe key is present in production — payments would not settle");
  }
  return target;
}

/* ── SMS confinement ──────────────────────────────────────────────── */

/**
 * SMS may be dispatched only from staging, and only when explicitly
 * enabled. Production sending is NOT unlocked here: it is refused until
 * the case that owns production messaging is built and approved, so this
 * skeleton can never text a real customer.
 */
export function assertSmsAllowed(env: EnvLike = process.env): void {
  const target = resolveEnv(env);
  if (target !== "staging") {
    throw new GuardRefusal("sms", `SMS dispatch is confined to staging; environment is ${target}`);
  }
  if (env.DEALSPRO_ALLOW_SMS !== "true") {
    throw new GuardRefusal("sms", 'SMS requires DEALSPRO_ALLOW_SMS="true"; staging alone is not enough');
  }
}

/** True only when a real send is permitted. Callers mock otherwise. */
export function smsIsLive(env: EnvLike = process.env): boolean {
  try {
    assertSmsAllowed(env);
    return true;
  } catch {
    return false;
  }
}

/* ── Consent ──────────────────────────────────────────────────────── */

/**
 * Marketing consent is false unless the customer affirmatively opted in.
 * Only boolean true counts: "true", 1 and "yes" are all refused, because
 * a truthy string is how an accidental opt-in gets recorded.
 */
export function normalizeConsent(value: unknown): boolean {
  return value === true;
}

export const DEFAULT_CONSENT = false;

/* ── Publishing ───────────────────────────────────────────────────── */

export type PublishAuthorization = {
  restaurantConfirmedOfferVersionId: string | null;
  operatorAuthorizedBy: string | null;
};

/**
 * Two human gates, both required, neither inferable. No argument to this
 * function can mean "publish automatically" — that is the point.
 */
export function assertPublishAuthorized(auth: PublishAuthorization): void {
  if (!auth.restaurantConfirmedOfferVersionId) {
    throw new GuardRefusal("publish", "the restaurant has not confirmed this exact offer version");
  }
  if (!auth.operatorAuthorizedBy) {
    throw new GuardRefusal("publish", "no operator authorized this publish; auto-publish does not exist");
  }
}

/* ── Supabase project separation ──────────────────────────────────── */

/**
 * Staging and production must be different Supabase projects. Identical
 * refs mean one database is serving both, which is the separation failing
 * silently rather than loudly.
 */
export function assertSupabaseSeparation(env: EnvLike = process.env): string {
  const target = resolveEnv(env);
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const other = target === "staging"
    ? env.DEALSPRO_PRODUCTION_SUPABASE_REF
    : env.DEALSPRO_STAGING_SUPABASE_REF;
  if (!url) throw new GuardRefusal("supabase", "NEXT_PUBLIC_SUPABASE_URL is not set");

  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    throw new GuardRefusal("supabase", `NEXT_PUBLIC_SUPABASE_URL is not a URL: ${url}`);
  }
  const labels = host.split(".");
  const ref = labels.length >= 3 && labels.slice(1).join(".") === "supabase.co" ? labels[0] : null;
  if (!ref) {
    if (host === "127.0.0.1" || host === "localhost") return `local:${host}`;
    throw new GuardRefusal("supabase", `cannot identify a Supabase project from host ${host}`);
  }
  if (other && other === ref) {
    throw new GuardRefusal(
      "supabase",
      `${target} points at project ${ref}, which is also the other environment's project`,
    );
  }
  return ref;
}

/* ── Startup ──────────────────────────────────────────────────────── */

/** Run every guard that can be checked without I/O. Throws on the first refusal. */
export function assertStartupSafety(env: EnvLike = process.env): {
  environment: DealsProEnv;
  supabaseRef: string;
  smsLive: boolean;
} {
  const environment = resolveEnv(env);
  assertStripeKeyMode(env);
  const supabaseRef = assertSupabaseSeparation(env);
  return { environment, supabaseRef, smsLive: smsIsLive(env) };
}
