import { test } from '@fixtures/testFixtures';
import { Folder } from '@components/Navigation';

/** Message actions are exercised on a freshly delivered message in the receiver's mailbox. */
test.describe('Inbox & message actions', () => {
  test('INBOX-001 A new message is unread, becomes read when opened and can be marked unread again', { tag: ['@P1', '@two-account'] }, async ({ sender, receiver, email, cleanup }) => {
    const subject = await email.seedReceivedMessage(sender, receiver, 'INBOX-001');
    cleanup.trashMessage(receiver, Folder.Inbox, subject);
    const row = receiver.mailbox.row(subject);
    await row.expectUnread();

    await receiver.mailbox.openMessage(subject);
    await row.expectRead();

    await receiver.mailbox.applyAction('unread');
    await row.expectUnread();
  });

  test('INBOX-002 Starring a message lists it in Starred and unstarring removes it', { tag: ['@P1', '@two-account'] }, async ({ sender, receiver, email, cleanup }) => {
    const subject = await email.seedReceivedMessage(sender, receiver, 'INBOX-002');
    cleanup.trashMessage(receiver, Folder.Inbox, subject);

    await receiver.mailbox.row(subject).toggleStar();
    await receiver.mailbox.expectInFolder(Folder.Starred, subject);

    await receiver.mailbox.row(subject).toggleStar();
    await receiver.mailbox.expectNotInFolder(Folder.Starred, subject);
  });

  test('INBOX-003 A message moves Inbox -> Archive -> Trash and is restored to Inbox', { tag: ['@smoke', '@P1', '@two-account'] }, async ({ sender, receiver, email, cleanup }) => {
    const subject = await email.seedReceivedMessage(sender, receiver, 'INBOX-003');
    cleanup.trashMessage(receiver, Folder.Inbox, subject);
    const mailbox = receiver.mailbox;

    await mailbox.openMessage(subject);
    await mailbox.applyAction('archive');
    await mailbox.expectNotInFolder(Folder.Inbox, subject);
    await mailbox.expectInFolder(Folder.Archive, subject);

    await mailbox.openMessage(subject);
    await mailbox.applyAction('trash');
    await mailbox.expectNotInFolder(Folder.Archive, subject);
    await mailbox.expectInFolder(Folder.Trash, subject);

    await mailbox.openMessage(subject);
    await mailbox.applyAction('inbox');
    await mailbox.expectNotInFolder(Folder.Trash, subject);
    await mailbox.expectInFolder(Folder.Inbox, subject);
  });
});
