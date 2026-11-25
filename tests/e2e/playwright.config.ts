import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

// Reporter output paths in a Playwright config resolve relative to the
// CONFIG file (tests/e2e/), not the repo root. Left relative, the JSON
// report would land in tests/e2e/playwright-report/ where the RTM does
// not look — so the RTM would silently report "no test results" after a
// perfectly good run. Pinned to the root so the RTM and the CI artifact
// upload both find it.
const REPORT_DIR = resolve(__dirname, "../../playwright-report");

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
    ["json", { outputFile: resolve(REPORT_DIR, "results.json") }],
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
