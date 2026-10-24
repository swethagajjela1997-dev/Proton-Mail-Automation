import { test, expect, requireCredentials } from '@fixtures/testFixtures';
import { environment } from '@config/environment';
import { Navigation } from '@components/Navigation';
import { TestData } from '@utils/testDataGenerator';

/**
 * Authentication & session. These tests start signed out (empty storage state) and create
 * their own sessions, so they never invalidate the cached sessions other specs rely on.
 */
test.describe('Authentication & session', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('AUTH-001 Valid credentials open the mailbox and the session survives a page reload', { tag: ['@smoke', '@P0'] }, async ({ page, auth }) => {
    const account = environment.accounts.sender;
    requireCredentials(account);
    const navigation = new Navigation(page);

    await auth.signIn(page, account);
    await expect(page, 'User lands in the Inbox').toHaveURL(/mail\.proton\.me\/u\/\d+\/inbox/);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await navigation.expectMailboxReady();
    await expect(page, 'Session is kept after reload (no redirect to sign-in)').toHaveURL(/\/u\/\d+\/inbox/);
  });

  test('AUTH-002 Invalid credentials are rejected with an error and no session is created', { tag: ['@smoke', '@P0', '@negative'] }, async ({ page, loginPage, auth }) => {
    const { username, password } = TestData.invalidCredentials;

    const outcome = await auth.attemptSignIn(page, username, password);

    expect(outcome, 'Sign-in must be refused').toBe('error');
    await expect(loginPage.credentialsError).toBeVisible();
    await expect(loginPage.usernameInput, 'User stays on the sign-in form').toBeVisible();
    await expect(page).not.toHaveURL(/mail\.proton\.me\/u\/\d+/);
  });

  test('AUTH-003 Submitting the sign-in form with empty fields shows required-field validation', { tag: ['@P2', '@negative'] }, async ({ page, loginPage }) => {
    await loginPage.open();

    await loginPage.signInButton.click();

    await expect(loginPage.fieldError().first(), 'Required-field message is shown').toBeVisible();
    await expect(loginPage.usernameInput).toBeFocused();
    await expect(page, 'No navigation away from sign-in').toHaveURL(/login/);
  });

  test('AUTH-004 Sign-out ends the session and Back navigation does not re-open the mailbox', { tag: ['@P1'] }, async ({ page, loginPage, auth }) => {
    const account = environment.accounts.sender;
    requireCredentials(account);
    await auth.signIn(page, account);

    await auth.signOut(page);

    await page.goBack();
    await expect(loginPage.usernameInput, 'Back navigation lands on sign-in, not on cached mail').toBeVisible({
      timeout: environment.timeouts.navigation,
    });
    await page.goto(`${environment.mailUrl}/u/0/inbox`);
    await loginPage.expectDisplayed();
  });
});
