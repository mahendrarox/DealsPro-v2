# DealsPro Studio — UI/UX Companion to the Use-Case Catalog

**Maps to:** `use-cases-v2-revised.md`, **Version 2.22** — 600 counted cases, UC-001–UC-625, §§1–§57.
UC-503–UC-515 are RESERVED for the unmerged §45 draft; UC-607–UC-612 are RESERVED for the pending §55 SMS-list draft; 6 IDs are retired and never reused (UC-134, UC-173, UC-307, UC-328, UC-349, UC-554).
**Date:** Nov 24, 2026.

## Purpose

So Claude Code, building the real Studio from the spec, has no surprises about what UI each case lands on. This doc is a map, not a second spec: for every use case it names the surface, the screen or component in the agreed prototype, and the UI behaviour in one to three lines. It adds no requirements, removes none, and renumbers nothing. Where the spec and the prototype disagree, or where a case has no agreed screen, that is written down here — not papered over.

## Reference-only rule (read first)

The Studio prototype HTML is a UI reference ONLY, never production code (spec open item 2; UC-362). Claude Code builds the real application new from scratch from this catalog plus this companion. Nothing in the prototype — markup, sample data, sample distances, sample money figures — is shipped, copied, or treated as real. All figures in the prototype are SAMPLE data.

## How to read this doc

- One row per case group, grouped by spec section, §§1–§57 in order. §45 and §55 are reserved/unmerged and are noted in one line each where they fall.
- Every UC id appears exactly once in the mapping, in the first column of its row. Cases that share one screen are grouped into one row.
- **Surface** uses these values:
  - `Studio — view-<name>` — a tab in the Studio prototype (tab label in brackets).
  - `Customer website` — the customer-facing site (home, Drop page, smart menu, order page), built in the separate `dealspro-customer-preview` space, NOT in the Studio.
  - `Restaurant pickup link` — the restaurant's no-login private-link page (pickup board / confirm / Ready / cancel).
  - `Creator view` — the creator self-service surface, as specified in the Studio's Money view.
  - `API — no screen` — a server tool with no UI by design (§49).
  - `No UI — system rule` / `No UI — process rule` / `No UI — decision pending` — the case is a backend rule, a build process rule, or an undecided question, not a screen.
  - `No agreed screen yet` — the case needs a UI and the prototype has none. The row quotes the spec wording the UI must be designed from.
- **UI notes** use the spec's own words for behaviours. P-levels (P0/P1/P2) are the spec's, not this doc's.
- Sample data warning: anything the prototype shows with numbers (money, counts, distances, rankings) is sample. The real build reads live records; a figure that disagrees with its underlying orders by even one cent is a defect (UC-441).

## The agreed prototype — inventory

Studio prototype, space slug `dealspro-studio`, mobile-first, build c0370e91. Verified against `~/workspace/your_files/dealspro-studio/dealspro-studio.html` (Nov 24, 2026). Sixteen views, no others found:

| View id | Tab label | What it is |
|---|---|---|
| `view-today` | Today | Daily home: KPIs, one-thumb quick actions, coverage strip, alerts, Cities & nearby strip |
| `view-discover` | Discover | Agent launchpad: Scout (ranked merchant shortlist) and Hunter (draft Drop), launched by hand |
| `view-merchants` | Merchants · By City | Restaurants by State → Metroplex → Sub-city; Doing Business vs Pipeline; workspace; smart menu; chains |
| `view-demand` | Demand · Customers | Customer read view, who-to-ping lists, consent registry, messaging compliance |
| `view-finance` | Money | Live P&L & settlement, payout runs, tax/1099, creator payouts & fraud, creator self-service |
| `view-drops` | All Drops | Every Drop: search, filter, sort, compact list / visual cards, drawer, archive |
| `view-queue` | Review & Queue | Publish queue: checklist, blockers, waiting clock, escalation, batch bar, distribution |
| `view-orders` | Orders & Pickup | Orders list + pickup board (Paid → Ready → Picked up), QR scan, five-step timeline |
| `view-media` | Media Library | Video & photo library: upload, validation, transcode status, reuse, pin |
| `view-ai` | AI Draft | Conversational draft: describe in plain words, AI draft labelled NOT APPROVED |
| `view-ops` | Team & Coverage | Roles, coverage, alerts, support tickets, calendar, operators & audit trail |
| `view-outcomes` | Outcomes | Results by channel, attribution, per-Drop outcomes |
| `view-stack` | Tech Stack | Locked stack, staging vs prod, build pipeline, E2E gate, environments |
| `view-homepage` | DealsPro Home & Website | Design spec for the customer website: home, smart menu, Drop page |
| `view-top5` | Top 5 This Week | Customer Top 5 shelf + Studio operator ranking view (live in the prototype) |
| `view-coverage` | Use Cases v3.5 | The prototype's own use-case catalog (Studio numbering — see Disagreements) |

Mobile chrome (UC-224–UC-226, UC-243): bottom nav — Today, Review (with live badge), Drops, raised New Drop FAB in the middle, Orders, More — all remaining sections in a More sheet; desktop keeps the top-tab layout. Nothing is desktop-only. 44px+ tap targets, 16px form fields (no iOS zoom), bottom-sheet / full-screen drawers and forms, stacked labelled cards instead of sideways-scrolling tables, toasts clear of the bottom bar, safe-area padding.

## Common patterns — the Studio is agentic by default

The Studio is an agentic UI: agents do the work, the operator supervises and approves. Nothing an agent produces is ever auto-published.

- **Agent launchpad — Discover (`view-discover`).** Two agents, launched by hand from the Studio, never on a schedule. Scout: area + segment in, ranked merchant shortlist out (score + reasons to talk to each merchant — the score ranks, the reasons are the outreach pitch). Hunter: one picked merchant in, a draft Drop with its confidence case out. Results always land as approvals with evidence attached. The entity is Merchant (merchant-generic): merchants are the first category; the same launchpad serves retail and anyone else later.
- **AI Draft (`view-ai`).** "Describe it, review it, approve it." The operator describes the offer in plain words; the assistant drafts copy, matches the exact dish to an approved video, and flags missing details. It never charges customers, changes inventory, deletes orders, or bypasses publishing controls. AI drafts are always labelled and visually distinct from approved offers ("AI DRAFT — NOT APPROVED").
- **The two human gates — never automated, never bypassed.** (1) The restaurant confirms the EXACT offer (identity + timestamp; a material change auto-voids the confirmation — UC-208). (2) Mahendra authorizes every publish. No auto-publish ever — including from the New Drop composer ("New Drops can't publish directly — send for review so merchant confirmation + operator approval are recorded first"), from batch publish, from agents, and from MCP tools (§49).
- **Draft states — what a draft looks like while waiting.** A draft is unpublished, unclaimable, and clearly labelled Draft in Drops and in the restaurant workspace. A photo-only draft exists with publish disabled and the missing-video reason visible (UC-359). A restaurant-created submission lands in Review & Queue marked Restaurant-created with the restaurant named and the submission date/time; it can never publish directly (UC-203). A published Drop shows Live status, sold/remaining, and its tiny URL; a sold-out Drop stays visible, marked "Sold out", until its window ends; an ended Drop is archived, never deleted (UC-060).
- **Review drawer — the approval screen.** The queue item opens as a full phone screen: video preview, the review checklist (dish, presentation, video match, price/savings, quantity/window/cutoff), the restaurant confirmation record (who, when, how, offer fingerprint), blockers named, and Approve / Request changes / Reject. A blocked Drop shows why it cannot publish (UC-078). Material edits after confirmation send the Drop back for reapproval (UC-069).
- **Queue discipline — owner + waiting clock + escalation.** Every queue item shows an owner and a waiting clock (UC-221). After 2 hours it escalates to the named backup approver, who sees the same queue, checklist, and blockers (UC-220). Refunds, commission changes, and create-link revocation NEVER escalate — they wait for the operator by design (UC-222). The coverage strip on Today names the primary operator, the backup approver, and restaurant self-serve pickup (UC-219).
- **Toasts and undo.** Stage moves, removals, and publishes confirm with a toast and, where the spec gives one, an Undo (pipeline-lead removal, UC-199). A toast states what changed and what happens next; it never silently advances anything. Nothing advances on its own — no auto-advance of pipeline stages, no silent move to Doing Business (UC-197, UC-198).
- **Money reads in 10 seconds (UC-216).** Money (`view-finance`) answers per city, per restaurant, per Drop: what came in, what DealsPro keeps, what the restaurant and creator are owed, whether that Drop made money. Per-Drop P&L shows sold/unsold, sell-through, gross on claimed, unsold value, DealsPro keeps so far / at sellout, restaurant owed at sellout, creator share at sellout — plus a plain repeat / don't-repeat call. Commission and creator share count ONLY on redeemed/picked-up orders; $0 on visits, clicks, or paid-but-not-picked-up orders. Payment status and payout status are tracked separately everywhere.
- **No email anywhere.** Email is NOT a distribution channel (UC-210, UC-332): it must not appear in the composer picker, channel links, results, or the homepage. Channel set is locked: WhatsApp, Instagram, Facebook, SMS alert, RCS, TikTok, QR (UC-113).
- **Tiny URLs everywhere (UC-233).** Every URL the system generates is tiny — Drops (`dealspro.ai/d/abc123`), QR/pickup (`dealspro.ai/q/abc123`), creator links (`dealspro.ai/c/<handle>`), restaurant create links, smart-menu URLs. No UUIDs, no long query strings, in anything a customer, creator, or restaurant has to type, tap, or share. Short codes are server-generated, unique, collision-checked, unguessable (UC-354); no token or credential ever sits in a URL (UC-355).
- **Sign-in and roles.** Studio login is by magic link (Supabase Auth, allowlisted emails only — UC-155, UC-229, UC-368). Roles (UC-223): Operator (approve, publish, refund, change commission, manage create links); Backup operator (approve & publish a fully-checked Drop after 2h escalation, mark ready, redeem QR, request changes — cannot refund, change commission, or revoke create links); Restaurant manager (confirm offers, redeem QR, mark ready — own restaurant only, cannot publish, approve own submissions, or see other restaurants / the customer list); Viewer (read-only). Every backup action is audit-logged as the backup.
- **Environment badge (UC-367).** STAGING / PROD badge on every Studio screen so an operator never acts in the wrong environment. Staging and prod are separate Supabase projects, Stripe test vs live, secrets in Vercel per environment (UC-227, UC-230, UC-366).
- **The customer preview is not the Studio.** The customer-facing surfaces (§36 website/homepage, §43 cuisine filter, §46 Top 5, §47 food-ready messages, §48 timeline, §52 location gate, §56 customer preview) live in the separate `dealspro-customer-preview` build. The Studio's `view-homepage` and `view-top5` are the DESIGN SPEC and the operator preview for those surfaces — the customer never sees the Studio, the operator never works from a Drop page (UC-370).


## Per-section mapping

### §1 Restaurant onboarding & management — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-001, UC-002 | Studio — view-merchants | Merchants list + search | All restaurants in one list, searchable by name; city-scoped by the location picklist. |
| UC-003, UC-004 | Studio — view-merchants | New / edit restaurant form (full-screen sheet) | Location ONLY via State → Metroplex → Sub-city picklists, no free-text city; editing the city re-cascades. Every city label reads "Sub-city, State" (e.g. Prosper, TX). |
| UC-005 | Studio — view-merchants | Restaurant workspace — pickup setup | Pickup location + customer instructions on the workspace; carried onto the Drop page and order page. |
| UC-006 | Studio — view-merchants | Restaurant workspace — timezone | Timezone on the record; all windows, cutoffs, and timestamps render in the restaurant's timezone. |
| UC-007 | Studio — view-merchants | Restaurant card — status tag | Deactivate / "Temporarily unavailable" are status tags only; the restaurant stays listed. Removal is UC-200, never this tag. |
| UC-008 | Studio — New Drop composer | Composer step 1 (Dish) — restaurant picker | Restaurant picker first; only non-removed restaurants listed. |
| UC-009 | Studio — view-merchants | Restaurant workspace | One place: active Drops, drafts, media, orders, performance, agreed commission, private Drop-create link, city/metroplex/sub-city. |
| UC-010 | Studio — view-merchants | Restaurant workspace — Drops | All Drops belonging to the restaurant, grouped under it (city → restaurant → Drops). |
| UC-195, UC-196 | Studio — view-merchants | Location picklist + city browser | Three-step picklist (State → Metroplex → Sub-city) with counts per sub-city including 0-count; breadcrumb reads State › Metroplex › Sub-city. List splits Doing Business vs Pipeline per city; counts update with the picklist. |
| UC-197 | Studio — view-merchants | Pipeline card — stage buttons | Big full-width stage buttons; tap the EXACT target stage, confirm "Move X from [old] to [new]?" — tapping alone changes nothing, no auto-advance, no "Advance" button; change audit-logged with a toast. "Log touch" updates last touch only, never the stage. |
| UC-198 | Studio — view-merchants | Pipeline card — Getting ready state | "Getting ready" styled "in process" (dashed amber), never green/live, with banner "Still in pipeline — no live Drop, no sales". Move to Doing Business is an explicit operator-confirmed transition, never silent. |
| UC-199 | Studio — view-merchants | Pipeline card — Remove | Confirm spells out the removal; deletion audit-logged; Undo restores it. |
| UC-200 | Studio — view-merchants | Restaurant card — Remove from Studio… | Hides the restaurant from Doing Business and city lists, revokes its private create link, keeps Drops/orders/Money reachable, lists it in "Removed — history kept" with Restore. Restore returns it to Doing Business; the create link stays revoked until regenerated. Never cascade-deletes history. |
| UC-201 | Studio — view-merchants | Restaurant card — permanent delete | Offered ONLY at 0 Drops / 0 orders / 0 media; any other restaurant gets UC-200 (hide with history), never permanent delete. |
| UC-202 | Studio — view-merchants | Pipeline card | Every card shows last touch, next step, owner + backup; no lead sits without a next step or an owner; owner is never just Mahendra. |
| UC-203, UC-204 | Studio — view-merchants | Restaurant workspace — private create link | Unique private Drop-create link (`dealspro.ai/r/[slug]/create?key=…`), no login; shown on the workspace and on restaurant-created queue items. Regenerate kills the old link immediately; revoke is operator-only, audit-logged. Submissions land in Review & Queue marked Restaurant-created and can never publish directly. |

