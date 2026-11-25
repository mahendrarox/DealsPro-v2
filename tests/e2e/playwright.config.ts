import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

// Reporter output paths in a Playwright config resolve relative to the
// CONFIG file (tests/e2e/), not the repo root — so left relative, the
// JSON report lands where the RTM does not look and coverage silently
// reads as "no test results" after a perfectly good run.
//
// The JSON report also gets its OWN folder, separate from the HTML one:
// the HTML reporter CLEARS its output folder when it writes, which
// deletes a results.json that an earlier reporter put there. Two
// folders, no shared ownership, nothing to race.
const ROOT_DIR = resolve(__dirname, "../..");
const REPORT_DIR = resolve(ROOT_DIR, "playwright-report");
const RESULTS_DIR = resolve(ROOT_DIR, "playwright-results");

/**
 * Mobile-first by construction.
 *
 * The default project is a phone with touch enabled. Desktop runs second
 * and is explicitly the secondary surface — ordering here mirrors the
 * product rule that everything is a phone first (§22, §50).
 */
const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: ".",
  testMatch: /uc\d{3}.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  // The JSON report is what the RTM reads to tell a test that PASSED
  // from one that merely exists. Always emitted, CI or not.
  reporter: [
    ["list"],
    ["json", { outputFile: resolve(RESULTS_DIR, "results.json") }],
    ...(process.env.CI
      ? [["html", { open: "never", outputFolder: REPORT_DIR }] as const]
      : []),
  ],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // PRIMARY — phone, touch.
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    // SECONDARY — desktop.
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // The E2E server runs as staging, with a test Stripe key and SMS
      // off. If any guard refused, the server would not boot and the
      // suite would fail here rather than silently test an unsafe build.
      DEALSPRO_ENV: "staging",
      STRIPE_SECRET_KEY: "sk_test_e2e_placeholder",
      NEXT_PUBLIC_SUPABASE_URL: "https://stagingprojectref.supabase.co",
      DEALSPRO_PRODUCTION_SUPABASE_REF: "productionprojref",
    },
  },
});
