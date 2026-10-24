import { test } from '@fixtures/testFixtures';
import { Folder } from '@components/Navigation';
import { TestData } from '@utils/testDataGenerator';

test.describe('Attachments', () => {
  test('ATT-001 An attached file is uploaded, sent and received with the same file name', { tag: ['@smoke', '@P1', '@two-account'] }, async ({ sender, receiver, email, cleanup }) => {
    const attachment = { path: TestData.attachmentPath(), name: TestData.attachmentName() };
    const message = { to: [receiver.address], subject: TestData.subject('ATT-001'), body: TestData.body('ATT-001'), attachment };
    cleanup.trashMessage(receiver, Folder.Inbox, message.subject);

    // compose() uploads the file and waits until the composer lists it as fully uploaded.
    await email.send(sender, message);

    await email.expectInSent(sender, message.subject);
    await email.expectDelivered(receiver, { subject: message.subject, from: sender.address, attachmentName: attachment.name });
  });
});
