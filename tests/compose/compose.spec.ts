import { test } from '@fixtures/testFixtures';
import { Folder } from '@components/Navigation';
import { TestData } from '@utils/testDataGenerator';

test.describe('Compose & send', () => {
  test('COMP-001 Email sent by account A is delivered to account B with correct sender, subject and body', { tag: ['@smoke', '@P0', '@two-account'] }, async ({ sender, receiver, email, cleanup }) => {
    const message = { to: [receiver.address], subject: TestData.subject('COMP-001'), body: TestData.body('COMP-001') };
    cleanup.trashMessage(receiver, Folder.Inbox, message.subject);

    await email.send(sender, message);

    await email.expectInSent(sender, message.subject);
    await email.expectDelivered(receiver, { subject: message.subject, from: sender.address, body: message.body });
  });

  const invalidRecipientCases = [
    { id: 'COMP-002a', label: 'a malformed recipient address', to: [TestData.invalidRecipients[0]], error: /invalid|not valid|isn.t a valid/i },
    { id: 'COMP-002b', label: 'no recipient at all', to: [] as string[], error: /recipient/i },
  ];

  for (const scenario of invalidRecipientCases) {
    test(`${scenario.id} Sending is blocked for ${scenario.label}`, { tag: ['@P1', '@negative'] }, async ({ sender, email }) => {
      const composer = await email.compose(sender, { to: scenario.to, subject: TestData.subject(scenario.id), body: TestData.body(scenario.id) });

      await email.expectSendRejected(sender, scenario.error);

      await composer.deleteDraft();
    });
  }

  test('COMP-003 CC recipient is visible to the receiver while the BCC recipient stays hidden', { tag: ['@P1', '@two-account'] }, async ({ sender, receiver, email, cleanup }) => {
    const bccAlias = TestData.plusAlias(sender.address, 'bcc');
    const message = {
      to: [receiver.address],
      cc: [sender.address],
      bcc: [bccAlias],
      subject: TestData.subject('COMP-003'),
      body: TestData.body('COMP-003'),
    };
    cleanup.trashMessage(receiver, Folder.Inbox, message.subject);

    await email.send(sender, message);

    await email.expectDelivered(receiver, {
      subject: message.subject,
      from: sender.address,
      visibleAddresses: [sender.address],
      hiddenAddresses: [bccAlias],
    });
  });
});
