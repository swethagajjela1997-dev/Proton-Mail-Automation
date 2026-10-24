import * as fs from 'fs';
import * as path from 'path';
import { test as base, expect, type TestInfo } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { environment, hasCredentials, type AccountCredentials } from '@config/environment';
import { LoginPage } from '@pages/LoginPage';
import { AuthenticationWorkflow } from '@workflows/AuthenticationWorkflow';
import { CleanupWorkflow } from '@workflows/CleanupWorkflow';
import { DraftWorkflow } from '@workflows/DraftWorkflow';
import { EmailWorkflow } from '@workflows/EmailWorkflow';
import { FilterWorkflow } from '@workflows/FilterWorkflow';
import { SearchWorkflow } from '@workflows/SearchWorkflow';
import type { PreflightResult } from '@utils/environmentValidator';
import { createLogger } from '@utils/logger';
import { captureEvidence } from '@utils/screenshotUtils';
import {
  MailUser,
  ensureStorageState,
  openSecondaryContext,
  registerOverlayHandlers,
  storageStatePath,
} from './accountFixtures';

const log = createLogger('fixtures');

type Fixtures = {
  /** Auto: records environment readiness and Allure labels. Never skips: every test runs. */
  executionContext: void;
  /** Auto: per-test logging, failure screenshot and cleanup orchestration. */
  testLifecycle: void;
  /** Signed-out page for authentication tests. */
  loginPage: LoginPage;
  /** Account A - signed in, on the default (instrumented) page. */
  sender: MailUser;
  /** Account B - signed in, in its own isolated browser context. */
  receiver: MailUser;
  auth: AuthenticationWorkflow;
  email: EmailWorkflow;
  drafts: DraftWorkflow;
  search: SearchWorkflow;
  filters: FilterWorkflow;
  cleanup: CleanupWorkflow;
};

function readPreflight(): PreflightResult | undefined {
  const file = path.join(environment.paths.reports, 'preflight.json');
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as PreflightResult) : undefined;
}

/** Fails fast with a classified, actionable message when the account is not configured in .env. */
export function requireCredentials(account: AccountCredentials): void {
  if (hasCredentials(account)) return;
  const variables = account.role === 'sender' ? 'PROTON_USERNAME / PROTON_PASSWORD' : 'PROTON_RECEIVER_USERNAME / PROTON_RECEIVER_PASSWORD';
  throw new Error(`TEST-DATA ISSUE: ${account.role} account not configured - set ${variables} in .env`);
}

const SEVERITY_BY_PRIORITY: Record<string, string> = { '@P0': 'blocker', '@P1': 'critical', '@P2': 'normal', '@P3': 'minor' };

/** Feature = spec folder (tests/<feature>/...), severity = priority tag, tags = Playwright tags. */
async function applyAllureLabels(testInfo: TestInfo): Promise<void> {
  const feature = path.basename(path.dirname(testInfo.file));
  await allure.epic('Proton Mail Web');
  await allure.feature(feature.charAt(0).toUpperCase() + feature.slice(1));
  await allure.story(testInfo.title.split(/s+/)[0]);
  const priority = testInfo.tags.find((tag) => tag in SEVERITY_BY_PRIORITY);
  if (priority) await allure.severity(SEVERITY_BY_PRIORITY[priority]);
}

export const test = base.extend<Fixtures>({
  executionContext: [
    async ({}, use, testInfo) => {
      await applyAllureLabels(testInfo);
      const preflight = environment.skipPreflight ? undefined : readPreflight();
      if (preflight && preflight.status !== 'READY') {
        // Informational only: the test still runs and passes or fails on its own merits.
        testInfo.annotations.push({ type: 'environment', description: `${preflight.status} - ${preflight.detail}` });
        log.warn(`Preflight ${preflight.status}: running "${testInfo.title}" anyway`);
      }
      await use();
    },
    { auto: true },
  ],

  testLifecycle: [
    async ({ page, cleanup }, use, testInfo) => {
      log.info(`START ${testInfo.title}`);
      await use();
      if (testInfo.status !== testInfo.expectedStatus) await captureEvidence(page, testInfo, 'failure');
      await cleanup.runAll();
      log.info(`END   ${testInfo.title} -> ${testInfo.status} (${testInfo.duration} ms)`);
    },
    { auto: true },
  ],

  // The default page is signed in as the sender. Auth specs override this with an empty state.
  storageState: async ({ executionContext, browser }, use) => {
    void executionContext;
    // Without credentials the page still opens (signed out), so the `sender` fixture fails
    // with a classified error AND the failure is captured with a screenshot, trace and video.
    if (!hasCredentials(environment.accounts.sender)) return use({ cookies: [], origins: [] });
    await use(await ensureStorageState(browser, environment.accounts.sender));
  },

  page: async ({ page }, use) => {
    registerOverlayHandlers(page);
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  sender: async ({ page, auth }, use) => {
    const account = environment.accounts.sender;
    requireCredentials(account);
    await auth.ensureSignedIn(page, account, storageStatePath(account));
    await use(new MailUser(account, page));
  },

  receiver: async ({ browser, auth, cleanup }, use, testInfo) => {
    const account = environment.accounts.receiver;
    requireCredentials(account);
    const statePath = await ensureStorageState(browser, account);
    const context = await openSecondaryContext(browser, statePath, testInfo);
    const page = await context.newPage();
    registerOverlayHandlers(page);
    await auth.ensureSignedIn(page, account, statePath);

    await use(new MailUser(account, page));

    const failed = testInfo.status !== testInfo.expectedStatus;
    if (failed) await captureEvidence(page, testInfo, 'receiver-failure');
    // Cleanup tasks may need the receiver page, so they run before its context closes.
    await cleanup.runAll();
    const video = page.video();
    await context.close();
    if (video && failed) await testInfo.attach('receiver-video', { path: await video.path(), contentType: 'video/webm' });
    else if (video) await video.delete();
  },

  auth: async ({}, use) => use(new AuthenticationWorkflow()),
  email: async ({}, use) => use(new EmailWorkflow()),
  drafts: async ({}, use) => use(new DraftWorkflow()),
  search: async ({}, use) => use(new SearchWorkflow()),
  filters: async ({}, use) => use(new FilterWorkflow()),
  cleanup: async ({}, use) => use(new CleanupWorkflow()),
});

export { expect };