### §2 Drop creation & offer details — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-011–UC-020 | Studio — New Drop composer | Composer (full-screen sheet, 4 steps: Dish, Video, Offer, Publish) | Dish name, description + exact portion, photo/video, selling price, verified regular price, max quantity, pickup date/time window, order cutoff; save as unpublished draft. Dates/times are structured pickers in the restaurant's timezone, not free text. |
| UC-205, UC-206 | Studio — New Drop composer + Drop card | Composer step 1 + Serves pill | Bundle vs Non-bundle choice is required at creation (Non-bundle = Serves 1 only; Bundle = Serves 2, 3, 4, 5, 6+). Switching type swaps the serves options. Serves shows on the card, in review, and on the customer page as "Bundle · Serves 4" / "Non-bundle · Serves 1", with a Serves pill on the hero photo/video. No top-right BUNDLE badge — it was tried and removed. |

### §3 Video-first preview & publication — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-021, UC-022 | Studio — view-media + composer step 2 (Video) | Media picker | Video is a MUST for every Drop — no Drop without a real video hero (9:16, muted loop, poster fallback). A still photo alone is not a Drop; photo is poster/fallback only. |
| UC-023 | Studio — view-media | Library grouping | Media grouped by restaurant and dish; video is a reusable asset attached to the dish, NOT to a single Drop. |
| UC-024, UC-025, UC-026 | Studio — view-queue | Review drawer — live preview | Preview replicates EXACTLY the live Drop page — one shared component, sharing Drop state so a claim in one place moves counts everywhere; 9:16 vertical, muted autoplay + fallback, price/quantity/pickup/Claim button. Sold-out/ended Drops preview as unavailable. |
| UC-027 | Studio — view-queue | Review drawer — publish checklist | All required fields validated before publishing; blockers named, publish disabled until clear. |
| UC-028, UC-029 | Studio — view-queue | Review drawer — gates + Publish | Restaurant confirmation (identity + timestamp) recorded first, then operator approval, then Publish. Blocked until all approval conditions are satisfied. |
| UC-030 | Studio — view-drops / view-queue | Drop card / drawer — Copy link | Published Drop URL is a TINY URL (`dealspro.ai/d/abc123`) — Copy link on the card; never a long slug or UUID. |

### §4 Payment, QR & first redemption — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-031, UC-032 | Studio — view-drops | Drop card | Live status + sold and remaining quantities, live from atomic inventory. |
| UC-033 | No UI — system rule | — | Maximum inventory enforced server-side at payment; the UI shows the remaining count, it does not enforce it. |
| UC-034 | Customer website | Checkout flow (customer page) | Existing customer checkout flow; claim sheet → Stripe payment. |
| UC-035 | Studio — view-orders | Orders list | Stripe-confirmed payments and orders recorded; payment status and payout status shown separately. |
| UC-036 | Customer website | Order page — QR ticket | QR encodes a TINY URL (`dealspro.ai/q/abc123`), unique unguessable code per order, generated ON DEMAND when the order is paid, not pre-generated in bulk. |
| UC-037 | Studio — view-orders | Orders list | Paid orders displayed with restaurant, Drop, quantity, pickup window, QR status. |
| UC-038 | Restaurant pickup link + Studio — view-orders | Scan mode / pickup board | Redemption is ATOMIC: one scan checks the code, marks it redeemed, cannot be reused, even under simultaneous scans. |
| UC-039 | Studio — view-orders | Order row — status | Redeemed / picked-up status with timestamp and who redeemed it. |
| UC-040 | Studio — view-drops | Drop card — End | End or cancel a Drop without deleting paid-order history; orders stay reachable. |

### §5 Restaurant workspace & portfolio — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-041, UC-042 | Studio — view-merchants | Restaurant workspace — Drops | Drops grouped city → restaurant → Drops; Live / Scheduled / Draft / Ended counts per restaurant, scoped by the location picklist, excluding removed restaurants. |
| UC-043 | Studio — view-merchants | Restaurant workspace — Drops filter | Filter Drops within a restaurant. |
| UC-044 | Studio — view-merchants | Restaurant workspace — performance | Units sold and revenue per restaurant. |
| UC-045 | Studio — view-merchants | Restaurant workspace — windows | Upcoming pickup windows listed. |
| UC-046 | Studio — view-merchants | Restaurant workspace — media | Opens the restaurant-specific media library (view-media, scoped). |
| UC-047, UC-048 | Studio — view-merchants | Restaurant workspace — contacts & notes | Owner and manager contacts; operational notes and offer restrictions stored on the record. |
| UC-049 | Studio — view-merchants | Restaurant card — status tag | Flag a restaurant as temporarily unavailable — only retags it ("Temporarily unavailable") and keeps it listed; it is NOT removal — removal is UC-200. |
| UC-050 | Studio — New Drop composer | Composer defaults | Restaurant settings reused for future Drops (pickup, timezone, contacts pre-filled). |

### §6 All Drops — search, manage, edit, delete — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-051–UC-056 | Studio — view-drops | Drops list — search / filter / sort / view switch | Search by restaurant, dish, or name; filter Draft, Review, Scheduled, Live, Sold Out, Ended, Archived; sort by creation date, pickup date, sales, remaining; compact list vs visual cards; video thumbnail + duration; price, quantity, pickup together on each card. |
| UC-057 | Studio — view-drops | Drop management drawer | Opens per Drop: status, inventory, orders, links, edit/archive/delete actions. |
| UC-058 | Studio — New Drop composer | Composer in Edit mode | Edit eligible unpublished Drops ("Edit Drop" title, "Save changes"); a material change after confirmation voids confirmation (UC-208). |
| UC-059 | Studio — view-drops | Drop drawer — Delete | Permanent delete ONLY for eligible unpublished drafts with no protected dependencies; published Drops are archived, never deleted. |
| UC-060 | Studio — view-drops | Drop drawer — Archive | Archive previously published Drops; records and links preserved. |

### §7 Confirmation & operator approval — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-061 | Studio — view-drops / composer | Submit for review | Draft submitted for review; lands in Review & Queue. |
| UC-062 | Studio — view-queue | Queue list | Pending reviews at top with blockers + waiting clock; Source filter (Operator-created vs Restaurant-created, restaurant named, submitted date/time) with live counts; owner + waiting clock on every item. |
| UC-063–UC-066 | Studio — view-queue | Review drawer — checklist | Verify dish description/presentation, video matches the actual item and portion, pricing/savings claims, quantity/pickup window/cutoff — each a checklist item in the drawer. |
| UC-067 | Studio — view-queue | Review drawer — confirmation record | Restaurant confirmation with identity + timestamp, per order; applies equally to operator-created and restaurant-created Drops. Confirmation is offer-version-scoped (UC-399/UC-400). |
| UC-068 | Studio — view-queue | Review drawer — Reject / Request changes | Reject with a reason; returns the Drop for correction. |
| UC-069 | Studio — view-queue | Review drawer — reapproval | Material offer changes after confirmation require reapproval; the Drop returns to the queue. |
| UC-070 | Studio — view-queue | Publish button | Blocked until all approval conditions are satisfied (see §3). |

### §8 Scheduling & publishing queue — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-071 | Studio — view-queue | Queue list | Items carry owner, waiting clock, escalation state; private-create-link shortcut on restaurant-created items. |
| UC-072, UC-073 | Studio — New Drop composer | Composer — schedule | Schedule a Drop for a date/time in the restaurant's timezone; real datetime, not a placeholder. |
| UC-074 | Studio — view-queue | Queue item — Publish now | Publish an approved Drop immediately. |
| UC-075 | Studio — view-queue | Queue list — reorder | Reorder eligible queued Drops (manual reorder always available). |
| UC-076 | Studio — view-queue | Queue item — conflict flag | Overlapping/conflicting offers detected and flagged on the item. |
| UC-077, UC-078 | Studio — view-queue | Queue item — blocked state | Scheduled publishing blocked when approval is missing; the reason a Drop cannot publish is shown on the item. |
| UC-079 | Studio — view-queue | Queue item — failed publish | Failed scheduled publication stays in the queue with the reason and a safe retry; it never half-publishes. |
| UC-080 | Studio — view-queue / audit | Queue item + audit trail | Publication timestamp and responsible operator recorded. |

### §9 Video & image library — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-081–UC-084 | Studio — view-media | Upload + asset card | Upload supported video formats; size/format/duration validated; dimensions and runtime extracted; poster frame generated or selected. Processing status shows on each asset. |
| UC-085, UC-086 | Studio — view-media | Asset preview | Play actual video inside the Studio; preview media inside the mobile customer layout. (Prototype has no real video file; production needs real playback.) |
| UC-087, UC-089 | Studio — view-media | Library grouping | Videos grouped by restaurant and dish; approved videos reused for the same dish and presentation. |
| UC-088 | Studio — view-media | Asset card — approval | Review and approve videos before publication; a missing, unapproved, or still-processing video blocks publish with the reason named. |
| UC-090 | No UI — system rule | — | Immutable selected media version for published Drops enforced server-side (see also UC-360). |

### §10 Orders & pickup management — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-091–UC-094 | Studio — view-orders | Orders list — filters + search | Orders across all restaurants; filter by restaurant and Drop, by payment and fulfillment status; search by reference number. |
| UC-095, UC-096 | Studio — view-orders | Order row | Quantities, pickup instructions, and the pickup window on each order. |
| UC-097, UC-098, UC-099 | Studio — view-orders | Order row — QR status | QR ticket status; redemption time and authorized operator shown. |
| UC-100 | Restaurant pickup link + Studio — view-orders | Scan mode / order row | Actionable errors for invalid, expired, or used QR tickets (e.g. "Already picked up [time]"). |

### §11 Inventory & Drop lifecycle — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-101–UC-104 | Studio — view-drops / view-orders | Drop card + order counts | Real-time remaining inventory, inventory progress bar, low-inventory highlight, "Sold out" when exhausted (stays visible until the window ends). |
| UC-105 | No UI — system rule | — | Inventory decrements ATOMICALLY in Supabase on payment; simultaneous purchases cannot oversell. The UI shows the count, it does not enforce it. |
| UC-106 | Customer website | Drop page — Claim | Purchase cutoff enforced at claim; after cut-off the Claim button is gone (see §51). |
| UC-107, UC-108 | Studio — view-drops | Drop drawer — End Drop | Manually end an eligible Drop; paid orders are preserved. |
| UC-109, UC-110 | Studio — view-drops | Drop drawer — Run Again | Previous Drop as a template; new dates, inventory, orders — and a FRESH tiny URL with a new short code, never the old Drop's URL. |

### §12 Distribution, attribution & outcomes — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-111, UC-112 | Studio — view-queue | Distribution card — Copy link | Standard Drop URL is the TINY URL; one `?tag=` parameter with SHORT values (`?tag=whatsapp`, `?tag=insta`); no second `?ref=`. |
| UC-113–UC-118 | Studio — view-queue | Distribution card — channel composer | Sharing copy per channel: WhatsApp, Instagram, Facebook, SMS, RCS, TikTok. NO email anywhere (UC-210). Instagram copy carries the Safari nudge (in-app browser blocks Apple Pay). SMS alert is a distribution channel, distinct from transactional QR texts. |
| UC-119 | Studio — view-queue | Distribution card — creator link | Creator link + QR for the Drop; exists ONLY when the per-Drop distribution choice is not Owned only (UC-209). |
| UC-120 | Studio — view-queue | Distribution card | Distribution managed separately from publication; distribution status shown per Drop (UC-398). |
| UC-121–UC-124 | Studio — view-outcomes | Outcomes — by channel / per-Drop | Visits and checkout events where instrumentation supports them; paid/refunded/redeemed orders attributed to channels; units sold, sales value, redemption counts per Drop; compare restaurant and Drop performance for repeat opportunities. Attribution only — a channel's paid orders show what it drove, not proof the sale was incremental. |
| UC-209 | Studio — New Drop composer | Composer — distribution choice | Per-Drop choice: Owned only vs Selected creators vs Area pick list. Owned only shows no creator link and no creator commission. Distribution is OPTIONAL per Drop. |
| UC-210 | No UI — system rule | — | No email as a distribution channel, anywhere in the Studio: email must not appear in the composer picker, channel links, or results. |
| UC-211 | Studio — view-finance | Creator sections | One permanent creator link per creator (parent), per-Drop tagged links auto-generated underneath; creators pick approved Drops in their Dallas area, capped per Drop, paid on pickup only. PROPOSAL ONLY, not locked. |

### §13 Financial operations & reconciliation — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-125–UC-133 | Studio — view-finance | Money — statements & reconciliation | Gross sales by restaurant and period; Stripe processing-fee info; estimated DealsPro revenue; restaurant settlement amounts; payment and payout statuses tracked independently; payments needing reconciliation flagged; refunds + reasons; disputes and chargebacks; exportable reconciled restaurant statements. Settlement formula (locked): Net owed = gross paid − refunds − est. Stripe fees − restaurant commission − creator share; commission and creator share count ONLY on redeemed/picked-up orders. |
| UC-207 | Studio — view-merchants / view-queue / view-finance | Restaurant card, workspace, review drawer, Money | Agreed commission on the restaurant record: % per redeemed order + agreed-on date + agreed with / recorded by. Displayed rate is SAMPLE / EXAMPLE ONLY until a real rate is agreed. Form (% vs flat vs monthly, per-restaurant vs per-Drop) UNDECIDED. |
| UC-208 | Studio — view-queue | Review drawer — voided confirmation | Changing a restaurant's commission after it confirmed a Drop flags every confirmed Drop for re-confirmation; a material change to a confirmed Drop (price, quantity, pickup window, video, dish/portion) AUTO-VOIDS the prior confirmation — recorded as voided, not merely flagged — and the Drop cannot publish until the restaurant confirms the new version. Audit-logged. |

### §14 Recurring Drops & advanced scheduling — P2

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-135–UC-137 | Studio — view-ops | Calendar + recurring templates | Recurring weekly Drop templates; prepare multiple upcoming Drops. (Prototype Ops view has "Calendar — all merchants, next 7 days" and "Recurring templates".) |
| UC-143, UC-144 | Studio — view-outcomes / view-ops | Outcomes + calendar | Publishing-time recommendations, repeat suggestions, and demand forecasts from prior outcomes (sell-through, pickup reliability). |
| UC-138, UC-139 | Studio — view-ops | Calendar | Restaurant-specific calendar and a calendar across restaurants. |
| UC-140 | Studio — view-ops | Calendar — conflict flags | Pickup and publishing conflicts flagged on the calendar. |
| UC-141 | Studio — view-ops | Calendar — pause | Pause future scheduled Drops for a restaurant. |
| UC-142 | Studio — New Drop composer | Composer — from previous Drops | Create future drafts from multiple previous Drops (Run Again, UC-109, extended). |

