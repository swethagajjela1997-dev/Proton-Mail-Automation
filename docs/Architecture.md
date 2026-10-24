# Architecture

## 1. Overview

A layered Playwright + TypeScript framework. Each layer has one responsibility and only talks to the layer below it. The main design goal: **a Proton UI change is fixed in exactly one place, and a test reads like a business requirement.**

```
                    PLAYWRIGHT TEST RUNNER  (playwright.config.ts, globalSetup)
                             │
                             ▼
                     TEST SPECIFICATIONS     tests/**/*.spec.ts      WHAT is verified
                             │
                             ▼
                        WORKFLOWS            workflows/*.ts          business processes
                             │
                             ▼
                       PAGE OBJECTS          pages/*.ts              one app page / area
                             │
                             ▼
                       UI COMPONENTS         components/*.ts         reusable widgets + locators
                             │
                             ▼
                    PROTON MAIL WEB          mail.proton.me / account.proton.me
                             │
                             ▼
                       TEST RESULTS
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
        Screenshots       Traces           Videos
             └───────────────┼────────────────┘
                             ▼
      HTML REPORT + ALLURE REPORT + Final_Execution_Summary.md + logs

  Cross-cutting: config/ (environment) · fixtures/ (sessions, DI of pages/workflows, evidence, cleanup)
                 utils/ (data, logging, preflight, evidence, summary reporter) · test-data/
```

## 2. Layers

| Layer | Folder | Responsibility | Must not |
|---|---|---|---|
| Tests | `tests/<area>/*.spec.ts` | State the scenario and the expected business outcome; tags (`@smoke`, `@P0`...) | Contain selectors or waits |
| Workflows | `workflows/` | Multi-step business flows, possibly across two accounts: `send`, `expectDelivered`, `seedReceivedMessage`, `createDraft`, `createSubjectFilter`, `signIn` | Know about CSS/DOM |
| Page objects | `pages/` | One page/area of the app: `LoginPage`, `MailboxPage`, `ComposePage`, `DraftPage`, `SearchPage`, `FilterPage`, `SettingsPage` | Hold business sequencing that spans pages |
| Components | `components/` | Reusable widgets that appear on several pages: `Navigation`, `MessageRow`, `ComposeDialog`, `Notification`, `SearchControls` | Duplicate locators defined elsewhere |
| Fixtures | `fixtures/` | Build signed-in users, inject pages/workflows, guard the environment, capture evidence, run cleanup | Contain assertions about the product |
| Utilities | `utils/` | Technical helpers only: data generation, logging + masking, preflight, screenshots, summary reporter | Contain business logic |
| Config | `config/` | `.env` → typed `environment` object; global setup | Be read directly via `process.env` elsewhere |

### Example: how a spec reads

```ts
test('COMP-001 Email sent by account A is delivered to account B ...', { tag: ['@smoke', '@P0'] },
  async ({ sender, receiver, email, cleanup }) => {
    const message = { to: [receiver.address], subject: TestData.subject('COMP-001'), body: TestData.body('COMP-001') };
    cleanup.trashMessage(receiver, Folder.Inbox, message.subject);

    await email.send(sender, message);

    await email.expectInSent(sender, message.subject);
    await email.expectDelivered(receiver, { subject: message.subject, from: sender.address, body: message.body });
  });
```

## 3. Key design decisions

