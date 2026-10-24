import type { Page } from '@playwright/test';
import { ComposeDialog } from '@components/ComposeDialog';
import { Navigation } from '@components/Navigation';
import { Notification } from '@components/Notification';

/** Entry point to the composer and to the send-flow feedback (toasts, validation modals). */
export class ComposePage {
  readonly dialog: ComposeDialog;
  readonly notification: Notification;
  private readonly navigation: Navigation;

  constructor(private readonly page: Page) {
    this.dialog = new ComposeDialog(page);
    this.notification = new Notification(page);
    this.navigation = new Navigation(page);
  }

  async openNew(): Promise<ComposeDialog> {
    await this.navigation.composeButton.click();
    await this.dialog.expectOpen();
    return this.dialog;
  }

  /** Validation feedback can be a modal or a toast depending on the error; both are accepted. */
  validationError(text: RegExp) {
    return this.page.getByRole('dialog').filter({ hasText: text }).or(this.notification.withText(text)).first();
  }

  async dismissValidationDialog(): Promise<void> {
    const dialog = this.page.getByRole('dialog').filter({ hasNot: this.dialog.subjectInput });
    const button = dialog.getByRole('button', { name: /^(ok|close|cancel|got it)$/i }).first();
    if (await button.isVisible().catch(() => false)) await button.click();
  }
}
