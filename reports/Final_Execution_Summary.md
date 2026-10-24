# Final Execution Summary

> Generated automatically by `utils/executionSummaryReporter.ts` from the last `npx playwright test` run.

| Item | Value |
|---|---|
| Execution date (UTC) | 2026-10-24T12:23:05.166Z |
| Verdict | FAILED |
| Playwright run status | failed |
| Browser project(s) | chromium |
| Environment | https://mail.proton.me on win32 / Node v24.21.0 |
| Total tests | 11 |
| Passed | 4 |
| Failed | 7 |
| Skipped / blocked | 0 |
| Pass rate (of executed) | 36.4% |
| Duration | 163.8 s |

## Results

| ID | Test | Browser | Status | Duration | Classification | Detail |
|---|---|---|---|---|---|---|
| LAND-001 | LAND-001 Hero presents the privacy value proposition, trust signals and both acquisition paths | chromium | passed | 6.5 s | - |  |
| LAND-002 | LAND-002 "Create a free account" starts the free sign-up flow | chromium | failed | 67.9 s | Needs triage (locator / synchronization / application) | Error: Lands on Proton account sign-up |
| LAND-003 | LAND-003 A returning user reaches the sign-in form from the page header | chromium | failed | 65.4 s | Needs triage (locator / synchronization / application) | Error: expect(page).toHaveURL(expected) failed |
| LAND-004 | LAND-004 Plans offer Proton Unlimited, a recommended Mail Plus and a free plan without credit card | chromium | failed | 21.3 s | Needs triage (locator / synchronization / application) | Error: Proton Unlimited card |
| LAND-005 | LAND-005 Switching the billing period re-prices Mail Plus and back again | chromium | failed | 22.5 s | Needs triage (locator / synchronization / application) | TimeoutError: locator.innerText: Timeout 15000ms exceeded. |
| LAND-006 | LAND-006 Choosing Mail Plus leads to sign-up / checkout for that plan | chromium | passed | 7.2 s | - |  |
| LAND-007 | LAND-007 Changing the currency re-prices the plans | chromium | failed | 26.2 s | Needs triage (locator / synchronization / application) | TimeoutError: locator.click: Timeout 15000ms exceeded. |
| LAND-008 | LAND-008 "Get Mail for Business" leads to the business offering | chromium | passed | 6.7 s | - |  |
| LAND-009 | LAND-009 FAQ lists all six questions and each answer expands and collapses | chromium | failed | 23.1 s | Needs triage (locator / synchronization / application) | Error: What is Proton Mail? |
| LAND-010 | LAND-010 Footer exposes legal links, company identity, language selector and current copyright | chromium | passed | 10.2 s | - |  |
| LAND-011 | LAND-011 Phone layout: menu reveals Sign in, hero stays usable, no horizontal scrolling | chromium | failed | 22.0 s | Needs triage (locator / synchronization / application) | Error: Sign in is reachable from the menu |

Evidence: `reports/html/index.html` (HTML report), `reports/traces/`, `reports/videos/`, `reports/screenshots/`, `reports/logs/`.