| Decision | Why |
|---|---|
| **`MailUser`** (fixtures/accountFixtures.ts) bundles an account with its page objects | Two-account tests read naturally (`sender.mailbox`, `receiver.mailbox`) and never mix pages |
| **Session reuse**: sign in once per account, cache `storageState` in git-ignored `.auth/`; `ensureSignedIn` re-authenticates if the session expired | Fast runs, far fewer sign-ins → avoids Proton rate limits / CAPTCHA; self-healing |
| Sender uses Playwright's built-in `page` (with `storageState` fixture override); receiver gets its own isolated context with video | Standard Playwright auth pattern; full tracing on both contexts |
| **Locator strategy**: role/label/placeholder first, Proton `data-testid` hooks as `.or()` fallback, all inside components/pages | Resilient to copy *or* markup changes; single point of maintenance |
| **No fixed sleeps**; eventual consistency via bounded `toPass` polling | Deterministic and as fast as the app allows |
| `page.addLocatorHandler` for promotional/onboarding dialogs | Removes the main source of random UI interruptions without cluttering tests |
| **Environment preflight** in global setup (informational) | Logs reachability and credential status up front; tests still always run and pass or fail. They are never skipped |
| **Cleanup registry** (`CleanupWorkflow`) | Teardown runs in reverse order even on failure; cleanup problems are logged, never mask the real result |
| Unique data per run (`[PMA-<runId>]` + random token) | Tests are order-independent and parallel-safe on shared mailboxes |
| Custom reporter writes `reports/Final_Execution_Summary.md` | The submitted results are generated from the run, never hand-typed |
| **Allure** reporting with labels (epic/feature/story/severity/tags) and failure **categories** | Stakeholder-friendly dashboard; failures grouped by cause (environment, test-data, authentication, needs triage) |
| Failure card screenshot when no application page loaded | Every failure has a readable screenshot, never a blank image; it never imitates the application |
| Retries: 0 locally, 1 in CI; flaky passes stay visible as "flaky" | Retries absorb infrastructure noise without hiding genuine defects |

## 4. Configuration

`config/environment.ts` is the single source of truth. Every value can be overridden through `.env` or the shell:

| Variable | Purpose | Default |
|---|---|---|
| `PROTON_USERNAME` / `PROTON_PASSWORD` | Account A (sender) | - |
| `PROTON_RECEIVER_USERNAME` / `PROTON_RECEIVER_PASSWORD` | Account B (receiver) | - |
| `BASE_URL`, `MAIL_URL`, `ACCOUNT_URL` | Application URLs | proton.me/mail, mail.proton.me, account.proton.me |
| `BROWSER` | `chromium`, `firefox`, `webkit`, `all` | chromium |
| `HEADLESS` | Headless mode | true |
| `WORKERS` | Parallel workers | 2 (1 in CI) |
| `DELIVERY_TIMEOUT_MS` | Max wait for cross-account delivery | 120000 |
| `SKIP_PREFLIGHT` | Diagnostics: run without the network check | false |
| `LOG_LEVEL` | debug / info / warn / error | info |

## 5. Failure evidence

| Evidence | When | Where |
|---|---|---|
| Screenshot (sender page) | failure | `reports/screenshots/`, attached in HTML report |
| Screenshot (receiver page) | failure of two-account test | `reports/screenshots/` |
| Playwright trace (DOM snapshots, network, console) | failure | `reports/traces/<ID>-trace-retry<N>.zip` → `npx playwright show-trace` |
| Video (sender + receiver) | failure | `reports/videos/` |
| Structured log, secrets masked | always | `reports/logs/execution-<date>.log` |
| Classified summary | always | `reports/Final_Execution_Summary.md` |
| Allure report (screenshots, video, trace, error context, categories) | always | `reports/allure-report/index.html` |

## 6. Scalability and maintainability

- **New test** = a spec using existing workflows; no new selectors in most cases.
- **New feature area** = a page object (+ components if reusable) + a workflow + a spec folder.
- **UI change** = edit one locator in one component/page.
- **Selective execution** by tag (`--grep @smoke`, `@P0`, `@two-account`) and by folder.
- **Parallelism** is safe because data is unique per test; worker count is configurable.
- Growth to 200+ tests is discussed in [Automation_Quality_Review.md](Automation_Quality_Review.md#6-how-would-you-scale-this-suite-from-20-tests-to-200-tests).

## 7. What was deliberately not built

No database, repository, service or API layer; no dependency-injection framework; no generic factories. Proton's API requires SRP authentication and client-side PGP, so an API layer would mean re-implementing the client. Playwright fixtures already provide the dependency injection the suite needs. A CI workflow was treated as an optional enhancement (see README).
