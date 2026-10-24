import { devices } from '@playwright/test';
import { test, expect } from '@fixtures/testFixtures';
import { environment } from '@config/environment';
import { LANDING_CONTENT, LandingPage } from '@pages/LandingPage';

/**
 * Public product page https://proton.me/mail - the first page every user sees.
 * High-level business scenarios: value proposition, acquisition funnels (free, paid,
 * business), sign-in entry, plans and pricing state, FAQ, legal footer, mobile.
 * No account is needed and nothing is ever submitted.
 */
test.describe('Landing page (proton.me/mail)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('LAND-001 Hero presents the privacy value proposition, trust signals and both acquisition paths', { tag: ['@smoke', '@P0', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);

    const response = await landing.open();

    expect(response?.status(), 'Page is served successfully').toBeLessThan(400);
    await expect(page).toHaveTitle(/proton mail/i);
    await expect(landing.headline).toBeVisible();
    await expect(page.getByText(LANDING_CONTENT.valueProposition).first()).toBeVisible();
    for (const signal of LANDING_CONTENT.trustSignals) await expect(page.getByText(signal).first()).toBeVisible();
    await expect(landing.createAccountCta).toBeVisible();
    await expect(landing.businessCta).toBeVisible();
  });

  test('LAND-002 "Create a free account" starts the free sign-up flow', { tag: ['@smoke', '@P0', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();

    await landing.createAccountCta.click();

    // Funnel entry only: no data is entered or submitted.
    await expect(page, 'Lands on Proton account sign-up').toHaveURL(/account\.proton\.me\/.*signup|\/signup/i, { timeout: environment.timeouts.navigation });
  });

  test('LAND-003 A returning user reaches the sign-in form from the page header', { tag: ['@smoke', '@P0', '@public'] }, async ({ page, loginPage }) => {
    const landing = new LandingPage(page);
    await landing.open();

    await landing.signInLink.click();

    await loginPage.expectDisplayed();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeEnabled();
  });

  test('LAND-004 Plans offer Proton Unlimited, a recommended Mail Plus and a free plan without credit card', { tag: ['@P1', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();

    await landing.showPricing();

    for (const plan of ['Proton Unlimited', 'Mail Plus', 'Proton Free'] as const) {
      await expect(landing.planCard(plan), `${plan} card`).toBeVisible();
      await expect(landing.planCta(plan), `${plan} call to action`).toBeVisible();
    }
    await expect(landing.planCard('Proton Free')).toContainText(/0[.,]00/);
    await expect(landing.planCard('Proton Free')).toContainText(/no credit card required/i);
    const recommended = page
      .locator('div, li, article')
      .filter({ hasText: /recommended/i })
      .filter({ has: page.getByRole('heading', { name: 'Mail Plus', exact: true }) })
      .filter({ hasNot: page.getByRole('heading', { name: 'Proton Unlimited', exact: true }) });
    await expect(recommended.first(), 'Mail Plus is the recommended plan').toBeVisible();
  });

  test('LAND-005 Switching the billing period re-prices Mail Plus and back again', { tag: ['@P1', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();
    await landing.showPricing();

    await landing.selectBillingPeriod('12 months');
    const yearlyPrice = (await landing.planPrice('Mail Plus').innerText()).trim();
    await expect(landing.planCard('Mail Plus')).toContainText(/every 12 months/i);

    await landing.selectBillingPeriod('1 month');
    await expect(landing.planPrice('Mail Plus'), 'Monthly billing shows a different price').not.toHaveText(yearlyPrice);
    await expect(landing.planCard('Mail Plus')).not.toContainText(/every 12 months/i);

    await landing.selectBillingPeriod('12 months');
    await expect(landing.planPrice('Mail Plus'), 'Yearly price is restored').toHaveText(yearlyPrice);
  });

  test('LAND-006 Choosing Mail Plus leads to sign-up / checkout for that plan', { tag: ['@P1', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();
    await landing.showPricing();

    await landing.planCta('Mail Plus').click();

    await expect(page, 'Paid-plan funnel opens on Proton account').toHaveURL(/account\.proton\.me\/.*(signup|checkout|plan=)/i, {
      timeout: environment.timeouts.navigation,
    });
  });

  test('LAND-007 Changing the currency re-prices the plans', { tag: ['@P2', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();
    await landing.showPricing();

    await landing.selectCurrency('EUR');

    await expect(landing.currencySelector).toContainText('EUR');
    await expect(landing.planPrice('Mail Plus'), 'Prices are shown in euro').toContainText('€');
  });

  test('LAND-008 "Get Mail for Business" leads to the business offering', { tag: ['@P1', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();

    await landing.businessCta.click();

    await expect(page).toHaveURL(/business/i, { timeout: environment.timeouts.navigation });
  });

  test('LAND-009 FAQ lists all six questions and each answer expands and collapses', { tag: ['@P2', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();
    await page.getByRole('heading', { name: LANDING_CONTENT.faqHeading }).scrollIntoViewIfNeeded();

    for (const question of LANDING_CONTENT.faqQuestions) await expect(landing.faqQuestion(question), question).toBeVisible();

    const question = 'Is Proton Mail free?';
    await landing.faqQuestion(question).click();
    await expect.poll(() => landing.isFaqExpanded(question), 'Answer expands').toBe(true);
    await landing.faqQuestion(question).click();
    await expect.poll(() => landing.isFaqExpanded(question), 'Answer collapses').toBe(false);
  });

  test('LAND-010 Footer exposes legal links, company identity, language selector and current copyright', { tag: ['@P2', '@public'] }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.open();

    for (const [name, href] of Object.entries(LANDING_CONTENT.legalLinks)) {
      await expect(landing.footerLink(name as keyof typeof LANDING_CONTENT.legalLinks)).toHaveAttribute('href', href);
    }
    await expect(landing.footer).toContainText(/Proton AG/);
    await expect(landing.footer).toContainText(/Geneva, Switzerland/);
    await expect(landing.footer).toContainText(`© ${new Date().getFullYear()} Proton AG`);
    await expect(landing.footer.getByRole('button', { name: /english/i }).first(), 'Language selector').toBeVisible();
  });

  test.describe('on a phone', () => {
    // Device profile without defaultBrowserType, so it runs in the configured browser project.
    const { defaultBrowserType: _ignored, ...phone } = devices['Pixel 7'];
    test.use(phone);

    test('LAND-011 Phone layout: menu reveals Sign in, hero stays usable, no horizontal scrolling', { tag: ['@P2', '@public', '@mobile'] }, async ({ page }) => {
      const landing = new LandingPage(page);
      await landing.open();

      await expect(landing.headline).toBeInViewport();
      await expect(landing.createAccountCta).toBeVisible();
      expect(await landing.hasHorizontalOverflow(), 'Page fits the screen width').toBe(false);

      await landing.menuButton.click();
      await expect(landing.signInLink, 'Sign in is reachable from the menu').toBeVisible();
    });
  });
});
