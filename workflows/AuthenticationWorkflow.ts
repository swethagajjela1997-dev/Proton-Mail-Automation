import { expect, type Page } from '@playwright/test';
import { environment, type AccountCredentials } from '@config/environment';
import { Navigation } from '@components/Navigation';
import { LoginPage, type LoginOutcome } from '@pages/LoginPage';
import { createLogger } from '@utils/logger';

const log = createLogger('AuthenticationWorkflow');

/** Sign-in / sign-out business flows. Never bypasses CAPTCHA, human verification or 2FA. */
export class AuthenticationWorkflow {
  /** Submits credentials from a signed-out page and reports where the user ended up. */
  async attemptSignIn(page: Page, username: string, password: string): Promise<LoginOutcome> {
    const login = new LoginPage(page);
    await login.open();
    if (await login.keepSignedInCheckbox.isVisible().catch(() => false)) {
      // A persistent session is what makes storage-state reuse between tests possible.
      await login.keepSignedInCheckbox.check();
    }
    await login.submit(username, password);
    return login.waitForOutcome(new Navigation(page).composeButton);
  }

  async signIn(page: Page, account: AccountCredentials): Promise<void> {
    log.info(`Signing in ${account.role} account ${account.username}`);
    const outcome = await this.attemptSignIn(page, account.username, account.password);
    if (outcome === 'error') {
      throw new Error(`TEST-DATA ISSUE: Proton rejected the ${account.role} credentials. Check PROTON_* values in .env.`);
    }
    await new Navigation(page).expectMailboxReady();
  }

  /**
   * Opens the mailbox with whatever session the page already has. If the stored session has
   * expired, signs in again and refreshes the stored state, so one stale file never fails a run.
   */
  async ensureSignedIn(page: Page, account: AccountCredentials, storageStatePath?: string): Promise<void> {
    const navigation = new Navigation(page);
    const login = new LoginPage(page);
    await page.goto(`${environment.mailUrl}/u/0/inbox`, { waitUntil: 'domcontentloaded' });
    await expect(navigation.composeButton.or(login.usernameInput).first()).toBeVisible({
      timeout: environment.timeouts.navigation,
    });
    if (await navigation.composeButton.isVisible()) return;

    log.warn(`Stored session for ${account.role} is no longer valid - signing in again`);
    await this.signIn(page, account);
    if (storageStatePath) await page.context().storageState({ path: storageStatePath });
  }

  async signOut(page: Page): Promise<void> {
    await new Navigation(page).signOut();
    await new LoginPage(page).expectDisplayed();
    log.info('Signed out');
  }
}
