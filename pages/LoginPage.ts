import { expect, type Locator, type Page } from '@playwright/test';
import { environment } from '@config/environment';

/** Raised when Proton presents a security challenge. Challenges are never bypassed. */
export class SecurityChallengeError extends Error {
  constructor(challenge: string) {
    super(
      `AUTHENTICATION LIMITATION: Proton presented a ${challenge}. Automated tests do not bypass ` +
        'CAPTCHA / human verification / 2FA. Use dedicated test accounts without 2FA and retry later ' +
        'if the account is temporarily rate-limited.',
    );
    this.name = 'SecurityChallengeError';
  }
}

export type LoginOutcome = 'mailbox' | 'error';

/** Proton account sign-in page (account.proton.me/login). */
export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly keepSignedInCheckbox: Locator;
  readonly credentialsError: Locator;
  private readonly humanVerification: Locator;
  private readonly twoFactorPrompt: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('#username').or(page.getByLabel(/email or username/i)).first();
    this.passwordInput = page.locator('#password').or(page.getByLabel(/^password$/i)).first();
    this.signInButton = page.getByRole('button', { name: /^sign in$/i });
    this.keepSignedInCheckbox = page.getByLabel(/keep me signed in/i);
    this.credentialsError = page.getByText(/incorrect login credentials/i).first();
    this.humanVerification = page.getByRole('heading', { name: /human verification/i });
    this.twoFactorPrompt = page.getByRole('heading', { name: /two-factor|2fa|authenticator/i });
  }

  /** Opening the mail app while signed out redirects to the account sign-in page. */
  async open(): Promise<void> {
    await this.page.goto(environment.mailUrl, { waitUntil: 'domcontentloaded' });
    await this.expectDisplayed();
  }

  async expectDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/account\.proton\.me\/.*(login|switch)|\/login/, {
      timeout: environment.timeouts.navigation,
    });
    await expect(this.usernameInput).toBeVisible({ timeout: environment.timeouts.navigation });
  }

  async submit(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /** The inline message shown under an empty required field. */
  fieldError(text: RegExp = /this field is required/i): Locator {
    return this.page.getByText(text);
  }

  /**
   * Waits for the first terminal state after submitting credentials and reports which one
   * was reached. Security challenges are surfaced as explicit, classified errors.
   */
  async waitForOutcome(mailboxReady: Locator): Promise<LoginOutcome> {
    const anyOutcome = mailboxReady.or(this.credentialsError).or(this.humanVerification).or(this.twoFactorPrompt);
    await expect(anyOutcome.first(), 'Sign-in should reach a terminal state').toBeVisible({
      timeout: environment.timeouts.navigation,
    });

    if (await this.humanVerification.isVisible()) throw new SecurityChallengeError('human verification (CAPTCHA) challenge');
    if (await this.twoFactorPrompt.isVisible()) throw new SecurityChallengeError('two-factor authentication prompt');
    return (await this.credentialsError.isVisible()) ? 'error' : 'mailbox';
  }
}
