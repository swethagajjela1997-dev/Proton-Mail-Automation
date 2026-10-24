import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { environment } from '@config/environment';

export type PlanName = 'Proton Unlimited' | 'Mail Plus' | 'Proton Free';
export type BillingPeriod = '1 month' | '12 months';

/** Texts as published on https://proton.me/mail (checked against a capture of the live page). */
export const LANDING_CONTENT = {
  headline: 'Secure email that protects your privacy',
  valueProposition: /encrypted email service based in Switzerland/i,
  createAccountCta: 'Create a free account',
  businessCta: 'Get Mail for Business',
  trustSignals: [/trusted by over 100 million/i, /app rating/i, /recommended by the experts/i],
  pricingHeading: 'Proton Mail plans for your privacy',
  plans: {
    'Proton Unlimited': 'Get Proton Unlimited',
    'Mail Plus': 'Get Mail Plus',
    'Proton Free': 'Get Proton Free',
  } as Record<PlanName, string>,
  faqHeading: 'Proton Mail FAQ',
  faqQuestions: [
    'What is Proton Mail?',
    'Why do I need a private email?',
    'How can I get a private email?',
    'Do you offer a plan for families?',
    'Is Proton Mail safer than Gmail?',
    'Is Proton Mail free?',
  ],
  businessHeading: 'Secure your business',
  legalLinks: { 'Privacy Policy': /legal\/privacy/, 'Terms & conditions': /legal\/terms/ },
} as const;

/**
 * Public product page https://proton.me/mail - the real entry point for new and returning
 * users. Sections: hero, trust signals, feature blocks, plans, FAQ, business, footer.
 */
export class LandingPage {
  readonly header: Locator;
  readonly headline: Locator;
  readonly createAccountCta: Locator;
  readonly businessCta: Locator;
  readonly signInLink: Locator;
  readonly menuButton: Locator;
  readonly pricingHeading: Locator;
  readonly currencySelector: Locator;
  readonly footer: Locator;

  constructor(private readonly page: Page) {
    this.header = page.getByRole('banner').or(page.locator('header')).first();
    this.headline = page.getByRole('heading', { level: 1, name: LANDING_CONTENT.headline });
    this.createAccountCta = page.getByRole('link', { name: LANDING_CONTENT.createAccountCta, exact: true }).first();
    this.businessCta = page.getByRole('link', { name: new RegExp(`^${LANDING_CONTENT.businessCta}`, 'i') }).first();
    this.signInLink = page.getByRole('link', { name: /^sign in$/i }).first();
    this.menuButton = this.header.getByRole('button', { name: /menu|navigation/i }).first();
    this.pricingHeading = page.getByRole('heading', { name: LANDING_CONTENT.pricingHeading });
    this.currencySelector = page.getByRole('button', { name: /^(USD|EUR|CHF|GBP)\b/ }).or(page.getByRole('combobox', { name: /currency/i })).first();
    this.footer = page.getByRole('contentinfo').or(page.locator('footer')).first();
    this.registerConsentHandler();
  }

  /** Declines optional cookies if a consent banner appears (privacy-preserving default). */
  private registerConsentHandler(): void {
    const banner = this.page.getByRole('dialog').filter({ hasText: /cookie/i });
    void this.page.addLocatorHandler(banner, async (consent) => {
      await consent.getByRole('button', { name: /reject|decline|necessary only|accept/i }).first().click();
    });
  }

  async open(url = environment.baseUrl): Promise<Response | null> {
    const response = await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(this.headline, 'Landing headline should render').toBeVisible({ timeout: environment.timeouts.navigation });
    return response;
  }

  // ---------- plans ----------

  /** The card of one plan: the innermost block holding both the plan name and its CTA. */
  planCard(plan: PlanName): Locator {
    return this.page
      .locator('div, li, article')
      .filter({ has: this.page.getByRole('heading', { name: plan, exact: true }) })
      .filter({ has: this.planCta(plan) })
      .last();
  }

  planCta(plan: PlanName): Locator {
    return this.page.getByRole('link', { name: LANDING_CONTENT.plans[plan], exact: true }).or(this.page.getByRole('button', { name: LANDING_CONTENT.plans[plan], exact: true })).first();
  }

  /** Main per-month price shown on a plan card, e.g. "$3.99" or "€3,99". */
  planPrice(plan: PlanName): Locator {
    return this.planCard(plan).getByText(/^\s*(\$|€|£|CHF)\s?\d+[.,]\d{2}\s*$/).last();
  }

  async showPricing(): Promise<void> {
    await this.pricingHeading.scrollIntoViewIfNeeded();
    await expect(this.pricingHeading).toBeVisible();
  }

  async selectBillingPeriod(period: BillingPeriod): Promise<void> {
    const option = this.page
      .getByRole('radio', { name: period, exact: true })
      .or(this.page.getByRole('tab', { name: period, exact: true }))
      .or(this.page.getByRole('button', { name: period, exact: true }))
      .first();
    await option.click();
  }

  async selectCurrency(currency: 'USD' | 'EUR' | 'CHF' | 'GBP'): Promise<void> {
    await this.currencySelector.click();
    await this.page
      .getByRole('option', { name: new RegExp(`^${currency}`) })
      .or(this.page.getByRole('menuitem', { name: new RegExp(`^${currency}`) }))
      .or(this.page.getByRole('button', { name: new RegExp(`^${currency}$`) }))
      .first()
      .click();
  }

  // ---------- FAQ ----------

  faqQuestion(question: string): Locator {
    return this.page.getByRole('button', { name: question, exact: true }).or(this.page.locator('summary', { hasText: question })).first();
  }

  /** Expanded = aria-expanded="true" on the trigger, or its <details> element is open. */
  isFaqExpanded(question: string): Promise<boolean> {
    return this.faqQuestion(question).evaluate(
      (element) => element.getAttribute('aria-expanded') === 'true' || Boolean(element.closest('details')?.open),
    );
  }

  // ---------- footer / layout ----------

  footerLink(name: keyof typeof LANDING_CONTENT.legalLinks): Locator {
    return this.footer.getByRole('link', { name, exact: true });
  }

  hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  }
}
