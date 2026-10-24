import { test } from '@fixtures/testFixtures';
import { Folder } from '@components/Navigation';
import { FILTER_NAME_PREFIX } from '@workflows/FilterWorkflow';
import { RUN_TAG, TestData } from '@utils/testDataGenerator';

test.describe('Filters', () => {
  test('FILTER-001 A subject filter moves matching mail to Archive and leaves non-matching mail in Inbox', { tag: ['@P1', '@two-account'] }, async ({ sender, receiver, email, filters, cleanup }) => {
    const token = TestData.searchToken();
    const rule = { name: `${FILTER_NAME_PREFIX} ${RUN_TAG} ${token}`, subjectContains: token, moveTo: Folder.Archive.name };
    const matching = `${TestData.subject('FILTER-001')} ${token}`;
    const nonMatching = TestData.subject('FILTER-001');

    await filters.createSubjectFilter(receiver, rule);
    cleanup.register(`delete filter "${rule.name}"`, () => filters.deleteFilter(receiver, rule.name));
    cleanup.trashMessage(receiver, Folder.Archive, matching);
    cleanup.trashMessage(receiver, Folder.Inbox, nonMatching);

    await email.send(sender, { to: [receiver.address], subject: matching, body: TestData.body('FILTER-001') });
    await email.send(sender, { to: [receiver.address], subject: nonMatching, body: TestData.body('FILTER-001') });

    await receiver.mailbox.waitForMessage(Folder.Inbox, nonMatching);
    await receiver.mailbox.waitForMessage(Folder.Archive, matching);
    await receiver.mailbox.expectNotInFolder(Folder.Inbox, matching);
  });
});
