import type { Page } from '@playwright/test';
import { environment } from '@config/environment';
import { ComposeDialog } from '@components/ComposeDialog';
import { Folder } from '@components/Navigation';
import { MailboxPage } from './MailboxPage';

/** The Drafts folder. Opening a draft re-opens it in the composer for editing. */
export class DraftPage {
  private readonly mailbox: MailboxPage;
  private readonly composer: ComposeDialog;

  constructor(page: Page) {
    this.mailbox = new MailboxPage(page);
    this.composer = new ComposeDialog(page);
  }

  async open(): Promise<void> {
    await this.mailbox.openFolder(Folder.Drafts);
  }

  /** Drafts are saved asynchronously; wait until the server copy is listed. */
  async expectDraftSaved(subject: string): Promise<void> {
    await this.mailbox.waitForMessage(Folder.Drafts, subject, environment.timeouts.action * 3);
  }

  async expectDraftAbsent(subject: string): Promise<void> {
    await this.mailbox.expectNotInFolder(Folder.Drafts, subject);
  }

  async reopen(subject: string): Promise<ComposeDialog> {
    await this.open();
    await this.mailbox.row(subject).open();
    await this.composer.expectOpen();
    return this.composer;
  }
}
