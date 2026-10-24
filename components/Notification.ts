import { expect, type Locator, type Page } from '@playwright/test';
import { environment } from '@config/environment';

/**
 * Proton's transient toast notifications ("Message sent.", "Draft saved", error toasts...).
 * Toasts are the primary signal for asynchronous outcomes, so they are modelled explicitly.
 */
export class Notification {
  private readonly toasts: Locator;

  constructor(page: Page) {
    this.toasts = page.getByRole('alert').or(page.locator('.notification'));
  }

  /** A toast whose text matches `text`. */
  withText(text: string | RegExp): Locator {
    return this.toasts.filter({ hasText: text }).first();
  }

  async expectVisible(text: string | RegExp, timeout = environment.timeouts.action): Promise<void> {
    await expect(this.withText(text), `Expected notification "${text}"`).toBeVisible({ timeout });
  }

  async expectNotVisible(text: string | RegExp): Promise<void> {
    await expect(this.withText(text)).toBeHidden();
  }

  /** The "Undo" action offered inside the "Message sent" toast during the undo-send window. */
  undoButton(): Locator {
    return this.withText(/message sent/i).getByRole('button', { name: /^undo$/i });
  }
}
