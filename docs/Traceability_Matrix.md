# Traceability Matrix

Assessment requirement → test case → automated test → actual result (final execution, 2026-10-08).

All 31 tests (20 mailbox + 11 public landing page) were **executed** in the final run (0 skipped). Every failure is classified as a test-data issue (no accounts configured) or an environment issue (Proton Mail not reachable from the execution machine); none indicates a product defect. See [Execution_Summary.md](Execution_Summary.md).

## Section 4 - required scenarios

| Assessment requirement (section 4) | Minimum | Test cases | Automated test | Actual result |
|---|---|---|---|---|
| Authentication, incl. a negative case | 2 | AUTH-001, AUTH-002 (negative), AUTH-003 (negative), AUTH-004 | `tests/authentication/authentication.spec.ts` (4 tests) | Executed - 4 failed (AUTH-001/004: test-data; AUTH-002/003: environment) |
| Compose / send, incl. validation/negative | 3 | COMP-001, COMP-002a (negative), COMP-002b (negative), COMP-003 | `tests/compose/compose.spec.ts` (4 tests) | Executed - 4 failed (test-data) |
| Draft / persistence | 2 | DRAFT-001, DRAFT-002, DRAFT-003 | `tests/drafts/drafts.spec.ts` (3 tests) | Executed - 3 failed (test-data) |
| Inbox / organization across message actions | 3 | INBOX-001, INBOX-002, INBOX-003 | `tests/inbox/inbox.spec.ts` (3 tests) | Executed - 3 failed (test-data) |
| Search, incl. advanced/multi-condition | 2 | SEARCH-001, SEARCH-002 (advanced: keyword AND sender) | `tests/search/search.spec.ts` (2 tests) | Executed - 2 failed (test-data) |
| Filters | 1 | FILTER-001 | `tests/filters/filters.spec.ts` (1 test) | Executed - 1 failed (test-data) |
| Async behavior (undo-send / scheduling) | 1 | ASYNC-001 (Undo Send), ASYNC-002 (Scheduled) | `tests/async/async.spec.ts` (2 tests) | Executed - 2 failed (test-data) |
| Attachments | 1 | ATT-001 | `tests/attachments/attachments.spec.ts` (1 test) | Executed - 1 failed (test-data) |
| Public entry point proton.me/mail (added scope) | - | LAND-001..011 | `tests/landing/landing.spec.ts` (11 tests) | Executed - 11 failed (environment) |
| **Total** | **15** | **31 automated** | **9 spec files** | 31 executed: 0 passed / 31 failed / 0 skipped |

## Section 1 - functional scope

| Scope area (section 1) | Covered by (automated) | Covered by (manual / backlog) |
|---|---|---|
| Authentication & session: login, validation, logout, session, refresh/back, security | AUTH-001 (login + refresh), AUTH-002/003 (validation), AUTH-004 (logout + back) | AUTH-005 2FA, AUTH-006 rate limiting, AUTH-007 revocation |
| Compose & send: recipients, subject/body, CC/BCC, validation, post-send | COMP-001 (post-send verification on receiver), COMP-002a/b, COMP-003 | COMP-004 password-protected, COMP-005 boundaries, COMP-006 rich text |
| Drafts: auto-save, reopen/edit, discard/delete, refresh, draft → sent | DRAFT-001, DRAFT-002, DRAFT-003 | DRAFT-004 with attachment, DRAFT-005 concurrency |
| Inbox & message actions: read/unread, star, archive, trash, restore, bulk | INBOX-001, INBOX-002, INBOX-003 | INBOX-004 bulk |
| Folders & labels | System-folder moves in INBOX-003, FILTER-001 | FOLDER-001, LABEL-001 (backlog) |
| Search: keyword, sender, folder, date, no-result, clear, advanced | SEARCH-001 (keyword + clear), SEARCH-002 (sender + no-result) | SEARCH-003 date, SEARCH-004 body |
| Filters: create, enable/disable, edit, delete, matching vs non-matching | FILTER-001 (create, matching, non-matching, delete) | FILTER-002 disable/edit, FILTER-003 Sieve |
| Attachments: upload, remove, send, receive, filenames, draft persistence | ATT-001 | ATT-002 remove, ATT-003 size, ATT-004 download, DRAFT-004 |
| Asynchronous workflows | ASYNC-001, ASYNC-002 | ASYNC-003 real scheduled delivery |

## Sections 2, 3, 5, 6, 7 - deliverables

| Requirement | Deliverable |
|---|---|
| Test strategy (scope, assumptions, risks, priorities, levels, approach, exclusions) | [docs/Test_Strategy.md](Test_Strategy.md) |
| Test cases with preconditions, steps, data, expected, priority, classification | [test-cases/ProtonMail_TestCases.xlsx](../test-cases/ProtonMail_TestCases.xlsx), [.md](../test-cases/ProtonMail_TestCases.md) |
| Coverage rationale / non-automated scenarios | "Reason" column of every test case; [Automation_Quality_Review.md](Automation_Quality_Review.md) Q1 |
| Reusable page/component abstractions | `pages/`, `components/`, `workflows/` - [Architecture.md](Architecture.md) |
| State-based assertions, robust synchronisation, no hard sleeps | Specs + `MailboxPage.waitForMessage`; `waitForTimeout` not used anywhere |
| Externalised test data | `.env`, `test-data/testData.json`, `utils/testDataGenerator.ts` |
| Failure evidence | Screenshots, traces, videos, logs in `reports/` |
| Readable report | Allure `reports/allure-report/`, `reports/html/`, `reports/Final_Execution_Summary.md` |
| Two-account E2E | COMP-001, COMP-003, INBOX-*, SEARCH-*, FILTER-001, ATT-001 |
| Defect report | [defects/Defect_Report.md](../defects/Defect_Report.md) |
| Quality review questions | [Automation_Quality_Review.md](Automation_Quality_Review.md) + README |
| Architecture note | [Architecture.md](Architecture.md) |
| Video walkthrough (4-5 min) | To be recorded by the candidate (not a code artifact) |
| Bonus: cross-browser, parallel, env config + secrets | `BROWSER=all`, `WORKERS`, `.env` with masking |
| Bonus: CI workflow | Intentionally optional; not implemented (see README) |
