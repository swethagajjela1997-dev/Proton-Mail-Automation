# Test Strategy - Proton Mail Web

## 1. Objective

Provide a small, reliable, risk-based regression suite for Proton Mail Web that protects the journeys a user cannot afford to lose: signing in, sending and receiving mail, not losing drafts, organising and finding mail, and the asynchronous send flows. The goal is **trustworthy signal**, not volume: about 20 mailbox scenarios plus 11 public landing-page scenarios that fail only when the product is broken.

## 2. Scope

| Area | In scope (automated) | Kept manual / exploratory |
|---|---|---|
| Public landing page (proton.me/mail) | Value proposition and trust signals, free / paid / business funnels, header Sign in, plans + billing period + currency, FAQ, legal footer, phone layout | Visual design and carousel, page health (backlog), localisation |
| Authentication & session | Valid sign-in + reload persistence, invalid credentials, empty-form validation, sign-out + Back navigation | 2FA, CAPTCHA / rate limiting, cross-device session revocation |
| Compose & send | Two-account send with sender/subject/body verification, malformed and missing recipient, CC visible / BCC hidden | Password-protected external mail, rich-text rendering |
| Drafts | Auto-save without closing, reload persistence, reopen-edit-send (Drafts → Sent), delete | Concurrent edits in two tabs |
| Inbox & message actions | Unread/read/unread, star/unstar (Starred folder), Inbox → Archive → Trash → Inbox | Bulk actions (backlog) |
| Folders & labels | Covered indirectly by system-folder moves | Custom folder/label CRUD (backlog) |
| Search | Keyword + clear/reset, advanced keyword + sender, no-result | Date range, body-content index |
| Filters | Subject filter with matching and non-matching mail, cleanup | Enable/disable/edit (backlog), Sieve |
| Attachments | Upload → send → received with same file name | Size limit, download checksum (backlog) |
| Asynchronous | Undo Send (transient + final state), Scheduled send + cancel | Real delivery at scheduled time |

Full list: [`test-cases/ProtonMail_TestCases.md`](../test-cases/ProtonMail_TestCases.md) (55 designed, 31 automated).

## 3. Out of scope

- Proton Calendar, Drive, VPN, Pass and the mobile/desktop apps.
- Billing, plan upgrades and account creation (signup includes human verification and must not be automated).
- Performance, load and penetration testing of a production service.
- Bypassing any security control (CAPTCHA, human verification, 2FA, rate limits). These are documented as limitations, never worked around.

## 4. Assumptions

1. Two dedicated **free** Proton accounts (A = sender, B = receiver), 2FA disabled, UI language English, default settings (column layout, conversation grouping, Undo Send window > 0).
2. Accounts contain no other custom filter (the free plan allows one; the suite removes its own stale filters).
3. Production `https://mail.proton.me` / `https://account.proton.me` is the system under test. There is no staging environment or test API.
4. The machine running the suite can reach `*.proton.me` directly.

## 5. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Live production SUT changes UI without notice | Locator breakage | Role/label-first locators with `data-testid` fallback, centralised in components/pages; one fix per change |
| Cross-account delivery is eventually consistent | Flaky timing | Bounded polling (`expect.toPass`) that refreshes the folder until the row appears; no sleeps |
| Sign-in rate limiting / CAPTCHA | Blocked runs | Sign in once per account per worker and reuse the session (`.auth/*.json`); challenges raise a classified `AUTHENTICATION LIMITATION` error |
| Shared mailboxes between parallel tests | Cross-test interference | Every artifact carries a unique run ID + random token; assertions are scoped to that subject |
| Leftover data from aborted runs | Pollution, filter limit | Per-test cleanup registry (runs even on failure); stale suite filters deleted before creating a new one |
| Proton Mail not reachable from the execution machine | Whole suite fails | Preflight logs reachability up front; failures are classified as **Environment issue** in Allure and the summary |
| Credentials leakage | Security | `.env` (git-ignored), logger masks passwords and e-mail local parts, sessions stored in git-ignored `.auth/` |

## 6. Prioritisation

| Priority | Definition (from assessment) | Examples |
|---|---|---|
| P0 | Blocks a major journey | AUTH-001, AUTH-002, COMP-001 |
| P1 | High business/user impact | Drafts, inbox actions, search, filters, attachments, Undo Send, CC/BCC privacy |
| P2 | Useful, lower immediate risk | Empty-form validation, draft delete, scheduled send |
| P3 | Edge / cosmetic | Long subjects, visual layout |

