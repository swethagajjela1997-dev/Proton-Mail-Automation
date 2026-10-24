import { expect } from '@playwright/test';
import { environment } from '@config/environment';
import type { ComposeDialog, EmailContent } from '@components/ComposeDialog';
import { Folder } from '@components/Navigation';
import type { MailUser } from '@fixtures/accountFixtures';
import type { ExpectedMessage } from '@pages/MailboxPage';
import { createLogger } from '@utils/logger';
import { TestData } from '@utils/testDataGenerator';

const log = createLogger('EmailWorkflow');

export interface OutgoingEmail extends EmailContent {
  attachment?: { path: string; name: string };
}

/** Compose → send → deliver → verify, across one or two mailboxes. */
export class EmailWorkflow {
  /** Opens a new composer and fills it in, without sending. */
  async compose(user: MailUser, email: OutgoingEmail): Promise<ComposeDialog> {
    const composer = await user.compose.openNew();
    await composer.fill(email);
    if (email.attachment) await composer.attachFile(email.attachment.path, email.attachment.name);
    return composer;
  }

  /** Sends and waits for Proton's own confirmation that the message left the outbox. */
  async send(user: MailUser, email: OutgoingEmail): Promise<void> {
    log.info(`${user.role} sends "${email.subject}"`);
    const composer = await this.compose(user, email);
    await composer.send();
    await this.expectSendConfirmed(user);
    await composer.expectClosed();
  }

  async expectSendConfirmed(user: MailUser): Promise<void> {
    await user.compose.notification.expectVisible(/message sent/i, environment.timeouts.navigation);
  }

  async expectInSent(user: MailUser, subject: string): Promise<void> {
    await user.mailbox.expectInFolder(Folder.Sent, subject);
  }

  /** Waits for eventual delivery, opens the message and verifies what the recipient sees. */
  async expectDelivered(receiver: MailUser, expected: ExpectedMessage): Promise<void> {
    log.info(`Waiting for "${expected.subject}" in ${receiver.role} inbox`);
    await receiver.mailbox.waitForMessage(Folder.Inbox, expected.subject);
    await receiver.mailbox.openMessage(expected.subject);
    await receiver.mailbox.expectOpenedMessage(expected);
  }

  /**
   * Test-data setup through the real UI: sender → receiver, then waits for delivery.
   * Returns the unique subject so the caller can act on exactly this message.
   */
  async seedReceivedMessage(sender: MailUser, receiver: MailUser, testId: string, subject = TestData.subject(testId)): Promise<string> {
    await this.send(sender, { to: [receiver.address], subject, body: TestData.body(testId) });
    await receiver.mailbox.waitForMessage(Folder.Inbox, subject);
    return subject;
  }

  /** Attempts to send and asserts Proton refuses: validation shown, composer still open, nothing sent. */
  async expectSendRejected(user: MailUser, validationText: RegExp): Promise<void> {
    await user.compose.dialog.sendButton.click();
    await expect(user.compose.validationError(validationText), `Validation ${validationText} expected`).toBeVisible();
    await user.compose.dismissValidationDialog();
    await user.compose.dialog.expectOpen();
    await user.compose.notification.expectNotVisible(/message sent/i);
  }
}