### §15 Operational alerts & automation — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-145 | Studio — view-today + view-ops | Alerts (badge + Today) + phone | Approval-required alert goes to the primary AND, after the 2-hour wait, to the backup approver; the alert shows the owner and waiting clock. Every alert rule names its owner — an alert with no owner is a broken rule. Delivered in-Studio AND by SMS/WhatsApp to the operator's phone (UC-410). |
| UC-146–UC-154 | Studio — view-today + view-ops | Alerts feed | Publishing failed; inventory nearly exhausted; inconsistent payment/order states; pickup window approaching; repeated redemption failures; published media unavailable; orders requiring assistance; end-of-day operations summary; restaurants with repeated fulfillment problems. Each alert carries what, which, how long, and a deep tiny link to the item (UC-412). |

### §16 Security, permissions, audit & reliability — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-155 | Studio — view-ops | Sign-in (magic link) | Operator enters their email, clicks the link, and is in — no passwords, no password-reset flow. Roles: Operator, Backup operator, Restaurant manager, Viewer (UC-223). |
| UC-156, UC-157 | Studio — (roles apply everywhere) | Role-gated actions | Backup cannot refund, change commission, or revoke create links; restaurant managers see only their own restaurant and cannot publish or approve their own submissions. RLS: an actor sees only their own restaurant / orders. |
| UC-158, UC-159 | Studio — view-ops | Audit trail | Administrative create, edit, approval, publish, and deletion events persisted; "who changed a Drop and what was changed" shown on the Drop/order. |
| UC-160 | Studio — (confirmations) | Confirm step on destructive / money actions | Stronger authorization for destructive or financially significant actions. |
| UC-161, UC-162 | No UI — system rule | — | Deletion eligibility and valid workflow state transitions enforced server-side. |
| UC-163 | No agreed screen yet — UI to be designed from the spec wording: "Expose actionable integration failures without leaking sensitive data." | — | — |
| UC-164 | No UI — system rule | — | Recovery from failed operations and jobs (background behaviour; surfaced through the failed-alert path, UC-416, when it affects an order). |

