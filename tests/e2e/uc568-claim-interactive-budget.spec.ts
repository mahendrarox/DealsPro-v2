/**
 * UC-568 (§50) — mobile light loading, claim first. LOCKED.
 *
 * "Claim interactive within 2 seconds on a throttled 4G connection in
 * staging." Locked by Mahendra, Nov 22 2026.
 *
 * The budget is MEASURED here, not asserted in prose. Today there is no
 * Drop page and no claim button, so the measurement runs against the
 * skeleton and is marked `fixme` until the claim surface exists: a
 * placeholder that silently passed would be worse than no test, because
 * it would report the budget as met before anything was built.
 *
 * When the Drop page lands, change SELECTOR to the real claim control and
 * remove the fixme. The harness — throttling profile, timing method,
 * budget constant — is already correct and does not change.
 */
import { test, expect } from "@playwright/test";
import {
  UC568_CLAIM_INTERACTIVE_BUDGET_MS,
  THROTTLED_4G,
} from "../../lib/env/budget";

/** Replace with the real claim control when the Drop page exists. */
const CLAIM_SELECTOR = '[data-testid="claim-button"]';

/** Apply the §50 throttling profile via CDP. Chromium only, by design. */
async function throttleTo4G(page: import("@playwright/test").Page) {
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput: (THROTTLED_4G.downloadKbps * 1024) / 8,
    uploadThroughput: (THROTTLED_4G.uploadKbps * 1024) / 8,
    latency: THROTTLED_4G.latencyMs,
  });
  return client;
}

test.describe("§50 / UC-568 — claim interactive within budget", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "network throttling uses CDP; chromium only",
  );

  test("test_uc568_claim_interactive_within_2s_on_throttled_4g", async ({ page }, testInfo) => {
    test.fixme(
      true,
      "No claim surface exists yet — the Drop page is not built. " +
        "Unskip when the claim control ships; the harness is ready.",
    );
    test.skip(testInfo.project.name !== "mobile-chromium", "the budget is defined on a phone");

    await throttleTo4G(page);
    const started = Date.now();
    await page.goto("/", { waitUntil: "commit" });
    await page.locator(CLAIM_SELECTOR).waitFor({ state: "visible" });
    await expect(page.locator(CLAIM_SELECTOR)).toBeEnabled();
    const elapsed = Date.now() - started;

    testInfo.annotations.push({ type: "uc568-elapsed-ms", description: String(elapsed) });
    expect(
      elapsed,
      `claim must be interactive within ${UC568_CLAIM_INTERACTIVE_BUDGET_MS}ms on throttled 4G; took ${elapsed}ms`,
    ).toBeLessThanOrEqual(UC568_CLAIM_INTERACTIVE_BUDGET_MS);
  });

  /**
   * Proves the measuring rig works now, so the day the claim button lands
   * the only unknown is the page's speed — not whether throttling, timing
   * or CDP are wired correctly.
   */
  test("test_uc568_harness_can_measure_under_throttled_4g", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "the budget is defined on a phone");
    await throttleTo4G(page);
    const started = Date.now();
    await page.goto("/");
    await page.getByTestId("skeleton-marker").waitFor({ state: "visible" });
    const elapsed = Date.now() - started;
    testInfo.annotations.push({ type: "skeleton-elapsed-ms", description: String(elapsed) });
    expect(elapsed, "the rig must produce a real, positive measurement").toBeGreaterThan(0);
    expect(UC568_CLAIM_INTERACTIVE_BUDGET_MS, "budget constant must be the locked 2000ms").toBe(2000);
  });
});
