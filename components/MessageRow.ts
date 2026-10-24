import { expect, type Locator, type Page } from '@playwright/test';

/** Every row in a message list carries this keyboard-navigation hook. */
const ROW_SELECTOR = '[data-shortcut-target="item-container"]';

/**
 * One row in the message list, identified by its (unique) subject.
 * State checks read the DOM state Proton renders, not just visibility.
 */
export class MessageRow {
  readonly root: Locator;

  constructor(page: Page, readonly subject: string) {
    this.root = page.locator(ROW_SELECTOR).filter({ hasText: subject }).first();
  }

  static all(page: Page): Locator {
    return page.locator(ROW_SELECTOR);
  }

  async open(): Promise<void> {
    await this.root.click();
  }

  async expectVisible(timeout?: number): Promise<void> {
    await expect(this.root, `Row "${this.subject}" should be listed`).toBeVisible({ timeout });
  }

  async expectAbsent(): Promise<void> {
    await expect(this.root, `Row "${this.subject}" should not be listed`).toHaveCount(0);
  }

  /** Proton renders unread rows with the `unread` class (and read rows with `read`). */
  async expectUnread(): Promise<void> {
    await expect(this.root).toHaveClass(/(^|\s)unread(\s|$)/);
  }

  async expectRead(): Promise<void> {
    await expect(this.root).not.toHaveClass(/(^|\s)unread(\s|$)/);
  }

  private starButton(): Locator {
    return this.root
      .locator('[data-testid^="item-star"]')
      .or(this.root.getByRole('button', { name: /^(un)?star/i }))
      .first();
  }

  async toggleStar(): Promise<void> {
    await this.root.hover();
    await this.starButton().click();
  }
}
