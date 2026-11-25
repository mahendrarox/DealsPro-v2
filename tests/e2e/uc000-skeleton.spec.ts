/**
 * UC-000 — scaffold proof (not a spec case).
 *
 * Reserved id: the catalog starts at UC-001, so UC-000 can never collide
 * with a real case. This exists to prove the harness itself works —
 * mobile viewport, touch, and a page that actually renders — so a later
 * failure in a real UC spec means the feature broke, not the scaffold.
 */
import { test, expect } from "@playwright/test";

test("test_uc000_skeleton_page_renders_on_mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("skeleton-marker")).toBeVisible();
});

test("test_uc000_viewport_is_phone_first", async ({ page }, testInfo) => {
  await page.goto("/");
  const width = page.viewportSize()?.width ?? 0;
  if (testInfo.project.name === "mobile-chromium") {
    expect(width, "the primary project must be a phone viewport").toBeLessThanOrEqual(480);
  } else {
    expect(width, "the secondary project is desktop").toBeGreaterThan(480);
  }
});

test("test_uc000_no_horizontal_scroll_on_phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "phone-only check");
  await page.goto("/");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows, "a phone page must not scroll sideways").toBe(false);
});
