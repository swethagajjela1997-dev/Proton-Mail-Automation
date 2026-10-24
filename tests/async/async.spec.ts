import { test, expect } from '@fixtures/testFixtures';
import { environment } from '@config/environment';
import { Folder } from '@components/Navigation';
import { TestData } from '@utils/testDataGenerator';

/**
 * Timing / state-dependent flows. Every wait is tied to an observable state
 * (toast visible, Undo offered, Undo gone, row listed) - never to a fixed sleep.
 */
test.describe('Asynchronous workflows', () => {
  test('ASYNC-001 Undo Send cancels delivery and restores the composer; a re-send completes after the undo window', { tag: ['@smoke', '@P1'] }, async ({ sender, email, cleanup }) => {
    const message = { to: [environment.accounts.receiver.username || sender.address], subject: TestData.subject('ASYNC-001'), body: TestData.body('ASYNC-001') };
    cleanup.trashMessage(sender, Folder.Sent, message.subject);
    const composer = await email.compose(sender, message);

    // Transient state: "Message sent" toast offering Undo.
    await composer.send();
    const undo = sender.compose.notification.undoButton();
    await expect(undo, 'Undo is offered during the undo-send window').toBeVisible({ timeout: environment.timeouts.navigation });
    await undo.click();

    // Undone: composer is back with the original content and nothing reached Sent.
    await composer.expectOpen();
    await composer.expectContent(message);
    await sender.mailbox.expectNotInFolder(Folder.Sent, message.subject);

    // Final state: send again and let the undo window expire.
    await composer.send();
    await expect(undo).toBeVisible({ timeout: environment.timeouts.navigation });
    await expect(undo, 'Undo window closes by itself').toBeHidden({ timeout: 60_000 });
    await email.expectInSent(sender, message.subject);
  });

  test('ASYNC-002 A scheduled message is listed in Scheduled and editing it cancels the schedule back to a draft', { tag: ['@P2'] }, async ({ sender, drafts, cleanup }) => {
    const message = { to: [sender.address], subject: TestData.subject('ASYNC-002'), body: TestData.body('ASYNC-002') };
    cleanup.register('delete ASYNC-002 draft', () => drafts.deleteIfPresent(sender, message.subject));
    const composer = await sender.compose.openNew();
    await composer.fill(message);

    await composer.scheduleForTomorrow();
    await sender.compose.notification.expectVisible(/scheduled/i, environment.timeouts.navigation);

    await sender.mailbox.expectInFolder(Folder.Scheduled, message.subject);
    await sender.mailbox.openMessage(message.subject);
    await expect(sender.mailbox.scheduledBanner, 'Scheduled state is shown on the message').toBeVisible();

    // Time-dependent delivery itself is not awaited (see docs); cancelling via Edit is.
    await sender.mailbox.editScheduledMessage();
    await composer.expectOpen();
    await composer.close();
    await sender.mailbox.expectNotInFolder(Folder.Scheduled, message.subject);
    await sender.drafts.expectDraftSaved(message.subject);
  });
});
