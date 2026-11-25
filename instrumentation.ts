/**
 * Next.js instrumentation — the real server startup path.
 *
 * `register()` is called once by Next before the server handles any
 * request, in both `next dev` and `next start`. Throwing here prevents
 * the server from coming up, which is the point: an unsafe configuration
 * must stop the process, not log a warning nobody reads.
 *
 * Before this file existed, assertStartupSafety() was defined and tested
 * but never invoked — the skeleton booted with no guard check at all,
 * and the Playwright config's claim that a refusal would stop the boot
 * was not true. This is what makes it true.
 */
import { assertStartupSafety } from "./lib/env/guards";

export function register(): void {
  // Only the Node.js server runtime boots the app; the edge runtime has
  // no startup of its own to gate.
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return;

  const { environment, supabaseRef, smsLive } = assertStartupSafety(process.env);
  // Deliberately terse and secret-free: environment, project ref and
  // whether SMS can leave the building. No keys, no URLs.
  console.log(
    `[dealspro] startup guards passed — env=${environment} supabase=${supabaseRef} sms=${smsLive ? "LIVE" : "off"}`,
  );
}
