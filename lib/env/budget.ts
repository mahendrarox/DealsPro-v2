/**
 * §50 / UC-568 — mobile light loading, claim first. LOCKED.
 *
 * "Claim interactive within 2 seconds on a throttled 4G connection in
 * staging." Locked by Mahendra, Nov 22 2026. The number lives here so the
 * E2E suite and any monitoring read the same constant, and changing it
 * means changing the spec case first.
 */
export const UC568_CLAIM_INTERACTIVE_BUDGET_MS = 2000;

/** Throttling profile the budget is defined against. */
export const THROTTLED_4G = {
  downloadKbps: 1600,
  uploadKbps: 750,
  latencyMs: 150,
} as const;
