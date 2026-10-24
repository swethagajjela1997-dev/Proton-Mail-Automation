import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';
import { environment } from '@config/environment';
import { Folder, Navigation, type FolderRef } from '@components/Navigation';
import { MessageRow } from '@components/MessageRow';
import { Notification } from '@components/Notification';

export interface ExpectedMessage {
  subject: string;
  from?: string;
  body?: string;
  attachmentName?: string;
  /** Addresses that must NOT appear anywhere in the message header (e.g. BCC privacy). */
  hiddenAddresses?: string[];
  /** Addresses that must appear in the message header (e.g. CC recipients). */
  visibleAddresses?: string[];
}

type ToolbarAction = 'archive' | 'trash' | 'inbox' | 'unread' | 'read';

const TOOLBAR: Record<ToolbarAction, { testId: string; name: RegExp }> = {
  archive: { testId: 'toolbar:movetoarchive', name: /^move to archive$/i },
  trash: { testId: 'toolbar:movetotrash', name: /^move to trash$/i },
  inbox: { testId: 'toolbar:movetoinbox', name: /^move to inbox$/i },
  unread: { testId: 'toolbar:unread', name: /^mark as unread$/i },
  read: { testId: 'toolbar:read', name: /^mark as read$/i },
};

/** The mail application shell: folder lists, the message reader and the action toolbar. */
export class MailboxPage {
  readonly navigation: Navigation;
  readonly notification: Notification;

  constructor(private readonly page: Page) {
    this.navigation = new Navigation(page);
    this.notification = new Notification(page);
  }

  // ---------- navigation ----------

  async open(folder: FolderRef = Folder.Inbox): Promise<void> {
    await this.page.goto(`${environment.mailUrl}/u/0/${folder.slug}`, { waitUntil: 'domcontentloaded' });
    await this.navigation.expectMailboxReady();
  }

  async openFolder(folder: FolderRef): Promise<void> {
    await this.navigation.openFolder(folder);
  }

  isSignedIn(): Promise<boolean> {
    return this.navigation.composeButton.isVisible();
  }

  // ---------- message list ----------

  row(subject: string): MessageRow {
    return new MessageRow(this.page, subject);
  }

  /**
   * Eventual-consistency wait: re-opens the folder (which triggers Proton's event refresh)
   * until the row appears. Bounded by `timeout`; no fixed sleeps.
   */
  async waitForMessage(folder: FolderRef, subject: string, timeout = environment.timeouts.delivery): Promise<MessageRow> {
    const row = this.row(subject);
    await expect(async () => {
      await this.navigation.openFolder(folder);
      await row.expectVisible(5_000);
    }, `"${subject}" should arrive in ${folder.name}`).toPass({ timeout, intervals: [1_000, 2_000, 5_000, 10_000] });
    return row;
  }

  async expectInFolder(folder: FolderRef, subject: string): Promise<void> {
    await this.waitForMessage(folder, subject, environment.timeouts.action * 2);
  }

  async expectNotInFolder(folder: FolderRef, subject: string): Promise<void> {
    await this.navigation.openFolder(folder);
    await expect(MessageRow.all(this.page).first().or(this.emptyFolderMessage).first()).toBeVisible();
    await this.row(subject).expectAbsent();
  }

  private get emptyFolderMessage(): Locator {
    return this.page.getByText(/no messages found|folder is empty|no results found|nothing in/i).first();
  }

  get noResultsMessage(): Locator {
    return this.page.getByText(/no results found|no messages found/i).first();
  }

  // ---------- message reader ----------

  private get messageHeader(): Locator {
    return this.page
      .getByTestId('message-header-expanded')
      .or(this.page.locator('.message-header'))
      .first();
  }

  private get messageBodyFrame(): FrameLocator {
    return this.page.frameLocator('iframe[data-testid="content-iframe"], iframe[title*="email content" i]').first();
  }

  private get conversationSubject(): Locator {
    return this.page.getByTestId('conversation-header:subject').or(this.page.getByRole('heading', { level: 1 })).first();
  }

  async openMessage(subject: string): Promise<void> {
    await this.row(subject).open();
    await expect(this.conversationSubject).toContainText(subject);
  }

  /** Asserts what the recipient actually sees: subject, sender, body, attachments, header privacy. */
  async expectOpenedMessage(expected: ExpectedMessage): Promise<void> {
    await expect(this.conversationSubject, 'Subject').toContainText(expected.subject);
    if (expected.from) {
      await expect(this.messageHeader, 'Sender address').toContainText(expected.from, { ignoreCase: true });
    }
    if (expected.body) {
      await expect(this.messageBodyFrame.locator('body'), 'Body').toContainText(expected.body);
    }
    if (expected.attachmentName) {
      await expect(this.page.getByText(expected.attachmentName).first(), 'Attachment').toBeVisible();
    }
    for (const address of expected.visibleAddresses ?? []) {
      await expect(this.messageHeader, `Header should show ${address}`).toContainText(address, { ignoreCase: true });
    }
    for (const address of expected.hiddenAddresses ?? []) {
      await expect(this.messageHeader, `Header must not leak ${address}`).not.toContainText(address, { ignoreCase: true });
    }
  }

  // ---------- message actions (apply to the opened message) ----------

  private toolbarButton(action: ToolbarAction): Locator {
    const { testId, name } = TOOLBAR[action];
    return this.page.getByTestId(testId).or(this.page.getByRole('button', { name })).first();
  }

  async applyAction(action: ToolbarAction): Promise<void> {
    await this.toolbarButton(action).click();
  }

  // ---------- scheduled messages ----------

  /** Banner shown on a scheduled message, e.g. "This message will be sent on ...". */
  get scheduledBanner(): Locator {
    return this.page.getByText(/(will be|scheduled to be) sent (on|at|tomorrow)/i).first();
  }

  /** "Edit" on a scheduled message cancels the schedule and turns it back into a draft. */
  async editScheduledMessage(): Promise<void> {
    await this.page.getByRole('button', { name: /^edit$/i }).first().click();
    const confirm = this.page.getByRole('dialog').getByRole('button', { name: /^(edit|edit draft|edit and reschedule)$/i }).first();
    if (await confirm.isVisible().catch(() => false)) await confirm.click();
  }
}
