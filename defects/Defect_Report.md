# Defect Report

## Application defects

**No confirmed application defect was identified within the executed assessment scope.**

All 31 tests were executed (final run 2026-10-08: 0 passed, 31 failed). Every failure is classified as a test-data issue (no accounts) or an environment issue (application not reachable). None of them is a product failure, and no authenticated product behaviour could be observed. No defect is reported without evidence: the assessment asks to "not manufacture bugs", and this report keeps to that.

## Limitations (not defects)

| ID | Limitation | Handling |
|---|---|---|
| LIM-001 | Proton Mail was not reachable from the execution machine | Tests that need the application fail with a navigation error, classified as **Environment issue** in Allure and in the summary. Run from a machine with direct access to `*.proton.me` |
| LIM-002 | Test accounts were not provided. Accounts are not created by automation because Proton signup includes human verification, which must not be bypassed | Tests that need an account fail fast with `TEST-DATA ISSUE: ... not configured`, classified as **Test-data issue**, until `.env` is filled in |

## Automation-relevant risks (from Proton's public behaviour / documentation)

| ID | Risk | Mitigation in the suite |
|---|---|---|
| RISK-01 | Repeated sign-ins from the same IP can trigger human verification | Session reuse per account; challenges surfaced as `AUTHENTICATION LIMITATION` |
| RISK-02 | Server-side search covers metadata only; body search needs a local index | Search tokens placed in subjects; body search kept manual |
| RISK-03 | Free plan allows one custom filter | Stale suite filters are deleted before creating a new one; filter tests must not run concurrently on the same account |
| RISK-04 | Promotional / onboarding dialogs appear unpredictably | Central `addLocatorHandler` dismissal |

## Defect template

Use this structure for any defect found once the suite runs against the live application:

| Field | Content |
|---|---|
| Defect ID / Title | Clear, concise summary |
| Environment | Browser, OS, viewport, build/date |
| Severity / Priority | With reasoning, not only a label |
| Preconditions | Account / data / state |
| Steps to reproduce | Minimal and deterministic |
| Expected vs actual | What should happen vs what happened |
| Evidence | Screenshot, trace, video, log from `reports/` |
| Reproducibility | Always / often / intermittent, with observations |
| Impact | Who is affected and how |
