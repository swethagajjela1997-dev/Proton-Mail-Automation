import { expect, type Page } from '@playwright/test';
import { environment } from '@config/environment';

export type SettingsSection = 'filters' | 'messages-and-composing';

/** Proton account settings (account.proton.me/u/0/mail/<section>). */
export class SettingsPage {
  constructor(private readonly page: Page) {}

  async open(section: SettingsSection): Promise<void> {
    await this.page.goto(`${environment.accountUrl}/u/0/mail/${section}`, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(new RegExp(`/mail/${section}`), { timeout: environment.timeouts.navigation });
    await expect(this.page.getByRole('main').or(this.page.locator('main')).first()).toBeVisible({
      timeout: environment.timeouts.navigation,
    });
  }
}
