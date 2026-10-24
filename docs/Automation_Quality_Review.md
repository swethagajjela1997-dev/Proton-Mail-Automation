# Automation Quality Review

Answers to the assessment's quality-review questions. They are summarised in the README as well.

## 1. Which tests did you deliberately choose NOT to automate, and why?

| Scenario | Classification | Reason |
|---|---|---|
| 2FA (TOTP) sign-in - AUTH-005 | Manual | Needs the TOTP secret inside the automation, which weakens the account. Only worth it with a proper secrets vault |
| CAPTCHA / rate limiting - AUTH-006 | Manual | Would hammer a production service, and the point of the control is that robots cannot pass it. It is never bypassed |
| Cross-device session revocation - AUTH-007 | Manual | Would invalidate the sessions the rest of the suite reuses |
| Password-protected external mail - COMP-004 | Manual | Requires a non-Proton mailbox and link handling outside the app |
| Rich-text rendering - COMP-006, visual layout - UX-001 | Not worth automating | Pixel/visual checks against a frequently changing production UI create noise |
| Concurrent draft edits - DRAFT-005 | Exploratory | Expected behaviour is not specified; investigation beats a scripted assertion |
| Date-range search - SEARCH-003 | Manual | Needs aged data that cannot be created on demand |
| Body-content search - SEARCH-004 | Manual | Needs a slow, device-specific local encrypted index |
| Oversized attachment - ATT-003 | Manual | Uploading > 25 MB encrypted files on every run is slow and costly |
| Real scheduled delivery - ASYNC-003 | Manual / nightly | Wall-clock wait; the automated ASYNC-002 covers the scheduled *state* instead |
| Sieve filters - FILTER-003 | Not worth automating | Paid feature; syntax validation belongs below the UI |

Eight further "Automate" cases (COMP-005, DRAFT-004, INBOX-004, FOLDER-001, LABEL-001, FILTER-002, ATT-002, ATT-004) are **backlog**: worth automating, but deferred to keep the suite at roughly 20 reliable tests, as the assessment asks.

## 2. Which 5 tests would you run on every pull request? Which nightly? Trade-off?

**Every PR (fast, highest risk, about 5 minutes):**

1. **AUTH-002** Invalid credentials rejected: needs no account, catches a broken sign-in page instantly.
2. **AUTH-001** Valid sign-in + reload: the gate for everything else.
3. **COMP-001** Two-account send/receive: the core product promise end to end.
4. **DRAFT-001** Auto-save + reload: protects against data loss.
5. **INBOX-003** Archive → Trash → restore: exercises every core move action and folder state.

**Nightly:** the full suite (`npm test`) on Chromium, plus `BROWSER=all` for Firefox/WebKit: search, filters, attachments, Undo Send, scheduled send, CC/BCC, read/star, the remaining negative cases. Manual/exploratory sessions follow the classified list above.

**Trade-off:** PR feedback must be fast and almost never flaky, otherwise developers learn to ignore it. So the PR set favours P0 journeys with the broadest blast radius. Slower, multi-delivery flows (filters, search seeding, undo window) and cross-browser runs carry more timing exposure; running them nightly still catches regressions within a day without blocking every merge. The tags make this selection a single `--grep`.

## 3. How would you diagnose a test that passes locally but fails intermittently in CI?

1. **Collect evidence before theorising.** Open the CI trace (`reports/traces/*.zip`) in the trace viewer: DOM snapshot at the failing step, network calls, console errors. Compare with the video and the classified summary line.
2. **Classify the failure.** Locator not found (UI change or different render path)? Timeout waiting on state (synchronisation)? Network error or block page (environment)? Sign-in challenge (authentication limitation)? Unexpected data (isolation)?
3. **Look for environment differences.** Headless vs headed, viewport (Proton switches layout by width), CPU speed (CI runners are slower, so delivery and decryption take longer), locale/timezone (scheduled times), IP reputation (CI IPs get CAPTCHA'd more often), parallel workers sharing the same accounts.
4. **Reproduce under CI conditions locally:** `HEADLESS=true WORKERS=1`, CPU throttling, `--repeat-each=20` on the single test to measure the flake rate.
5. **Check isolation:** does it fail only when run alongside another spec? Shared mailbox state, leftover filters or a stale session file are typical suspects.
6. **Fix the cause, not the symptom.** Replace any implicit assumption with a wait on the real state, or make the data more unique. Increasing timeouts or adding retries is only acceptable once the cause is understood, and flaky passes must stay visible in the report.

## 4. How would you reduce test-suite flakiness if the UI changes frequently?

- **Locators that describe intent:** roles, accessible names, labels, placeholders, then stable `data-testid` hooks as fallback (`locator.or()`). Never long CSS chains or XPath.
- **One home per locator** (components/pages), so a UI change is a one-line fix and never a hunt across specs.
- **Assert on state, wait on state:** web-first `expect`, `waitForURL`, bounded `toPass` polling for eventual consistency, no `waitForTimeout`.
- **Neutralise interruptions centrally:** `addLocatorHandler` for promos and onboarding.
- **Unique data per test** so tests never race over shared records.
- **Fast feedback on breakage:** smoke tags on PRs, and the preflight, so environment failures never masquerade as product failures.
- **Agree on test hooks with the product team** (`data-testid` contract) for critical controls; that is the long-term fix for churn.
- **Track flakiness:** quarantine a flaky test with a ticket rather than letting it erode trust, and treat retries as a reported signal.

## 5. How would you scale this suite from 20 tests to 200+ tests while keeping maintenance manageable?

1. **Keep the layering strict.** Specs only call workflows and pages; a code review rule (or lint rule) forbids raw selectors in `tests/`.
2. **Data-driven specs** for variations (as COMP-002 does) instead of copy-pasted tests.
3. **Test-data at a lower level:** with 200 tests, UI-only seeding becomes the bottleneck. Add API/IMAP (Proton Bridge) helpers for seeding and cleanup, reserving the UI for the behaviour under test.
4. **Account pool per worker:** shard tests across several test accounts so parallel workers never share a mailbox, and keep filter/plan-limited tests serial.
5. **Tag taxonomy and test plans:** `@smoke`, `@P0..P3`, feature tags, `@two-account`, `@slow`. CI stages choose by tag; nightly runs everything across browsers with sharding (`--shard`).
6. **Ownership and health metrics:** each feature folder has an owner; dashboards for pass rate, duration and flake rate per test; flaky tests quarantined with tickets.
7. **Regular pruning:** remove tests that duplicate coverage or have not caught anything in a long time, and keep the pyramid healthy by pushing logic checks down to API/component tests where the product team can provide them.
8. **Shared conventions:** templates for new page objects/specs, ESLint + Prettier, PR checklist (unique data, no sleeps, state assertions, cleanup registered).

## 6. How would you test time-dependent behaviour without long-running tests? (scheduled send)

- Verify the **state machine** (draft → scheduled → edited back to draft → deleted) in the PR/nightly suite, as ASYNC-002 does, without waiting for the send time.
- Verify actual delivery in a **separate nightly job** that schedules a message for the shortest allowed custom time and asserts delivery within a tolerance window.
- Where a controllable clock exists (test environment, API that accepts a delivery timestamp), use it; Playwright's `page.clock` can fake the browser clock for UI rendering of times, but cannot move the server's scheduler.