Tags in code: `@P0`, `@P1`, `@P2`, `@smoke`, `@negative`, `@two-account`.

## 7. Test levels

| Level | Used here | Rationale |
|---|---|---|
| UI end-to-end (Playwright) | Yes - the whole suite | Assessment target; Proton encrypts client-side, so the browser is the realistic integration point |
| API-assisted setup | Not used | Proton's API requires SRP authentication and client-side PGP; reproducing it would mean re-implementing the client. Setup is done through the UI workflows instead (documented trade-off) |
| Component / unit | Not applicable | No access to the source code |
| Manual / exploratory | Yes, for the scenarios classified as such | Human judgement, security challenges, long wall-clock waits |

## 8. Automation strategy

- **Selection rule:** automate what is high-value, deterministic and repeatable. Keep work that needs human judgement, external systems or long waits manual. See the "Reason" column of every test case.
- **Design:** layered framework: specs → workflows → page objects → components (see [Architecture.md](Architecture.md)).
- **Assertions:** verify business state, not clicks. Examples: the receiver sees the right sender/subject/body; a message is in exactly the target folder and absent from the source; the BCC address does not leak; a draft survives a full reload.
- **Negative & edge coverage:** invalid credentials, empty form, malformed and missing recipient, no-result search, non-matching filter mail, BCC privacy.
- **State-transition coverage:** unread → read → unread, Inbox → Archive → Trash → Inbox, draft → edited → sent, scheduled → draft, sent → undone → re-sent.

## 9. Test data strategy

- Credentials only from environment variables (`.env`, see `.env.example`).
- Static data in `test-data/testData.json`; attachment fixture `test-data/attachment.txt`.
- Dynamic data from `utils/testDataGenerator.ts`: `Automation Assessment [PMA-<runId>] <TEST-ID> <random>`. The run ID is shared by all workers, so every message from one run is traceable.
- Search tokens are single alphanumeric words placed in the **subject**, because Proton's server-side search indexes metadata. Body search requires an optional local index.
- Cleanup: messages created by a test are moved to Trash and filters/drafts deleted, via a cleanup registry that also runs when the test fails.

## 10. Synchronisation strategy

| Situation | Technique |
|---|---|
| Normal interaction | Playwright auto-waiting + web-first `expect` assertions |
| App boot / navigation | `waitForURL` on the folder route + mailbox-ready element |
| Delivery to another account | `expect(...).toPass()` polling that re-opens the folder (triggers Proton's event refresh), bounded by `DELIVERY_TIMEOUT_MS` |
| Undo Send window | Wait for the Undo button to appear, then to disappear: the real end of the window |
| Upload completion | Attachment listed and no progress bar left in the composer |
| Unpredictable promos/onboarding dialogs | `page.addLocatorHandler` dismisses them whenever they appear |

`page.waitForTimeout()` is not used anywhere in the suite.

## 11. Browser strategy

Chromium is the default regression browser (largest user share and fastest run). Firefox and WebKit are configured and selectable with `BROWSER=firefox|webkit|all`. Running them nightly rather than on every change keeps PR feedback fast.

## 12. Reporting

- Allure report → `reports/allure-report/` (`npm run test:allure`), with epic/feature/story/severity labels and failure categories
- Playwright HTML report → `reports/html/`
- JSON results → `reports/results.json`
- Auto-generated summary with failure classification → `reports/Final_Execution_Summary.md`
- On failure: screenshot (`reports/screenshots/`), trace (`reports/traces/`), video (`reports/videos/`), and for two-account tests receiver screenshot + video
- Execution log with masked secrets → `reports/logs/`

## 13. Known limitations

1. **Execution environment:** Proton Mail was not reachable from the machine used for development, so the suite has not yet run against the live application; see [Execution_Summary.md](Execution_Summary.md).
2. **No test accounts were provided**, so authenticated selectors are based on Proton's public web client structure (roles, labels, `data-testid` hooks) and have not yet been validated against a live authenticated session. They are centralised, so validation is a contained task.
3. Scheduled delivery at the real time and 2FA flows are manual by design.
4. Free-plan constraints: one custom filter, limited scheduled messages.