### §17 LLM Drops & smart menus — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-165–UC-172 | Studio — view-ai | AI Draft — describe / draft / review | Create Drops from conversational AI instructions using approved restaurant/menu info; draft dish descriptions and offer copy; match the exact dish with an approved video; use previous Drops as context; detect missing/ambiguous/contradictory details; human confirms price, quantity, and pickup details; generate WhatsApp/Instagram/Facebook/SMS/RCS/TikTok promo copy. Drafts labelled AI DRAFT — NOT APPROVED, visually distinct from approved offers. |
| UC-174, UC-234 | Customer website | Smart-menu page | One smart-menu page per restaurant: live Drops (3–4 target; 3 sweet spot, 4 max, NEVER a filler Drop), each with video hero (Hero Dish tag overlaid on the picture, immediately next to the red DROP badge, on a hero-dish Drop), price, real scarcity, own pickup window. Works at 1, 2, 3, or 4 Drops. This is the restaurant's page — not a list of every Drop ever. |
| UC-175, UC-235 | Studio — view-merchants | Restaurant workspace — two tiny URLs | Smart-menu URL (tiny, unique to the restaurant's LOCATION) + private Drop-create URL. 1 claimable Drop → feature it; 2–4 → compact video-friendly smart menu; 0 → UC-236 fallback. One location = two tiny links: one to sell, one to create. |
| UC-176 | Customer website | Smart-menu page — sold-out card | A sold-out Drop stays VISIBLE on the smart menu until its pickup window ends, marked "Sold out" with NO buy button (it proves demand); after the window ends it drops off. Ended Drops are never purchasable. |
| UC-177, UC-178 | Studio — view-ai | AI Draft — repeat recommendations | Recommend previous dishes worth repeating; restaurant-specific dish and video context kept for AI. |
| UC-179 | Studio — view-ai / view-queue | Draft label | AI-generated drafts clearly distinguished from approved and published offers. |
| UC-236 | Customer website | Smart-menu page — 0-live state | 0 live Drops NEVER shows an empty page: "Next Drop coming soon" with the restaurant, a photo, and an alert signup (SMS / WhatsApp, unchecked by default). |
| UC-237 | Customer website | Smart-menu page | A smart menu with 1–2 Drops is fine — never add a filler Drop to reach 3–4. |
| UC-238 | Customer website | Smart-menu page — Drop card | Each Drop's pickup window in big type on its card, never buried; if two Drops share a window, say so; if they do not, make the difference obvious. |
| UC-239 | No UI — system rule | — | Creator credit from a smart-menu link: if a creator shares the smart-menu URL and a customer buys ANY Drop from that visit, that is the creator's sale (tag travels with the visit; last-tagged-link-wins, LOCKED, UC-248). |
| UC-240 | Studio — view-merchants | Restaurant workspace — promotion kit | QR poster for the counter, one-line WhatsApp message the restaurant can forward, bio link. |
| UC-241, UC-242 | Studio — view-media | Library — reuse | One video per dish across Drops: a new Drop of the same dish/presentation reuses the approved video; a new video only for a new dish or changed portion/presentation. Every Drop on the smart menu has its own video hero; no Drop appears with a still photo only. |

### §18 Cancellation, refunds & exceptions — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-180–UC-184 | Studio — view-orders | Order row — cancel / refund | Cancel an unpaid or pending order; cancel a paid, unredeemed order before pickup; full refund through Stripe; authorized partial refunds; a cancellation reason is required. |
| UC-185, UC-190 | Studio — view-ops | Support ticket — exception | Redeemed orders need the exception process (support case, UC-249); authorized bulk cancellations supported. |
| UC-186, UC-187 | No UI — system rule | — | QR tickets invalidated for canceled orders; inventory restored only when eligible and transactionally safe. Surfaced on the order (status) and the Drop (count). |
| UC-188, UC-191, UC-192 | Studio — view-orders / view-finance | Order row + Money | Cancellation and refund statuses shown separately; cancellations/refunds included in restaurant financial reports; cancellation actor, timestamp, and reason recorded. |
| UC-189 | Customer website | Order page + messages | Customer notified of cancellation/refund through an authorized channel (transactional message, UC-267). |
| UC-193 | No UI — system rule | — | Duplicate refunds prevented through idempotency and payment-state checks. |
| UC-194 | Studio — view-drops | Drop drawer — cancel whole Drop | Cancel an entire Drop while preserving and resolving its existing orders (see UC-259/UC-260 for the policy layer). |

### §19 Demand & customers — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-212 | Studio — view-demand | Customer list (read view) | Name, phone, city + distance to nearest restaurant, order count, total spent, last Drop + status, pickup record. Read view of the backend record, not a second copy. Shows the consent-registry state exactly — per-channel opt-in status, source, timestamp (UC-388) — not a paraphrase and not a cached copy. |
| UC-213 | Studio — view-demand | Who-to-ping lists | "Who to ping for the next Drop" (repeat buyers near a live restaurant first), first-time buyers in a pickup window today, "Never ping" (no alert opt-in, or replied STOP). Filters: All / Repeat buyers / First-time / Ready to ping + search. |
| UC-214 | Studio — view-demand | Consent state per customer | Per-channel opt-in status (SMS / WhatsApp / RCS), enforced: marketing consent is SEPARATE from transactional QR texts; opt-in asked AFTER a successful claim, unchecked by default, remembered, per channel; revocation via STOP. |
| UC-215 | Studio — view-demand | (absence by design) | NEVER show card numbers, expiry, or CVV, and NEVER show a customer's full home address. Card data stays in Stripe. This is a hard rule, not a UI preference. |

### §20 Money — top-level P&L & settlement — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-216 | Studio — view-finance | Money — per-Drop P&L | Sold/unsold, sell-through, gross on claimed, unsold value, DealsPro keeps so far / at sellout, restaurant owed at sellout, creator share at sellout. Readable in 10 seconds. |
| UC-217 | Studio — view-finance | Money — by sub-city | Money by city (state + metroplex + sub-city): active restaurants, gross, DealsPro keeps, owed. |
| UC-218 | Studio — view-finance | Money — per-Drop call | Repeat / don't-repeat call per Drop from sell-through ("On track — likely repeat", "Watch — sell-through still low", "Don't repeat at this price / window"). |

### §21 Team & coverage / no single point of failure — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-219 | Studio — view-today | Coverage strip | Primary operator, named backup approver, restaurant self-serve pickup — on Today. |
| UC-220, UC-221 | Studio — view-queue | Queue item — owner + waiting clock | Escalate to the backup approver after 2 hours; the backup sees the same queue, checklist, and blockers, acts inside the same rules (fully-checked Drops only, restaurant confirmation still required). Owner + waiting clock on every queue item. |
| UC-222 | Studio — view-queue / view-orders / view-finance | (absence by design) | Refunds, commission changes, and create-link revocation NEVER escalate — they wait for the operator by design; no alert for those goes to the backup. |
| UC-223 | Studio — view-ops | Operators, roles & audit trail | Roles enforced (Operator / Backup operator / Restaurant manager / Viewer — see Common patterns). Every backup action audit-logged as the backup. |

### §22 Mobile-first Studio — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-224 | Studio — mobile chrome | Bottom nav + More sheet | Mobile bottom nav (Today, Review with live badge, Drops, raised New Drop FAB, Orders, More); all remaining sections in a More sheet; desktop keeps the top-tab layout. |
| UC-225 | Studio — (all screens, mobile) | Chrome rules | One-handed use: 44px+ tap targets, bottom-sheet / full-screen drawers and forms, 16px form fields (no iOS zoom), stacked labelled cards instead of sideways-scrolling tables, toasts clear of the bottom bar, safe-area padding. |
| UC-226 | Studio — view-today | Quick actions | One-thumb quick actions on Today: Review queue, Scan QR ticket, New Drop, Money. |
| UC-243 | Studio — (whole app) | Installable web app | NO native app yet: mobile-first web app, installable via Add to Home Screen (full-screen, one tap from the phone, no browser chrome). |

### §23 Tech stack, staging vs prod & infrastructure — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-227 | Studio — view-stack | Tech Stack — environments | Two environments, same code, different env vars — staging (staging site, staging Supabase, Stripe test mode, SMS mocked) and prod (dealspro.ai, prod Supabase, Stripe live). Nothing goes to prod without Mahendra approving it. Full test Drop must pass in staging before any prod promotion. |
| UC-228 | Studio — view-media / view-stack | Media processing | Every Drop has a real video hero, stored in Supabase Storage, processed on upload (9:16, muted loop, poster frame, compressed). |
| UC-229 | Studio — view-ops | Sign-in | Magic link (Supabase Auth); customers never log in — phone number is their identity. |
| UC-230, UC-231 | No UI — process rule | — | Secrets in Vercel per environment, never in code, never in GitHub; domain on IONOS, DNS to Vercel. Deployment facts, not screens. |
| UC-232 | No UI — system rule | — | QR scales by scaling the database and redemption check, not the QR image; prove with a simultaneous-purchase / simultaneous-scan test in staging before prod. |
| UC-233 | No UI — system rule | — | Every generated URL is TINY (see Common patterns). Applies to every link the system generates. |

### §24 Scale — first scale — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-244 | Studio — view-queue | Queue — batch bar; throughput dashboard: No agreed screen yet — UI to be designed from the spec wording: "Studio shows, per day and per operator: Drops reviewed, median minutes per Drop from submission to publish, queue age by item, and a red flag when median exceeds 30 min for a first Drop / 10 min for a repeat. Queue sorts by pickup urgency, then waiting time." | Batch review exists in the prototype (bulk bar): select multiple fully-checked Drops, approve/publish in one confirmed batch action; each Drop still individually checklist-gated; one failure blocks only that Drop. The per-day/per-operator throughput dashboard is not drawn. |
| UC-245 | Studio — view-finance | Money — creator payouts | Automated creator payout on pickup via Stripe Connect, on a fixed schedule (weekly proposed), with minimum; each payout shows the orders it covers, the per-order math, and a payout receipt; no payout below the minimum rolls to the next cycle. |
| UC-246 | Studio — view-finance | Money — restaurant settlement | Scheduled payout, reconciliation, and hold via Stripe Connect; settlement statement per period (gross, refunds, Stripe fees, commission, creator share, net paid) tied to a bank/Stripe payout reference. Payout held automatically when an unresolved refund/chargeback exceeds a threshold or payout details are unverified; hold, reason, and release audit-logged and visible to the restaurant. |
| UC-247 | Restaurant pickup link + Studio — view-orders | Pickup board (live queue) | Live pickup queue for the current window: order, customer first name + phone last digits, quantity, ready/not-ready, redeemed/not-redeemed, time remaining. Restaurant can mark Ready; operator can redeem by reference number when a QR will not scan (audit-logged). At window end, unclaimed paid orders listed as "unclaimed — resolve" (refund / hold for late pickup / forfeit per the restaurant's policy); none silently kept or refunded. |
| UC-248 | Studio — view-finance | Money — fraud checks & attribution disputes | Flags: creator's own phone/device buying through their own link; multiple orders from the same phone/device through one creator link in a short window; a creator link used only by orders that never pick up. Flagged orders held from creator payout pending review; creator NOT paid on own purchases. Attribution conflicts resolve by LOCKED rule last-tagged-link-wins; the rule is shown on the order, never decided case by case. |
| UC-249 | Studio — view-ops | Support tickets | Every support request is a ticket tied to an order/Drop/restaurant, with status, owner, and waiting clock. Five one-tap resolutions: resend QR by SMS, redeem by reference, refund, rebook to a Repeat Drop, "I paid but the Drop says sold out". Searchable by phone/order; cannot close without a resolution reason. Customer-facing help page linked from every Drop and QR confirmation. |
| UC-250 | Studio — view-demand | Messaging compliance | Per message: recipient, channel, Drop, consent basis, template used, delivery status, opt-out; every send labelled transactional vs marketing at send time. Sends BLOCKED when: no opt-in for that channel, STOP on file, already sent a marketing message about a Drop in the same zone within the window (proposed: 1/week unless they claimed), or sender registration not approved. Twilio / WhatsApp Business sender status shown; a blocked sender halts marketing sends automatically. |
| UC-251 | Studio — view-merchants | Chains section | Chain parent record (one commission agreement, one payout method, one contact) with locations underneath; video/dish/price terms shared; Drops, inventory, pickup, smart menus per location. Money per location AND consolidated per chain. |
| UC-252 | Creator view | Creator self-service (as specified in view-finance) | Creator applies / is invited, provides payout details (Stripe Connect) and tax info, gets a read-only view: permanent link, Drops in their area with commission per picked-up order, picked-up orders, accrued earnings, payout schedule and history, attribution rule. Cannot change price/quantity/window; cannot see other creators' earnings or the customer list. Portal vs link + WhatsApp at first scale — TO CONFIRM. |
| UC-253 | Studio — view-finance | Money — tax & payout identity | Payout identity and tax collection via Stripe Connect: tax form/ID collected before a payee's first payout above the threshold (proposed $600/year — confirm with preparer, do not hard-code tax law); payout blocked until on file. Annual 1099 totals exportable per payee. |

### §25 Cancel, refund & pickup issues — P0 (PROPOSED policy layer; restaurant-direct model)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-254 | Customer website | Order page | No customer Cancel button and no reply-CANCEL: the order page shows the restaurant's phone number and tells the customer to call the restaurant. The page shows live status and what happens next (full refund if the restaurant cancels before Ready, support case after Ready, no refund after the window if not picked up). |
| UC-255, UC-256 | Restaurant pickup link + Studio — view-orders | Pickup link — Cancel tap; order row | Restaurant taps Cancel (before the window starts, or during the window before Ready): QR invalidated instantly, inventory restored, full refund to the original card (5–10 business days). No operator action. A phone call with no tap is no cancel (UC-482). If the restaurant says no, the order stays live (UC-486). |
| UC-257 | Studio — view-ops | Support ticket | After Ready, NO cancel by customer or restaurant — support case, operator decides (usually refund if the restaurant agrees, or credit for the next Drop). The pickup link shows no Cancel action for a Ready order. |
| UC-258 | Studio — view-ops | Support ticket | After pickup: NO refund except a real issue (wrong item, bad food, missing item) — support case with a photo if needed, operator decides. |
| UC-259, UC-260 | Studio — view-drops | Drop drawer — cancel whole Drop | Restaurant cancels a whole Drop after orders are paid (or DealsPro cancels it): every customer gets a full refund automatically + a message explaining why + first access to the next Drop from that restaurant. Restaurant earns a reliability strike; TWO strikes = probation, no new Drops until the operator reviews. Cancel, reason, and every refund audit-logged. |
| UC-261 | Restaurant pickup link | Pickup link — "Refund as goodwill" | No-show / unclaimed order: grace through the end of the window, one reminder text, then marked unclaimed with NO refund by default. The RESTAURANT may override ONCE as a goodwill refund by tapping "Refund as goodwill" with a reason; audit-logged. Never silently kept, never silently refunded. |
| UC-262 | Studio — view-finance | Money — refund rules | Refunds always to the ORIGINAL card, never cash or DealsPro credit by default; Stripe fees on a refunded order are NOT charged to the customer; creator and restaurant are NEVER paid for a cancelled/refunded order; refund/cancellation statuses displayed separately; duplicate refunds prevented by idempotency. |
| UC-263 | Studio — view-orders / view-finance | Order row + Money — audit log | Every cancel, refund, and override audit-logged with who did it, when, and why — including restaurant-direct cancels (actor = the restaurant, pickup-link identity, tap time, reason, before/after values). Visible in Money and on the order. A phone call with no tap has no audit entry. |
| UC-264, UC-265 | Restaurant pickup link + Studio — view-orders | Pickup link — Ready buttons; Orders board | Private pickup link (no login, no app) shows that Drop's order list in pickup order — customer first name, quantity, ticket code — with a big Ready button per order and a Ready All button at the top. Replying READY marks ALL orders for that Drop Ready. The Ready timestamp is recorded per order and LOCKS the cancel cutoff. A restaurant must be able to mark 15 orders Ready in under a minute. |
| UC-266 | Studio — view-ops | Alerts — reliability flag | A restaurant that never marks Ready: the end of the window is the cutoff, and the restaurant is flagged for unreliable Ready behaviour (ties to UC-154 and the UC-259 strikes). |
| UC-267 | Customer website + messages | Order page + transactional texts | Automatic transactional messages on the channel the customer ordered from: order confirmed (with the restaurant's phone number, order code, "For any changes, call the restaurant directly at [number], quote order [code]") → ready for pickup → picked up, thank you → cancelled, refund on its way (with amount and 5–10 business day timing). Cancel message sent ONLY on the restaurant's in-system tap. Marketing opt-in is SEPARATE and never mixed in. |
| UC-268 | Restaurant pickup link | Pickup link — manual code entry | QR will not scan: the restaurant enters the ticket code instead — same one-time redemption as UC-038, same redeem-by-reference path as UC-247, audit-logged; cannot redeem an already-redeemed, cancelled, or refunded order. |
| UC-269 | Restaurant pickup link + Studio — view-orders | Pickup link / order row — flag problem | Restaurant flags a problem (running late, wrong item being remade); the customer automatically gets a text with the new time. If the remake cannot be done in the window, the order becomes a support case (UC-257/UC-258). |
| UC-479 | Customer website | Order page + confirmation text | After claim/payment, the confirmation text and the order page show together, in plain type: restaurant name, its published/order phone number, the order code, and the pickup window (date + start/end), with "For any changes, call the restaurant directly at [number], quote order [code]". Repeated at every status step until picked up or closed. |
| UC-480 | Restaurant pickup link | Pickup link — Cancel action | Cancel per order: tap Cancel on the pickup link (next to Ready, never instead of it) for any order not yet Ready whose window has not ended, or reply CANCEL [code]. Asks for a reason (short list: customer asked, cannot fulfil, wrong quantity, other — free text for "other"), then confirms "Cancel order [code] and refund [amount] to the customer?". Per order only, never per Drop. |
| UC-481 | No UI — policy rule | — | A change is a cancel plus a new claim — no partial changes, no swaps. The customer cancels (UC-255/UC-256) and claims again as a new order with a new code and a new QR, if units remain. |
| UC-482 | Customer website + Restaurant pickup link | Order page + pickup link | A phone call alone is never the system of record — no tap, no refund, no sync. Stated to the customer in the confirmation and to the restaurant on the pickup link ("Tap Cancel to refund this order — a phone promise alone does not refund it"). Dispute rule: no tap → operator answers from the tap record and opens a support case. |
| UC-483 | Restaurant pickup link | Pickup link — "Refund as goodwill" | After the window, didn't pick up: the restaurant may refund once as goodwill (UC-261), full order amount, never partial, with a reason; QR invalidated, audit-logged. Available once per order, never twice; a second request is a support case. |
| UC-484 | Restaurant pickup link | Pickup link (absence by design) | After Ready, the restaurant cannot cancel either — the pickup link shows no Cancel action for a Ready order, and a CANCEL [code] reply is rejected with a message telling the restaurant to contact the operator. A restaurant that marks Ready by mistake must contact the operator. |
| UC-485 | Customer website | Order page + confirmation text | The restaurant number shown to customers is the published/order number — never the owner's personal mobile — and it is shown ONLY on the order page and in the confirmation text, never on the public Drop page, smart menu, or a marketing message. If no published number is on record, the order page shows "Call the restaurant" with no number and flags the restaurant in review. |
| UC-486 | No UI — policy rule | — | If the restaurant says no on the phone, the order stays live and the restaurant tells the customer. DealsPro sends no message contradicting it and no message confirming a cancel that did not happen. |
| UC-487 | Studio — view-orders / view-finance | Order row + Money — sync | On the restaurant's tap, DealsPro syncs back instantly — QR invalidated, inventory restored, refund automatic, money rules applied — one atomic transaction, visible in the same second in the Studio (order status Cancelled, inventory restored) and in Money. A cancel not visible in Money in the same second is a sync defect, not a delay. |
| UC-488 | Studio — view-orders / view-finance | Orders board + Money | The operator sees every restaurant-direct cancel in the Studio and can investigate a dispute — but cannot override a restaurant's no without the restaurant. Operator's own cancel powers stay narrow: whole-Drop cancels (UC-260) and support-decided refunds after Ready (UC-257). |

### §26 Claim → restaurant confirm → Ready — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-270 | Restaurant pickup link | Claim notification | The moment payment succeeds, the restaurant receives the claim — dish, quantity, customer first name, order code, pickup window. |
| UC-271 | Studio — view-orders + Customer website | Order row + order page — status | Until the restaurant accepts, the order status is "Claimed — awaiting restaurant confirmation" — a distinct, visible status in the Studio, on the order page, and on the pickup link. |
| UC-272 | Restaurant pickup link | Pickup link — Accept button | The restaurant must EXPLICITLY accept the claim — an Accept step, not silence. Accept is per order (Accept button on the private pickup link). |
| UC-273 | Restaurant pickup link | Pickup link — Decline button | If the restaurant CANNOT fulfil the claim, it declines it explicitly — and the customer is refunded and told. Decline button / reply DECLINE. |
| UC-274 | Customer website + messages | Order page + transactional text | Once the restaurant accepts, the customer automatically gets a "Restaurant accepted your order" message, immediately, on the SAME channel they ordered from. |
| UC-275 | Restaurant pickup link + messages | Pickup link — Ready; ready text | When the food is ready, the restaurant marks it Ready and the customer automatically gets a "Ready for pickup" message. |
| UC-276 | Customer website | Drop page + order page | The 2–3 hour pickup window is shown EXACTLY, everywhere, in big type — date + start time + end time, in the restaurant's timezone. |
| UC-277 | Customer website | Order page — status timeline | The customer always sees a live status timeline: Claimed → Accepted by restaurant → Ready → Picked up, with the current step highlighted. |
| UC-278 | Customer website | Order page — countdown | Live countdown / time remaining in the pickup window ("Pickup window ends in 1 h 2…"). |
| UC-279, UC-280 | Studio — view-ops + messages | Alerts + delay texts | If the restaurant is LATE to accept, the customer gets a delay message and the operator is alerted — never silence. Same for late to mark Ready: delay message with a new time. |
| UC-281 | Studio — view-ops | Support / escalation | If the restaurant does NOT accept within the defined window, the order escalates to the operator and the customer is told what is happening. |
| UC-282 | No UI — transparency rule | — | Every status change triggers a message, and Ready is never faked. |

### §27 Stripe Connect & automated payouts — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-283 | Studio — view-finance | Money — payout rail | Stripe Connect (Express) is the only payout rail for restaurants and creators — no manual transfer method is offered as the system of record. |
| UC-284 | Studio — view-finance | Money — onboarding status | Every restaurant location and every earning creator has its own Connect account, onboarded once through a Stripe-hosted flow reached from a tiny DealsPro link. Onboarding status shown per payee. |
| UC-285 | No UI — system rule | — | Split each payment at charge time: Stripe fee, DealsPro commission, creator share (when attributed) and restaurant net each land in the right balance — no month-end manual splitting. Surfaced in Money per order/period. |
| UC-286 | Studio — view-finance | Money — holds | Commission and creator share earned only on redeemed orders: shares for refunded or never-picked-up orders are released back at the hold instead of paying out. |
| UC-287 | Studio — view-finance | Money — payout schedule | Payouts on a fixed schedule (weekly, Fridays) covering orders picked up at least 2 days earlier — the hold window absorbs refunds and chargebacks from the Connect balance before payout. |
| UC-288 | Studio — view-finance | Money — early release | Operator-approved early release per payee, audit-logged, when the balance is clean. |
| UC-289 | Studio — view-finance | Money — creator balances | Creator balances under the $10 minimum payout roll forward to the next run automatically. |
| UC-290 | Studio — view-finance | Money — reconciliation | Daily reconciliation against Stripe balance transactions: every payout leg ties to order IDs, and any exception (payout without orders, order without payout leg) is named. |
| UC-291 | Studio — view-finance / view-orders | Money + order rows — two statuses | Keep payment status and payout status separate everywhere; a paid order is not a paid-out order. Both statuses shown independently on orders and in Money. |
| UC-292 | No UI — environment rule | — | Stripe test mode with test Connect accounts in staging and live accounts only in prod; no real payout can ever leave staging. Surfaced by the environment badge (UC-367) and the Money screen's test-mode state. |
| UC-293 | Studio — view-finance | Money — requirement status only | Never store bank account numbers, SSNs or tax documents in DealsPro or Studio — Stripe holds them; Studio shows status only (same rule as UC-343). |

### §28 Operator throughput & batch review — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-294 | Studio — view-queue | Queue list — sort | Review queue ordered by pickup urgency first, then longest wait, with manual reorder always available. |
| UC-295 | Studio — view-queue | Queue header — health | Queue health at a glance: items in queue, oldest wait, items past the 2-hour backup-escalation window. |
| UC-296 | Studio — view-queue | Queue — batch bar | Select multiple queue items and publish every fully-checked one in a single batch action — each item still passes the complete publish check (video gate, serves, price, confirmation). |
| UC-297 | Studio — view-queue | Queue — batch bar (exclusion) | Never batch-publish a restaurant submission: every submission gets its own individual operator decision (approve / request changes / reject), however long the queue is. |
| UC-298 | Studio — view-queue | Queue — batch result | Never batch-publish a blocked Drop; the batch result names what was published and what stayed, with reasons. |
| UC-299 | No agreed screen yet — UI to be designed from the spec wording: "Record review time per Drop (reviewer, minutes, outcome) and show the running average against a ≤5-minute target in the queue." | — | — |
| UC-300 | No agreed screen yet — UI to be designed from the spec wording: "Surface the Drop types that repeatedly take the longest in review so the checklist or form gets fixed instead of the operator working longer." | — | — |
| UC-301 | Studio — view-ops | Audit trail | Batch actions audit-logged as one event listing every Drop it touched. |

### §29 Pickup at burst, QR fallback & unclaimed orders — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-302 | Restaurant pickup link | Pickup board | Each restaurant gets a pickup board — Paid → Ready → Picked up lanes, oldest first, big tap targets — the same order records as the Orders list, never a second copy. |
| UC-303 | Restaurant pickup link | Pickup board — scope | Board scoped per restaurant: managers run only their own counter's board, on a phone, without Studio access to anything else. |
| UC-304 | Restaurant pickup link | Pickup board — one-tap moves | Move an order Paid → Ready → Picked up from the board in one tap each, with the change reflected everywhere instantly. |
| UC-305 | Restaurant pickup link | Pickup board — manual code entry | Redeem by manual code entry (ticket short code or order number) when a QR cannot scan — the identical one-time atomic redemption; rejects an already-redeemed code. |
| UC-306 | Restaurant pickup link | Pickup board — error | Reject an unknown code with a specific instruction (check the confirmation text, try the order number) — a pack is never handed out against an unverified code. |
| UC-308 | Studio — view-ops | Support ticket — unclaimed decision | After grace + reminder, an explicit operator decision per unclaimed order — refund or no-refund per the Drop's terms — and a support ticket opens automatically so every unclaimed order is resolved, never silently closed. (UC-307 retired/deleted — excluded from the count.) |
| UC-309 | Restaurant pickup link | Pickup board — lane totals | Board lane totals counted live so a counter can see a rush building (e.g. 14 Ready at once) and call for help before it jams. |

### §30 Creator self-service, fraud & attribution integrity — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-310 | Creator view | Creator self-service — magic-link sign-in | Each creator gets a self-service view behind their own magic-link sign-in, scoped to themselves only: Connect onboarding status, earnings per Drop, payout schedule and next payout. |
| UC-311 | Creator view | Creator pick list | Pick list of operator-approved Drops in their area with the exact per-order share and any per-Drop creator cap; owned-only Drops never appear. |
| UC-312 | Creator view | Creator permanent link | One permanent tiny creator link `dealspro.ai/c/<handle>` — Drop links generate under it automatically; creators never manage per-Drop links. |
| UC-313 | No UI — system rule | — | Attribute one order to exactly one credit, read from the server-side visit log: **last-tagged-link-wins, LOCKED**. Shown on the order (see UC-248). |
| UC-314 | Studio — view-finance | Money — fraud checks | Every creator-attributed order checked for self-dealing (buyer phone and payment fingerprint vs the creator): a self-purchase counts as a restaurant sale with the creator share zeroed. |
| UC-315 | Studio — view-finance | Money — dispute hold | Freeze only the contested order's creator share while an attribution dispute is open; restaurant payouts are never held for a creator dispute. |
| UC-316 | Studio — view-finance | Money — dispute decision | The operator decides a dispute from the visit log in Studio, with the decision and its reason audit-logged and the held share released or reversed accordingly. |
| UC-317 | Creator view | Creator earnings — held amounts | Creators see their held / disputed amounts as held — never as earned — so self-service numbers always match what Connect will pay. |

### §31 Support at volume — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-318 | Studio — view-ops | Support tickets | Every customer or restaurant problem becomes a ticket with an owner, an age clock and an SLA — problems are resolved in a system, not in the operator's personal messages. |
| UC-319 | Customer website | Order page / order text — support entry | A buyer opens support from their order text / QR page, attached to that order automatically — never via a personal phone number. |
| UC-320 | Studio — view-ops | Ticket — resolution actions | Tickets have real resolution actions, not just replies: refund (via Money), QR reissue (via Orders), pickup message to the customer or restaurant, each recorded on the order. |
| UC-321 | Studio — view-ops | Ticket — SLA escalation | A ticket that passes its SLA escalates to the backup operator automatically, with the full order context attached. |
| UC-322 | Studio — view-ops | Ticket — handoff | Hand a ticket between operator and backup in one action, audit-logged, without losing its history. |
| UC-323 | Studio — view-ops | Tickets — auto-created | Auto-create a ticket for system-detected problems: unclaimed orders after grace, failed scans repeated on one ticket, payout exceptions. |
| UC-324 | Studio — view-today | Today — support strip | Open-ticket counts and the oldest ticket shown on Today so support debt is as visible as the publish queue. |
| UC-325 | Customer website | Order page — resolution thread | One thread per order that the customer can see the resolution of (refunded, reissued, picked up) without exposing internal notes. |

### §32 Messaging compliance & fatigue — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-326 | Studio — view-demand | Messaging compliance — sender status | SMS 10DLC brand + campaign registration complete and kept current before sending at volume; registration status shown in Studio. Carrier filtering is treated as an outage, not a shrug. |
| UC-327 | Studio — view-demand | Messaging compliance — WhatsApp sender | WhatsApp alerts only from the approved WhatsApp Business sender with pre-approved, versioned templates; a template change is approved before use. |
| UC-329 | No UI — system rule | — | Per-channel consent checked at send time for every single send: a consent revoked after a campaign was queued blocks that send, and the send log records who was skipped and why. (UC-328 retired/deleted — excluded from the count.) |
| UC-330 | Studio — view-demand | Consent registry — STOP | STOP honoured instantly, on that channel, with the revocation written to the consent record with its timestamp. |
| UC-331 | Studio — view-demand | Consent registry — per-send audit | Every consent stored with channel, source and time so any send can answer why it was allowed — the per-send consent audit is viewable in Demand. |
| UC-332 | No UI — system rule | — | Never use email as a distribution channel; distribution is WhatsApp, Instagram, Facebook and SMS/RCS only. Same rule as UC-210. |
| UC-333 | No UI — system rule | — | All messaging mocked in staging — compliance statuses shown there are the prod registration records, never test sends to real numbers. |

### §33 Chains & multi-location — P2

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-334 | Studio — view-merchants | Chains section — parent + locations | A chain is a parent brand with locations under it; a Drop is always created, sold and settled by exactly one location, never by the brand. |
| UC-335 | Studio — view-merchants | Chain parent record | Shared at brand level only what is genuinely shared: agreed commission terms, menu and approved dish videos, brand notes. |
| UC-336 | Studio — view-merchants | Location record | Per location, always: its own Stripe Connect account and payouts, its own two tiny URLs (promote + add), its own Smart Menu, pickup board, reliability record and removal state. |
| UC-337 | Studio — view-merchants | Onboard location | Onboard an additional location of a known brand with the brand paperwork pre-filled but every location step still required (Connect onboarding, pickup setup, first-Drop approval). |
| UC-338 | Studio — view-finance | Money — by brand / by location | Money reporting rolls up by brand while always breaking settlement out per location — a brand total is a view, never a payout. |
| UC-339 | Studio — view-merchants | Location — remove / pause | Removing or pausing one location never affects its siblings' links, menus or payouts. |
| UC-340 | Studio — view-merchants | Chains section (absence by design) | Single-location partners shown as independent — the chain model appears only where a brand actually has more than one location. |

### §34 Tax, 1099 & payout identity — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-341 | Stripe-hosted onboarding (external) | Connect onboarding flow | Legal name, address, tax form (W-9) and identity verification collected inside Stripe Connect onboarding, before a payee's first payout — never through chat, email or a Studio form. |
| UC-342 | Studio — view-finance | Money — payout status | Payouts disabled for a payee whose onboarding is incomplete (identity pending, tax form missing) while their earnings keep accruing in their Connect balance. |
| UC-343 | Studio — view-finance | Money — requirement status | DealsPro stores only the status of each requirement (collected / pending / failed) — the documents and numbers live with Stripe and are never displayed in Studio. |
| UC-344 | Studio — view-finance | Money — 1099 export | Year-end 1099 reporting generated from Stripe payout records; DealsPro never reconstructs a payee's year from transfer memos. |
| UC-345 | Studio — view-finance | Money — threshold flags | Any payee approaching the reporting threshold with an incomplete tax record is flagged months before year-end, in Money, with an owner. |
| UC-346 | Studio — view-finance | Money — status changes | Stripe prompts the payee directly for missing items; the operator sees status changes, not the underlying documents. |
| UC-347 | Studio — view-finance | Money — same rule for creators | The same identity rule applies to creators as to restaurants — no payee category is paid on trust. |

### §35 Studio detail cases — Smart Menu, tiny URLs, video gate, tech stack, sign-in & QR at scale — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-348 | No UI — system rule | — | Validate the private ADD code server-side; the link record (active / rotated / revoked) lives server-side, rotating issues a new tiny code and kills the old one instantly, and revoking the ADD link never affects the PROMOTE link. |
| UC-350 | Studio — view-merchants | Restaurant workspace — Smart Menu preview | Preview the public Smart Menu in Studio exactly as customers see it — 0, 1, 2, 3, 4 and sold-out states — with Copy link on the card. |
| UC-351 | No UI — system rule | — | Serve Smart Menu pages cache-friendly (CDN / static shell) so a counter-QR rush does not hit the database per view; live inventory truth is checked at claim. |
| UC-352 | Studio — view-merchants | Restaurant card — Remove | Take the Smart Menu offline and revoke the ADD link when a restaurant is removed from Studio, with its history kept and Restore available. |
| UC-353 | Studio — view-today + view-ops | Alerts | Alert the operator when a partner Smart Menu sits at 0 live Drops beyond the restaurant's normal rhythm. |
| UC-354, UC-355, UC-356 | No UI — system rules | — | Short codes generated server-side: unique, collision-checked, unguessable. Never place a token or credential in a URL. Every tiny code resolves server-side to its target record, so internal slugs and ids stay internal. |
| UC-357 | Studio — view-merchants | Restaurant workspace — PROMOTE code | Keep the PROMOTE code for a location stable across Drop rotations, so printed posters and bio links never need reprinting when Drops change. |
| UC-358 | Studio — view-outcomes | Outcomes — attribution | Log resolution of tiny codes (code, target, channel / creator where known) so Outcomes can attribute without long URLs. |
| UC-359 | Studio — view-queue | Review drawer — video gate | A photo-only Drop may exist as a draft or in review, with publish disabled and the missing-video reason visible to the operator. |
| UC-360 | No UI — system rule | — | Pin the exact approved media version to a published Drop — later library edits never silently change a live Drop. |
| UC-361 | Studio — view-today + view-ops | Alerts | Show the poster and alert the operator if a live Drop's video becomes unavailable; never swap in a different dish's video. |
| UC-362 | No UI — process rule | — | Treat the prototype as the visual spec and the catalog as the requirements — Claude Code builds the real application new from scratch from them; prototype code is never shipped as production code. Same rule as open item 2. |
| UC-363, UC-364 | Studio — view-stack | Tech Stack — environments + promotion | Build only in staging first, in P0 → P1 → P2 batches, each batch proven by the automated end-to-end gate before it can promote. Require Mahendra's approval for every promotion from staging to prod — nothing auto-promotes. |
| UC-365 | No UI — process rule | — | GitHub is the source of truth: main = prod, staging branch = staging, feature branches with preview deploys; database changes ship as migrations in Git applied per environment. |
| UC-366 | Studio — view-stack | Tech Stack — environments | Two separate Supabase projects (staging / prod) for database, auth, and storage — staging holds test data only and production customer data is never copied into it. |
| UC-367 | Studio — (all screens) | Environment badge | An environment badge (STAGING / PROD) on every Studio screen so an operator never acts in the wrong environment. |
| UC-368 | Studio — view-ops | Sign-in — allowlist | Magic links only to allowlisted operator emails; a non-allowlisted address receives nothing. |
| UC-369 | No UI — system rule | — | Handle Stripe webhooks idempotently — duplicate deliveries create no duplicate orders, QR codes, or inventory changes. |

(UC-349 retired/deleted — excluded from the count.)
### §36 DealsPro website & homepage — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-370 | Customer website | Home + smart menus + Drop pages | The DealsPro website is the customer-facing site, separate from the Studio. One site, three page types: (a) home (dealspro.ai), (b) restaurant smart menu, (c) Drop page. Studio `view-homepage` holds the design spec for it; the live site is not the Studio. |
| UC-371, UC-372 | Customer website | Homepage — "This week in [City]" feed | City-scoped homepage; live Drops ordered by pickup window (earliest first), grouped by restaurant only when a restaurant has multiple live Drops. |
| UC-373 | Customer website | Homepage — returning visitor | There is no customer login, so the homepage cannot greet a returning visitor by name. What changes for a returning phone is recognition at claim (UC-384), not a greeting. |
| UC-374 | Customer website | Homepage — 0-live state | 0 live Drops in the city: never an empty page — "Next Drop coming soon in [City]" with the next scheduled Drop (if any) and its pickup window, plus an alert signup. |
| UC-375 | Customer website | Homepage — sold-out Drops | A sold-out live Drop stays on the homepage until its pickup window ends, marked "Sold out" with no buy button — it proves demand; after the window ends it drops off. |
| UC-376 | Customer website | Homepage — navigation | Tapping a restaurant name or "View all Drops from [restaurant]" opens its smart menu; tapping a Drop card opens the Drop page; the creator/channel tag survives navigation (last-tagged-link-wins, UC-313). |
| UC-377 | Customer website | Homepage — search / browse | Filter the live feed by cuisine, price band, Serves (1 / 2 / 3 / 4 / 5 / 6+), and pickup day. |
| UC-378 | Customer website | Ended Drop page | A link to a Drop whose pickup window has passed shows: "This Drop has ended", the dish, the restaurant, and what to do next (its smart menu / next Drop). Never a dead page, never purchasable. |
| UC-379 | Customer website | Order page | Every paid order has an order page on the website (tiny URL, UC-233), reachable from the confirmation text and the QR page — status timeline (UC-277), restaurant number for changes (UC-479), QR ticket. Part of the website, not the Studio. |
| UC-380 | Customer website | Mobile + in-app browsers | Mobile-first, video-first; Instagram in-app browser gets the Safari nudge (in-app browser blocks Apple Pay). |
| UC-381 | Customer website | Environments | The website ships in both environments from day one (UC-227): staging site vs dealspro.ai; staging never sends real messages, never takes real money. |

### §37 Customer identity & opt-in recognition — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-382 | Customer website | Claim sheet — phone identity | Phone number is the customer's identity — no login, no password, no account. Normalised to E.164 (+1 + 10 digits). |
| UC-383 | Customer website | Claim sheet — phone + first name | At checkout the customer enters phone number (required) and first name — and ownership is verified (code to that phone). |
| UC-384 | Customer website | Claim sheet — returning phone | A returning phone number is recognised — name pre-filled, past orders shown, nothing re-entered. |
| UC-385 | No UI — system rule | — | Opt-in is checked server-side before EVERY ask — if already opted in on that channel, never ask again. |
| UC-386 | Customer website | Order page — opt-in ask | Opt-in is offered at Drop level, AFTER a successful claim, on the channel they arrived through — and only if not already opted in. |
| UC-387 | Customer website | Smart-menu page — opt-in ask | Opt-in is also offered on the restaurant (smart-menu) page — with a stated scope, and only if not already opted in. |
| UC-388 | Studio — view-demand | Consent registry | One consent record per (phone E.164, channel): status (opt-in / opt-out / never-asked), source, timestamp. The Demand customer view shows this registry state exactly (UC-212). |
| UC-389 | No UI — system rule | — | STOP is per-channel, honoured immediately, and re-opt-in requires a fresh consent event. Replying STOP to an SMS stops SMS marketing only. |
| UC-390 | No UI — system rule | — | Ask-once: an existing buyer without marketing consent is asked once, the decline is remembered, and the system does not nag. |
| UC-391 | No UI — system rule | — | Cross-channel identity — one customer, one record, however they arrive (same phone by SMS, WhatsApp, or RCS is the same customer). |
| UC-392 | Customer website | Claim sheet — correction | A customer who mistypes their phone at checkout can correct it on the confirmation step; correction and merge handled server-side. |
| UC-393 | Customer website + messages | Order texts | The QR and order texts always go to the phone number entered, even if the customer is already opted in — transactional delivery is never gated on marketing opt-in. |
| UC-432 | Studio — view-demand | Consent registry — scopes | Exactly three consent scopes in one registry — Drop, smart menu, homepage — and a wider scope suppresses narrower asks. |

### §38 Accept deadline, 48-hour lead & restaurant confirmation — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-394 | Studio — New Drop composer | Composer — accept deadline | Every Drop has a claim-accept deadline — how long the restaurant has to accept a paid claim. Proposed default: 2 hours from the moment the claim is paid (default still PROPOSED, not locked). |
| UC-395 | Studio — New Drop composer | Composer — pickup date picker | The pickup window must start at least 48 hours after the Drop is published — the operator controls the dates, and the system enforces the lead. **LOCKED.** |
| UC-396 | Studio — New Drop composer | Composer — lead override | Operator override of the 48-hour lead — explicit, reasoned, audit-logged, operator only. |
| UC-397 | Studio — New Drop composer + restaurant create link | Both create flows | The accept-deadline and lead-time fields are present in BOTH create flows (operator composer and restaurant private create link). |
| UC-398 | Studio — view-queue | Distribution card — publish alerts | The 48-hour lead is marketing time — publishing starts the clock, and alerts go out on publish. |
| UC-399, UC-400 | Studio — view-queue | Review drawer — confirmation mechanism + record | Restaurant confirmation mechanism, made concrete: every accept and every decline records, per order: the restaurant, the order, the actor (who at the restaurant), when, and how. Confirmation is offer-version-scoped (UC-208). |
| UC-401 | Studio — view-queue | Review drawer — decline reasons | Decline reasons are a fixed list, not free text (ran out of the dish / cannot fulfil / other), and the customer sees a useful reason. |
| UC-402 | Studio — view-queue | Review drawer — offer-confirmation deadline | Offer-confirmation deadline — how long a restaurant has to confirm the exact offer before a scheduled publish passes. Distinct from the claim-accept deadline (UC-394). |
| UC-403 | Studio — view-orders | Order row — late accept flag | Prep lead time — an accept that arrives too late to prep is not a usable accept (less than 30 minutes before the pickup window opens). Flagged on the order. |
| UC-430 | Restaurant pickup link + messages | Reminder text | A reminder goes to the restaurant 10 minutes before a claim's accept deadline, on the same channel as the claim. |
| UC-431 | Customer website | Drop page — pickup date | Customers may claim ahead for the whole claim window from go-live — the pickup date is shown in large type. |
| UC-434 | Studio — view-queue / view-orders | Queue item + order row — confirmation state | The confirmation state machine is explicit and shown everywhere — not requested / awaiting / confirmed / voided / deadline missed. |

### §39 Reservation hold & per-customer cap — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-404 | Customer website | Claim sheet — quantity stepper | Per-customer cap — one phone buys at most 3 units of one Drop (PROPOSED default: 3; Mahendra said 3 or 4). |
| UC-405 | No UI — system rule | — | Reservation hold — units are held while the customer pays (PROPOSED hold length, not locked). Surfaced as the claim sheet holding the quantity during checkout. |
| UC-406 | Customer website | Claim sheet — sold-out state | Two buyers cannot both pay for the last unit — the second is told sold out BEFORE payment. |
| UC-407 | No UI — system rule | — | Cap and hold interact correctly with cancel and refund: cancelled and refunded units do NOT count toward the cap. |
| UC-408 | Customer website | Claim sheet — quantity stepper | Quantity stepper respects the cap and the hold — the customer can never select more than they can buy. |
| UC-409 | No UI — system rule | — | Oversell is impossible by construction (atomic decrement + hold + cap); if it ever happens it is handled, not hidden — surfaced as a P0 money alert (UC-453). |
| UC-433 | Studio — view-finance | Money — fraud checks | Cap-evasion detection — a second number, the same payment fingerprint, or device velocity is fraud, not a new customer. Flagged with the other fraud checks (UC-248). |

### §40 Operator alerts — delivery channel — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-410 | Studio — view-today + view-ops + phone | Alerts feed + SMS/WhatsApp | Operator alerts are delivered by SMS/WhatsApp to the operator's phone — not only in the Studio. Every §15 alert goes to the phone as well as the Studio. |
| UC-411 | Studio — view-ops | Alert settings — channel | Alert channel — SMS first, WhatsApp where the operator prefers it, SMS fallback. Primary channel TO CONFIRM (open item 21). |
| UC-412 | Studio — view-today + phone | Alert message | Every alert carries what, which, how long, and where to act — plus a deep tiny link to the item. |
| UC-413 | Studio — view-today | Alert badge + item | An alert is not cleared until the item is acted on — acknowledge is not resolve. Tapping an alert link and viewing the item acknowledges it (the badge clears); the alert itself clears only when the item is resolved. |
| UC-414 | Studio — view-ops | Alert settings — quiet hours | Quiet hours — time-critical alerts have none during a live window; marketing alerts never go out at night. Proposal TO CONFIRM (open item 21). |
| UC-415 | Studio — view-ops + phone | Backup alert | Alert to the backup after the 2-hour escalation — same content, same link, same urgency. |
| UC-416 | Studio — view-ops | Alert delivery log | Alert delivery is logged, and a failed alert retries and then escalates. Every alert records: recipient, channel, item, time sent, delivery status. |
| UC-417 | Studio — view-ops | Alert settings — per operator | Alert settings live in the Studio, per operator — channel, backup, and quiet hours in one place (Team & Coverage). |

### §41 Cities, metroplexes & nearby restaurants — P1

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-418, UC-419, UC-420 | Studio — view-merchants | City browser | Full city browser under Restaurants · By City listing every DFW sub-city, each with its restaurants; per-city counts (doing-business restaurants, pipeline leads, live Drops, customers) live from the database; launch cities with 0 restaurants shown honestly, never hidden. |
| UC-421 | Studio — view-merchants | Restaurant card — distance | Distance shown for each restaurant, labelled as sample miles from the Prosper (Legacy & Frontier) area in the prototype. |
| UC-422, UC-423 | Studio — view-merchants | Nearby list | Nearby list sorting active and pipeline restaurants by distance, closest first — crosses city lines. Radius filter: 3 / 5 / 10 miles as a segmented control, not free text; changing it re-sorts. |
| UC-424 | Studio — view-today | Today — "Cities & nearby" strip | A "Cities & nearby" strip on Today: the operator's cities and the nearest restaurants, next to the queue. |
| UC-425, UC-426, UC-427 | Customer website | Homepage — city chips + feed | Homepage city chips actually switch the homepage city (Prosper, Frisco, Plano, McKinney, Dallas); the homepage then shows the chosen city's Drops and restaurants, ordered by pickup window. A city with nothing live yet shows an honest launch-city state, not an empty page. |
| UC-428, UC-429 | Customer website | Homepage — "Restaurants near you" strip | A closest-first "Restaurants near you" strip on the homepage that crosses city lines; tapping a restaurant in it opens its Smart Menu preview. |

### §42 Monitoring, alerting, audit & financial reconciliation — P0

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-435 | No agreed screen yet — UI to be designed from the spec wording: "Monitor the health of everything money touches, with a monitoring tool picked before Phase 0 — website, Studio, Supabase (database + auth + storage), Stripe (checkout + Connect + webhooks), Twilio (SMS + WhatsApp), Vercel — with SLOs, a status page, and paging." | — | The Stack view specifies the tool pick + SLOs; the monitoring dashboard itself is not drawn. |
| UC-436 | Studio — view-stack | Tech Stack — status page | "Publish a public status page fed by the same health checks" — specified in the Stack view. |
| UC-437 | No agreed screen yet — UI to be designed from the spec wording: "Error tracking and structured logs for every money event — searchable, with no card numbers or secrets anywhere. Logs are searchable by phone (hashed lookup key), order, Drop, restaurant, and payout reference." | — | — |
| UC-438 | No agreed screen yet — UI to be designed from the spec wording: "Webhook delivery is monitored, retried, and reconciled — a missed webhook is a recoverable order, never a lost one." | — | Reconciliation tasks exist in Money (UC-442); a webhook-delivery dashboard is not drawn. |
| UC-439 | No UI — process rule | — | Provider-outage plan — what happens when Stripe, Twilio, Supabase, or Vercel is down (e.g. Stripe down → checkout is PAUSED). A written plan, not a screen. |
| UC-440 | No UI — process rule | — | Deploy freeze, rollback, and prod-promotion checklist — no deploys during a live pickup window. A process rule, not a screen. |
| UC-441 | Studio — view-finance | Money — live dashboard | A real-time Money dashboard — gross, refunds, fees, commission, creator share, restaurant owed, net, right now (live P&L, UC-216–UC-218). |
| UC-442 | Studio — view-finance | Money — reconciliation | Daily reconciliation — Stripe vs Supabase vs bank, with every mismatch named. |
| UC-443 | Studio — view-finance | Money — payout monitoring | Payout monitoring — scheduled vs paid vs failed, with retry rules. |
| UC-444 | Studio — view-finance | Money — refund-after-payout | Refund-after-payout rule — a refund or chargeback that lands after the restaurant/creator was already paid. Rule TO CONFIRM (open item 22h). |
| UC-445 | Studio — view-finance | Money — disputes (finIssues) | Chargeback monitoring and evidence workflow — deadlines are automatic losses if missed. Every Stripe dispute/chargeback tracked from the moment Stripe opens it. |
| UC-446 | No UI — decision pending | — | Loss liability — who pays when a refund/dispute exceeds a connected account's balance. TO DECIDE (open item 22g). No screen until the decision exists. |
| UC-447 | Studio — view-finance | Money — fraud dashboard | Fraud and abuse monitoring — bot/script buying, rate limits, velocity, self-purchase, cap evasion, on one dashboard (operator only). |
| UC-448 | Studio — view-finance | Money — settlement disputes | Settlement-dispute monitoring — a restaurant that disputes its settlement gets an evidence pack, an owner, and a resolution. |
| UC-449, UC-450 | Studio — view-ops | Audit trail | An immutable audit log for every money-moving action — who, when, why, from what to what. Exportable, tamper-proof, retained — it cannot be edited or deleted by any operator. |
| UC-451 | No agreed screen yet — UI to be designed from the spec wording: "A customer-data access log — who viewed a customer's record, and why. Every view of a customer record in the Studio (Demand, order detail, support) is logged." | — | — |
| UC-452 | No agreed screen yet — UI to be designed from the spec wording: "Financial close — a daily and weekly money sign-off, not a glance. Each day, the operator (or backup) signs off the daily close in Money: reconciliation reviewed, payouts reviewed, holds reviewed." | — | — |
| UC-453 | Studio — view-today + view-ops + phone | P0 money alerts | P0 money alerts — payment, payout, webhook, oversell, QR failure, late accept, unclaimed — page the operator immediately. (Sharpest defer in the delete pass: safety net is daily reconciliation UC-442 + webhook monitoring UC-438.) |
| UC-454 | Studio — view-ops | Alert delivery log | Alert delivery receipts and failed-alert escalation — a failed alert is itself an alert (see UC-416). |
| UC-455 | Studio — view-ops | Alert settings — quiet hours | Quiet hours — money alerts have none; non-urgent alerts are batched. |
| UC-456 | No UI — system rule | — | Alert deduplication and fatigue — one incident, one alert, with updates. |
| UC-457 | No agreed screen yet — UI to be designed from the spec wording: "Backups and disaster recovery — daily backups, a restore test, proposed RTO 4h / RPO 1h. Supabase automated backups run daily, with point-in-time recovery; a restore test is run and recorded." | — | — |
| UC-458 | No agreed screen yet — UI to be designed from the spec wording: "Data retention and deletion — how long each record lives, and how a customer is deleted. A retention schedule states, per record type, how long it is kept and how it is deleted." | — | — |
| UC-459 | Studio — view-demand | Consent-list audit and export | Consent-list audit and export — any send can answer why it was allowed (consent records UC-388 + send log UC-250/UC-331 together export an audit). |
| UC-460 | No UI — system rule | — | PCI scope — no card data ever enters DealsPro. Card numbers, expiry, and CVV are never collected, stored, logged, or displayed by DealsPro, the Studio, or any log. |
| UC-461 | No agreed screen yet — UI to be designed from the spec wording: "Performance and load monitoring — checkout latency, QR scan latency, and a load-test target. Checkout latency (claim sheet → payment confirmed), QR scan latency, and a load-test target are monitored." | — | The §50 2-second claim budget (UC-568) is measured by this monitoring via a staging test-gate check. |
| UC-462 | Studio — view-media | Media processing — queue status | Video-processing monitoring — transcode queue, failure alert, storage and cost. Processing status on each asset (UC-081–084). |
| UC-463 | No agreed screen yet — UI to be designed from the spec wording: "Restaurant reliability monitoring — a score, a threshold, and a way back. The reliability record (strikes, declines, never-Ready flags) rolls up into a score with a threshold and a reinstatement path." | — | — |
| UC-464 | No agreed screen yet — UI to be designed from the spec wording: "Messaging-delivery monitoring — sender status, delivery rates, blocked senders. Delivery rates per channel (SMS, WhatsApp, RCS) and per sender are monitored." | — | — |

### §43 Cuisine filter & hero-dish discovery — P0 for the visibility rule, P1 otherwise

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-465 | Customer website | Homepage — cuisine chips | A cuisine chip is shown ONLY when at least one LIVE Drop in that cuisine exists in the selected city right now — otherwise the chip is hidden entirely. |
| UC-466 | Studio — view-merchants | Restaurant record — cuisine | Cuisine is a controlled property of a restaurant and of a dish — a fixed list, never free text (Indian, Pizza, Thai, Mexican, Chinese, …). |
| UC-467 | Customer website | Homepage — cuisine chips | Homepage cuisine filter chips above the Live Now feed — order, toggle, clear; they filter the feed. |
| UC-468 | Customer website | Homepage — cuisine chips | Changing the city re-computes which cuisines have live Drops — the chip row is rebuilt, not carried over. |
| UC-469 | Customer website | Drop card — Hero Dish tag | Hero dish — one famous dish per restaurant, operator-set, shown as a small tag on a normal Drop. Placement LOCKED (V2.12): Hero Dish tag overlaid on the picture, immediately next to the red DROP badge. |
| UC-470 | Customer website | Restaurant list / smart menu | Cuisine shown as a small label; filtering by cuisine hides restaurants with no live Drop in it. |
| UC-471 | Customer website | Homepage — search/browse | Cuisine as a facet alongside price, Serves, and pickup day; no live results shows the 0-live empty state, never an empty list. |
| UC-472 | Studio — view-queue | Review drawer — re-confirmation | A Drop whose cuisine is changed after publish requires re-confirmation, like a price change (cuisine is part of the offer the restaurant confirmed). |
| UC-473 | Customer website | Homepage — cuisine chips | Coming Soon Drops do not count as live for the cuisine filter — a cuisine with only Coming Soon Drops has no chip. |
| UC-474 | Customer website | Homepage — cuisine chips | A city with no live Drops at all shows no cuisine chips — the homepage 0-live empty state governs. |
| UC-475 | Customer website | Drop card — cuisine label | A restaurant with two cuisines — dish-level cuisine wins over restaurant-level cuisine. |
| UC-476 | Customer website | Homepage — cuisine chips | "Live" for the cuisine filter — published, claimable, units remaining, window not ended — and the chip disappears the moment the last one goes. |
| UC-477 | Customer website | Homepage + Drop page | The cuisine filter survives navigation to a Drop page and back, and combines with the other filters. |
| UC-478 | Studio — view-merchants | City browser — cuisine state | The operator sees, per city, which cuisines are live, which are Coming Soon only, and which are absent — in the Studio (Restaurants · By City). |

### §44 Pickup verification & reminders — P0 for pickup state and unclaimed, P1 for reminder timing

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-489 | Studio — view-orders | Pickup board — one state per order | Every order has one pickup state, and the state is the truth about pickup — Claimed → Accepted → Ready → Picked up / Unclaimed. |
| UC-490 | Restaurant pickup link | Scan mode | Pickup is recorded at the QR scan — timestamp, order, who redeemed it. |
| UC-491 | Restaurant pickup link | Manual code entry | Pickup by manual ticket-code fallback is recorded exactly like a QR scan. |
| UC-492, UC-493, UC-494, UC-495, UC-496 | Customer website + messages | Order page + reminder texts | Reminders, transactional, on the channel the customer ordered from: 24 hours before the window → 2 hours before → at window start ("Your pickup window is open now") → midpoint, only if not yet picked up → final reminder 30 minutes before the window ends, only if not yet picked up. Each names restaurant, dish, quantity, window. |
| UC-497 | Studio — view-ops + messages | P0 alert + missed-pickup text | At window end, an order not picked up is automatically marked Unclaimed — one missed-pickup text, restaurant summary, operator P0 alert. **CONFLICT (spec open item 26):** §44 says no-grace auto-Unclaimed here, while §51 UC-577 gives a 30-minute grace + operator decision — the spec itself holds both; the UI must not resolve it. |
| UC-498 | No UI — system rule | — | Reminder suppression — no reminder after pickup, after cancel/refund, or after the window ends, except the single missed-pickup text. |
| UC-499 | Studio — view-orders | Order row — reminder log | Every reminder's delivery is logged, and a failed reminder escalates — never silently dropped. |
| UC-500 | No agreed screen yet — UI to be designed from the spec wording: "Pickup identity check — a forwarded QR screenshot can still collect the order; no solution is specified here." | — | Open gap in the spec itself, not just in the prototype. |
| UC-501 | Studio — view-orders | Orders & Pickup board | Orders & Pickup board shows pickup state, reminder history, and time remaining, with a "not yet picked up" filter. |
| UC-502 | Studio — view-orders | Order row — terminal state | A picked-up order is terminal — it can never be re-redeemed, cancelled, or refunded as unclaimed. |
### §45 — Reserved (unmerged)

§45 is reserved — UC-503–UC-515 are reserved IDs for a section not yet merged into the spec; there is nothing to map.

### §46 Top 5 in your area this week + interactive matcher (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-516 | Customer website | Homepage — Top 5 shelf | "Top 5 in [city] this week", max 5 live Drops, city-scoped, 3 visible on mobile first. The homepage opens with this shelf. |
| UC-517 | No UI — system rule | — | Ranking signals — earned signals only, NO paid ranking, NO bidding. The Top 5 order is computed server-side from real order/pickup data only. |
| UC-518 | No UI — system rule | — | Real-time recompute — the Top 5 reorders the moment the underlying signals change, with no operator action. |
| UC-519 | Customer website | Homepage — Top 5 card | Every Top 5 card shows, in this order: the video hero, dish, restaurant, Serves, total price, pickup window, units left. |
| UC-520 | Customer website | Homepage — Top 5 shelf | Sold-out and ended Drops — sold out stays visible until its window ends, then drops off. |
| UC-521 | Customer website | Homepage — Top 5 shelf | Fewer than 3 live Drops — the shelf is not a real shelf; show what exists, invent nothing. |
| UC-522 | No agreed screen yet — UI to be designed from the spec wording: "\"Not seeing what you're craving?\" — the 2-question matcher, under the Top 5, two taps only." | — | The prototype CUT the matcher Nov 19, 2026 ("Discovery is this shelf only — the 2-question matcher was cut: no quiz, no one-best-Drop fallback"). The spec still specifies it as PROPOSED — see Disagreements. |
| UC-523 | No agreed screen yet — UI to be designed from the spec wording: "One best answer — ONE live Drop, with a plain-language reason why. After the two taps, the matcher shows exactly ONE best live Drop in the selected city — never a list." | — | See UC-522. |
| UC-524 | No agreed screen yet — UI to be designed from the spec wording: "Preference memory — remembered by phone, never re-asked unless the customer taps Change. The customer's matcher answers (cuisine, Serves size, pickup day) are remembered by phone." | — | See UC-522. |
| UC-525 | No agreed screen yet — UI to be designed from the spec wording: "No live Drop fits — say so honestly, show the closest match if any, offer a cuisine alert. If no live Drop in the selected city fits the customer's two answers, say so honestly." | — | See UC-522. |
| UC-526 | Customer website | Homepage — "Because you picked X" shelf | "Because you picked X" — Top 3 for that customer after a purchase. Exists in the prototype. |
| UC-527 | Studio — view-top5 | Top 5 — operator ranking view | Studio operator view — the live ranking, and why each Drop ranks where it does. The prototype's Top 5 view shows the live ranking in the Studio. |
| UC-528 | No UI — system rule | — | No fake badges, no fake counts — every ranking badge comes from real orders/pickup data, and every ranking change is logged. |
| UC-529 | Customer website | Homepage — Top 5 shelf (edge states) | Tie-breaks, new-Drop entry, and mobile Top 3 — how the shelf behaves at the edges (tie-break by the stated rule; a new Drop enters on real signals only; mobile shows Top 3 first). |

### §47 Food-ready notifications & customer check-in (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-530 | Restaurant pickup link | Pickup link — Mark Ready (per order) | One-tap per-order Ready sends one personal ready message. |
| UC-531 | Restaurant pickup link | Pickup link — Mark batch ready | One-tap batch Ready sends personal 1-to-1 messages, staggered — one per customer, never a group message. |
| UC-532 | Restaurant pickup link | Pickup link — batch confirm screen | Batch send confirm screen: before any batch ready message is sent, a confirm screen shows the exact count ("Send ready to 47 customers?") and the Drop. |
| UC-533 | No UI — system rule | — | Ready is idempotent — one ready message per order per Drop. Re-marking an order Ready sends nothing again. |
| UC-534 | No UI — system rule | — | Ready message template — 160 characters max, no offers. One fixed template. |
| UC-535 | No UI — system rule | — | Channel order — SMS first, WhatsApp fallback, RCS later only. |
| UC-536 | Studio — view-orders | Order row — message state | Delivery receipts per order, one auto-retry, no retry of permanent failures. Every ready message records its delivery state per order (sent / delivered / failed). |
| UC-537 | Restaurant pickup link | Pickup link — Ready discipline | Ready is tapped only when the food is bagged and staged. |
| UC-538 | Restaurant pickup link | Pickup board — ready board | In-store ready board — Preparing → Ready, the always-on fallback. The restaurant's counter shows a ready board — the same private-link order list, or a dedicated board view. |
| UC-539 | Customer website + messages | Confirmation message — check-in link | Check-in link in the confirmation message — "On my way" / "I'm here". A no-login check-in link. |
| UC-540 | Restaurant pickup link | Pickup board — arrival sort | Check-in re-sorts the counter queue by arrival. A check-in tap marks that order Arriving / Here on the restaurant's private-link dashboard, and the dashboard re-sorts. |
| UC-541 | No UI — policy rule | — | Check-in is a prioritisation signal, never a precondition. Food is staged by batch whether or not the customer checks in. |
| UC-542 | No UI — system rule | — | Optional auto-reply on check-in. When a customer taps "I'm here", the system may send one short auto-reply ("We're bagging yours now — come to the counter"). |
| UC-543 | Customer website | Status page (no-login) | Live 2-state status page — Preparing → Ready, never a minute ETA. The confirmation message states the window and a no-login status link. |
| UC-544 | No UI — system rule | — | Message cap — max 2 per order per Drop, plus at most 1 reminder (confirmation + ready, plus at most 1 reminder). |
| UC-545 | No UI — system rule | — | Consent separation — ready alerts are transactional, marketing is separate. A ready alert is a transactional message sent on the checkout-phone consent. |
| UC-546 | No UI — system rule | — | Quiet hours, STOP/HELP, one consistent sender. No marketing message goes out 9:00 PM–9:00 AM local (PROPOSED). |
| UC-547 | Studio — view-orders | Order row — message state | Operator sees per-order message state — the Studio board shows, per order, the ready-message state (not sent / sent / delivered / failed) from UC-536. |

### §48 Five-step pickup timeline — Claimed → Accepted → Preparing → Ready → Picked Up (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-548 | No UI — system rule | — | One pickup state per order — five states, server-side, timestamped. Every paid order has exactly one pickup state, held server-side (never on the phone). |
| UC-549 | Customer website | Order page — timeline | Customer timeline — one live page, five states, no login. The customer sees the same five states on one no-login web page (short link from SMS + confirmation). |
| UC-550 | Restaurant pickup link | Pickup link — timeline | Restaurant timeline — same five states, same timestamps, one phone page, on the private pickup-link page (no login). |
| UC-551 | Customer website + Restaurant pickup link | Timeline — Preparing | Preparing — what it means, when it starts. Preparing starts when the kitchen starts that order's batch/wave — not at Accept, not at payment. |
| UC-552 | Restaurant pickup link | Pickup link — Ready tap | Ready — tap-only, SMS Ready, QR on top. Ready is set only by the restaurant's Ready tap (per-order or Batch Ready, UC-530/UC-531) when the food is physically bagged and staged. |
| UC-553 | Restaurant pickup link | Scan mode | Picked Up — QR scan or code fallback, single-use, terminal. Handover is by QR scan in Scan mode: staff phone camera open, customer shows QR → green flash → Picked up. |
| UC-555 | Studio — view-orders | Order row — timeline | Every state change is audited; operator board shows the timeline. Every transition is audit-logged with actor (customer / restaurant / system) and timestamp. (UC-554 retired/deleted — excluded from the count.) |
| UC-556 | Restaurant pickup link | Pickup link — late / early / dead-phone | Running late, early arrival, dead phone — handled, not improvised. Running late: one tap "+10 / +20 min" re-times the Ready-by estimate and texts not-yet-picked-up customers. |
| UC-557 | No agreed screen yet — UI to be designed from the spec wording: "Per-Drop pickup scorecard — ready on time, counter wait, first-scan, no-shows. Within 1 hour of window end, DealsPro auto-generates a one-page per-Drop scorecard." | — | — |

### §49 DealsPro MCP server (PROPOSED) — API tools, no screen

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-558–UC-567 | API — no UI | MCP server (Vercel) | The MCP server exposes a small, fixed tool catalog: search_drops, get_drop, claim_drop, get_order, cancel_order, get_pickup_status, and related tools. Deferred loading / just-in-time tools (UC-559). Model proposes, server disposes — the model never touches Supabase, Stripe, or Twilio (UC-560). Server-enforced ordering through the §48 state machine (UC-562). Identity handshake — phone is identity (UC-563). Every tool call audit-logged (UC-564). RAG as a cross-cutting rule — the assistant only states retrieved facts about live Drops (UC-565). Contract-first before parallel building (UC-566). No agent wrapping an agent (UC-567). **There is no Studio screen for any of these ten cases by design** — they are API tools, not UI. |

### §50 Mobile light loading — claim first (LOCKED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-568 | Customer website | Drop page — load order | Mobile light loading — the claim loads first. The customer Drop page loads light and as needed: claim sheet / Claim button first, video and the rest after — so a claim is interactive within 2 seconds on throttled 4G. Measured by the UC-461 monitoring via a staging test-gate check. A customer-page performance rule, not a Studio screen. |

### §51 Drop timing — publish, claim cut-off, pickup (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-569–UC-584 | Studio — view-today / New Drop composer / view-queue + Customer website | Today — timing card; composer — schedule; Drop page — window + cut-off | First Drop uses the Hybrid schedule — publish 2 days ahead (e.g. Mon 2 PM for Wed 6–8 PM pickup); claims open from publish; final-call SMS 1:30 PM day-of (UC-569). Claim cut-off is 3 hours before pickup-window start — hard stop, no claims, no extensions after cut-off (UC-570). Cut-off moves to 24 hours if the restaurant cannot do morning mise en place (UC-571). Same-day Drop — second test: publish + SMS 10 AM day-of, final-call SMS 1:30 PM, cut-off 3 PM, prep 3–5:30 PM, pickup 6–8 PM + 15-min grace (UC-572). 48-hour advance with 24-hour cut-off — complex dishes only (UC-573). Claim window is roughly one day of effective decision time (UC-574). Cancellation — full refund until the claim cut-off, no refund after (UC-575). Transfer — send someone else with the QR, no charge (UC-576). Grace — 15 minutes past the pickup window, stated in the SMS (UC-577). No-show after grace — no refund, no credit, no exchange (UC-578). Restaurant fault — full refund (UC-579). Food safety — hold hot at ≥135°F, 4-hour danger-zone clock (UC-580; kitchen rule, surfaced as the reason for a restaurant-fault refund). SMS cadence — at most 3 texts per Drop (UC-581). Operating rule — show the real claimed count live, never a fake count or a resetting counter (UC-582). Operating rule — state the rules in the first SMS, before payment (UC-583). Batch-prep window — 3 hours, three conditions (morning mise en place, batch discipline, Ready discipline) (UC-584). |

### §52 Location gate — confirmed location before claim (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-585 | Customer website | Drop page — location gate | A customer must have a confirmed location before claiming a Drop. No claim is created, no payment is taken, and no inventory is held until the customer's pickup city is confirmed. |
| UC-586 | Customer website | Drop page — location gate | The gate uses a combination of methods, not one: GPS detect (browser Geolocation API, user tap only, never on load), manual pick (any of the live Drops cities), and the IP guess (UC-591). |
| UC-587 | Customer website | Drop page — "Use my location" | GPS detect snaps to the nearest Drops city. |
| UC-588 | Customer website | Drop page — location chip | A confirmed location carries through the session — later claims in the same session do not re-gate; the Drop page shows a live location chip. |
| UC-589 | Customer website | Drop page — mismatch warning | City mismatch warns, never blocks — if the confirmed city differs from the Drop's city, the gate warns with the distance + the pickup window and requires an explicit confirm. |
| UC-590 | Customer website | Checkout — second gate check | A second gate check guards the payment step: the confirmed location is re-checked at payment. |
| UC-591 | Customer website | Homepage / Drop page — IP guess | IP geolocation is a provisional guess only — used only as a silent provisional default on first paint, always labelled a guess, never stored. |
| UC-592 | Customer website | Homepage — first-use flow | First-use flow — guess, then tap, then picker, then save. First paint from the IP guess with a tappable city chip → in-context "Use my location" → manual picker → saved. |
| UC-593 | No UI — system rule | — | Precise geolocation is sensitive data — consent required. Precise location (within 1,750 ft) is SENSITIVE data under the Texas Data Privacy and Security Act (TDPSA); GPS detect requires the customer's tap (consent), never on load. |
| UC-594 | No UI — system rule | — | Native app vs web — same GPS, different reliability. A permitted web page already gets 3–10 m GPS accuracy; a native app has no different satellites. |

### §53 Differentiation — why a customer buys from DealsPro (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-595 | Customer website | Drop page — savings block | Lead with a verifiable dollar saving on a meal that visibly feeds the group. Every Drop shows the singles total, the bundle price, the dollars saved, and the people it feeds. |
| UC-596 | Customer website | Drop page — scarcity | Real scarcity, slow-window only. Stated quantity + end time, honoured: the cap is real, the window closes when stated, timers never reset. |
| UC-597 | Customer website | Homepage — Top 5 only | Top-5 curation, not a catalogue. Discovery is the Top 5 list only (UC-516) — the deal finds the customer; there is no browse-everything catalogue. |
| UC-598 | Customer website + messages | SMS — one-tap claim | SMS-first, one-tap claim, no app. The Drop arrives by SMS, claims in one tap, and is picked up by QR — no app, no account, no browsing. |
| UC-599 | Customer website + Restaurant pickup link | Order page + Scan mode | Frictionless QR pickup as a time promise: claim → QR → hand-over, with the pickup window and grace stated up front (§51). |
| UC-600 | Customer website | Drop page — video hero | Video-first to de-risk an unknown bundle. The hero video is the dish story: it shows the food, the portion, and the restaurant. |
| UC-601 | Customer website | Drop page — local tie-breaker | Local-independent as tie-breaker, quantified honestly. "Support local" is a tie-breaker, never the lead reason. |
| UC-602 | No agreed screen yet — UI to be designed from the spec wording: "Retention without subscription — endowed progress + first access. No subscription, no points currency. Retention is goal-gradient endowed progress (a customer part-way to a reward) plus first access to the next Drop from a restaurant they bought from." | — | No retention mechanism is drawn in either prototype; the endowed-progress mechanism itself is not designed yet. |
| UC-603 | No UI — positioning rule | — | AI chat and short video are distribution only. Assistants and short video surface Drops; they do not sell them. |
| UC-604, UC-605 | No UI — positioning rules | — | Do NOT copy Groupon (never unlimited 50%-off, peak-hour displacement, daily deal-blast spam) and do NOT copy DoorDash's lock-in (never catalogue breadth as the strategy, a DashPass-style lock-in, or hidden fees and menu markups). Guardrails for copy and offers, not screens. |
| UC-606 | No UI — decision pending | — | The bundle sweet spot is undecided — do not hard-code a percentage. The evidence conflicts (12–18% vs 20–30% vs McDonald's 15%); no screen until the decision exists. |

### §55 — Reserved (pending)

§55 is reserved — UC-607–UC-612 are reserved IDs for the SMS-list draft (§55 SMS/RCS section, six cases UC-607–UC-612), which Mahendra has not yet approved; there is nothing to map until he says yes.

### §56 Customer preview — greeting, dish sub-chips, Texas explorer, 4:30 PM alert, shareable Drop cards (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-613 | Customer website | Homepage — greeting | Greeting — time-of-day greeting with the customer's name ("Good morning" / "Good afternoon" / "Good evening, [name]"). Note: no customer login exists (UC-373), so the name is known only after a claim on that phone (UC-384). |
| UC-614 | Customer website | Homepage — dish sub-chips | Dish sub-chips — a second filter row under the cuisine chips: All Bundles, Biryani Bundles, and the other dish groups. |
| UC-615 | Customer website | Homepage — 16-city row | 16-city row — the Texas explorer city row: Near me, Frisco, Prosper, Plano, Dallas, McKinney, Allen, Fort Worth, Arlington, … |
| UC-616 | Customer website | Homepage — "Explore TX" | "Explore TX" opens the explorer: the 16-city row (UC-615) under the frame "DFW Metroplex · Pickup only — no delivery". |
| UC-617, UC-618 | Customer website + messages | 4:30 PM Drop alert text | 4:30 PM Drop alert — one text at dinner-decision time (4:30 PM CT). The alert text names the bundle, the bundle price and the crossed-out singles total, Serves, window, and units left. |
| UC-619 | Customer website | Drop page — "Share this Drop" | Share this Drop — the Drop page share. Every Drop page has "Share this Drop — send it to the table." Sharing sends the Drop card — the dish, the saving, and the claim link. |
| UC-620 | Customer website | Order page — "Share your Drop" | Share your Drop — the order page share. The order page has "Share your Drop — feeds 4, pass it on." |
| UC-621 | Customer website | Homepage — bundle view | Indian-only bundle view — every Drop is an Indian bundle for 2+. The bundle view shows Indian bundles only. |
| UC-622 | Customer website | Homepage — Indian Restaurants shelf | Indian Restaurants shelf — Indian kitchens only. The restaurant shelf in the bundle view lists Indian kitchens only. |

### §57 Branding — DealsPro is the company, Drop is the product (PROPOSED)

| UC | Surface | Screen / component | UI notes |
|---|---|---|---|
| UC-623 | No UI — naming rule | — | Company vs product — DealsPro is the company, Drop is the product. DealsPro names the company; Drop names the product. The unit a customer claims, pays for, and picks up is a Drop. Applies to every screen's copy; not a screen itself. |
| UC-624 | Studio + Customer website | Header — company mark | The company mark — the live site's header logo, used as-is: a red speech-bubble icon with "deals PRO" in the header lockup. The Studio and the website both carry it unchanged. |
| UC-625 | Customer website | Customer copy — "Drop" | Product name in customer copy — the unit is called a Drop: "Tonight's Drop", "The Drop sold out", "Share this Drop". |

## Coverage summary

**600 of 600 cases mapped, each exactly once.** Verified by script against the mapping tables' first columns (cross-references in notes do not count): 600 unique UC ids, 600 occurrences, no duplicates, no missing ids. Retired ids (UC-134, UC-173, UC-307, UC-328, UC-349, UC-554) appear nowhere in the mapping; reserved ids (UC-503–UC-515 for §45, UC-607–UC-612 for §55) appear nowhere in the mapping. Per-section counts match the spec's own counts exactly.

| Section | Mapped | No agreed screen yet |
|---|---|---|
| §1 Restaurant onboarding & management | 20 | — |
| §2 Drop creation & offer details | 12 | — |
| §3 Video-first preview & publication | 10 | — |
| §4 Payment, QR & first redemption | 10 | — |
| §5 Restaurant workspace & portfolio | 10 | — |
| §6 All Drops — search, manage, edit, delete | 10 | — |
| §7 Confirmation & operator approval | 10 | — |
| §8 Scheduling & publishing queue | 10 | — |
| §9 Video & image library | 10 | — |
| §10 Orders & pickup management | 10 | — |
| §11 Inventory & Drop lifecycle | 10 | — |
| §12 Distribution, attribution & outcomes | 17 | — |
| §13 Financial operations & reconciliation | 11 | — |
| §14 Recurring Drops & advanced scheduling | 10 | — |
| §15 Operational alerts & automation | 10 | — |
| §16 Security, permissions, audit & reliability | 10 | UC-163 |
| §17 LLM Drops & smart menus | 23 | — |
| §18 Cancellation, refunds & exceptions | 15 | — |
| §19 Demand & customers | 4 | — |
| §20 Money — top-level P&L & settlement | 3 | — |
| §21 Team & coverage / no single point of failure | 5 | — |
| §22 Mobile-first Studio | 4 | — |
| §23 Tech stack, staging vs prod & infrastructure | 7 | — |
| §24 Scale — first scale | 10 | UC-244 (throughput dashboard part only) |
| §25 Cancel, refund & pickup issues | 26 | — |
| §26 Claim → restaurant confirm → Ready | 13 | — |
| §27 Stripe Connect & automated payouts | 11 | — |
| §28 Operator throughput & batch review | 8 | UC-299, UC-300 |
| §29 Pickup at burst, QR fallback & unclaimed orders | 7 | — |
| §30 Creator self-service, fraud & attribution integrity | 8 | — |
| §31 Support at volume | 8 | — |
| §32 Messaging compliance & fatigue | 7 | — |
| §33 Chains & multi-location | 7 | — |
| §34 Tax, 1099 & payout identity | 7 | — |
| §35 Studio detail cases | 21 | — |
| §36 DealsPro website & homepage | 12 | — |
| §37 Customer identity & opt-in recognition | 13 | — |
| §38 Accept deadline, 48-hour lead & restaurant confirmation | 13 | — |
| §39 Reservation hold & per-customer cap | 7 | — |
| §40 Operator alerts — delivery channel | 8 | — |
| §41 Cities, metroplexes & nearby restaurants | 12 | — |
| §42 Monitoring, alerting, audit & financial reconciliation | 30 | UC-435, UC-437, UC-438, UC-451, UC-452, UC-457, UC-458, UC-461, UC-463, UC-464 |
| §43 Cuisine filter & hero-dish discovery | 14 | — |
| §44 Pickup verification & reminders | 14 | UC-500 |
| §46 Top 5 + interactive matcher | 14 | UC-522, UC-523, UC-524, UC-525 |
| §47 Food-ready notifications & customer check-in | 18 | — |
| §48 Five-step pickup timeline | 9 | UC-557 |
| §49 DealsPro MCP server | 10 | — (API, no screen by design) |
| §50 Mobile light loading — claim first | 1 | — |
| §51 Drop timing | 16 | — |
| §52 Location gate | 10 | — |
| §53 Differentiation | 12 | UC-602 |
| §56 Customer preview | 10 | — |
| §57 Branding | 3 | — |
| **Total** | **600** | **21** |

**"No agreed screen yet" — 21 cases:** UC-163, UC-244 (throughput dashboard part only — the batch bar exists), UC-299, UC-300, UC-435, UC-437, UC-438, UC-451, UC-452, UC-457, UC-458, UC-461, UC-463, UC-464, UC-500, UC-522, UC-523, UC-524, UC-525, UC-557, UC-602. Ten of the 21 are in §42 (monitoring/audit internals) — the prototype specifies the tool pick and SLOs in the Stack view but draws no monitoring dashboard, log search, webhook dashboard, access log, close sign-off, backup record, retention flow, load monitor, reliability score, or messaging-delivery monitor.

**Non-UI by design (mapped, not gaps):** §49 MCP (UC-558–UC-567, API tools, no screen); backend/system rules (UC-033, UC-105, UC-161, UC-162, UC-164, UC-230–UC-233, UC-351, UC-354–UC-356, UC-360, UC-362, UC-365, UC-369, UC-456, UC-460, UC-517, UC-518, UC-528, UC-548); process rules (UC-439, UC-440, UC-481, UC-482, UC-486, UC-541); decision-pending with no screen (UC-446, UC-606); customer-page performance/kitchen/legal rules (UC-568, UC-580, UC-593, UC-594, UC-603–UC-605, UC-623); consent/identity rules enforced server-side (UC-385, UC-389–UC-392, UC-405–UC-409, UC-533–UC-535, UC-542, UC-544–UC-546).

## Disagreements — prototype vs spec

These are places where the prototype and the spec do not agree, or where the spec disagrees with itself. Recorded here, not resolved — resolving them is Mahendra's call.

1. **Section numbering off by one.** The prototype's internal numbering (§47 Top 5, §48 food-ready, §49 timeline) is one ahead of the spec file (§46 Top 5, §47 food-ready, §48 timeline) because the file's §45 is reserved. The prototype's `view-coverage` catalog is "Use Cases v3.5" in Studio numbering. Compare by UC id, not by section number.
2. **The 2-question matcher was CUT in the prototype, still PROPOSED in the spec.** The prototype says (Nov 19, 2026): "Discovery is this shelf only — the 2-question matcher was cut: no quiz, no one-best-Drop fallback." The spec §46 UC-522–UC-525 still specifies the matcher as PROPOSED, with no cut note. The prototype has no matcher UI; the four cases are marked "No agreed screen yet" above. Decision needed: cut it from the spec, or design and build it.
3. **§44 / §51 grace-rule conflict — a spec conflict, not a UI gap.** UC-497 (§44) says an unpicked order is automatically marked Unclaimed at window end with no grace; UC-577 (§51) gives a 15-minute grace past the window, and UC-308 requires an explicit operator decision per unclaimed order after grace + reminder. Open item 26 in the spec holds both. The UI must not resolve it — the pickup board must show whichever rule Mahendra picks, once he picks it.
4. **Pickup identity is an open gap in the spec itself (UC-500).** "A forwarded QR screenshot can still collect the order; no solution is specified here." Neither the prototype nor the spec designs the check. Not a UI gap to paper over — a product decision still open.
5. **UC-602 retention mechanism is undesigned.** "Endowed progress + first access" is specified as the retention model, but no screen in either prototype draws the progress mechanism, and the mechanism itself (what the progress is toward, what "first access" unlocks) is not specified beyond the one case.
6. **§42 monitoring is specified in words, drawn nowhere.** The Stack view names the tool pick + SLOs and the status page, but ten §42 cases have no operator screen at all (see the coverage table). The monitoring dashboard is the single largest undrawn surface in the whole catalog.
7. **UC-613 greeting vs UC-373 no-login.** §56 UC-613 specifies a greeting "with the customer's name", while §36 UC-373 states there is no customer login so the homepage cannot greet a returning visitor by name. The name is only knowable after a claim on that phone (UC-384). The greeting can only be personal after a claim — the spec does not say this explicitly.

---

*End of companion doc. Spec version mapped: V2.22. Verification: 600/600 cases mapped exactly once; 21 marked "No agreed screen yet".*
