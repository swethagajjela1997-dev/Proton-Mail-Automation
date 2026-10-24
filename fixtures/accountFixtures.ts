import * as fs from 'fs';
import * as path from 'path';
import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { environment, type AccountCredentials } from '@config/environment';
import { ComposePage } from '@pages/ComposePage';
import { DraftPage } from '@pages/DraftPage';
import { FilterPage } from '@pages/FilterPage';
import { LoginPage } from '@pages/LoginPage';
import { MailboxPage } from '@pages/MailboxPage';
import { SearchPage } from '@pages/SearchPage';
import { AuthenticationWorkflow } from '@workflows/AuthenticationWorkflow';

/**
 * A signed-in mailbox owner and the page objects bound to their browser page.
 * Two-account tests hold two of these side by side: `sender` and `receiver`.
 */
export class MailUser {
  readonly login: LoginPage;
  readonly mailbox: MailboxPage;
  readonly compose: ComposePage;
  readonly drafts: DraftPage;
  readonly search: SearchPage;
  readonly filters: FilterPage;

  constructor(readonly account: AccountCredentials, readonly page: Page) {
    this.login = new LoginPage(page);
    this.mailbox = new MailboxPage(page);
    this.compose = new ComposePage(page);
    this.drafts = new DraftPage(page);
    this.search = new SearchPage(page);
    this.filters = new FilterPage(page);
  }

  get address(): string {
    return this.account.username;
  }

  get role(): string {
    return this.account.role;
  }
}

export function storageStatePath(account: AccountCredentials): string {
  return path.join(environment.paths.authState, `${account.role}.json`);
}

const STATE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

/**
 * Signs in once per account and caches the session on disk (.auth/<role>.json, git-ignored).
 * Re-using the session keeps runs fast and avoids tripping Proton's sign-in rate limits.
 */
export async function ensureStorageState(browser: Browser, account: AccountCredentials): Promise<string> {
  const statePath = storageStatePath(account);
  const fresh = fs.existsSync(statePath) && Date.now() - fs.statSync(statePath).mtimeMs < STATE_MAX_AGE_MS;
  if (fresh) return statePath;

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    registerOverlayHandlers(page);
    await new AuthenticationWorkflow().signIn(page, account);
    await context.storageState({ path: statePath });
  } finally {
    await context.close();
  }
  return statePath;
}

/**
 * Proton shows onboarding, "what's new" and upsell dialogs at unpredictable moments.
 * Playwright's locator handlers dismiss them whenever they appear, without sleeps or
 * try/catch noise in the tests. Only dialogs with clearly promotional text are touched.
 */
export function registerOverlayHandlers(page: Page): void {
  const promotional = page
    .getByRole('dialog')
    .filter({ hasText: /welcome to proton|what's new|get the (proton mail )?app|upgrade|discover|onboarding|get started/i });
  void page.addLocatorHandler(promotional, async (dialog) => {
    const dismiss = dialog.getByRole('button', { name: /^(close|skip|maybe later|not now|got it|continue|get started|dismiss)/i }).first();
    if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
    else await page.keyboard.press('Escape');
  });
}

/** A second, fully isolated browser context for the receiving account. */
export async function openSecondaryContext(browser: Browser, statePath: string, testInfo: TestInfo): Promise<BrowserContext> {
  return browser.newContext({
    storageState: statePath,
    recordVideo: { dir: testInfo.outputPath('receiver-video') },
  });
}
