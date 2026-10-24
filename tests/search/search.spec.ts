import { test, expect } from '@fixtures/testFixtures';
import { Folder } from '@components/Navigation';
import { TestData } from '@utils/testDataGenerator';

/**
 * Search uses a unique token in the subject so the expected result set is exact,
 * regardless of what else is in the mailbox.
 */
test.describe('Search', () => {
  test('SEARCH-001 Keyword search returns exactly the matching message and clearing restores the folder view', { tag: ['@smoke', '@P1', '@two-account'] }, async ({ sender, receiver, email, search, cleanup }) => {
    const token = TestData.searchToken();
    const subject = await email.seedReceivedMessage(sender, receiver, 'SEARCH-001', `${TestData.subject('SEARCH-001')} ${token}`);
    cleanup.trashMessage(receiver, Folder.Inbox, subject);

    await search.searchAndExpect(receiver, token, [subject]);

    await receiver.search.clear();
    await expect(receiver.page).not.toHaveURL(/keyword=/);
    await receiver.mailbox.expectInFolder(Folder.Inbox, subject);
  });

  test('SEARCH-002 Advanced search combining keyword and sender returns only messages matching both', { tag: ['@P1', '@two-account'] }, async ({ sender, receiver, email, search, cleanup }) => {
    const token = TestData.searchToken();
    // Two messages share the keyword but come from different senders.
    const fromSender = await email.seedReceivedMessage(sender, receiver, 'SEARCH-002', `${TestData.subject('SEARCH-002')} ${token} A`);
    const fromSelf = `${TestData.subject('SEARCH-002')} ${token} B`;
    await email.send(receiver, { to: [receiver.address], subject: fromSelf, body: TestData.body('SEARCH-002') });
    await receiver.mailbox.waitForMessage(Folder.Inbox, fromSelf);
    cleanup.trashMessage(receiver, Folder.Inbox, fromSender);
    cleanup.trashMessage(receiver, Folder.Inbox, fromSelf);

    await search.advancedSearchAndExpect(receiver, { keyword: token, from: sender.address }, [fromSender]);

    // Negative: same keyword, sender that never wrote -> no results.
    await search.advancedSearchAndExpect(receiver, { keyword: token, from: 'nobody.pma.000@proton.me' }, []);
  });
});
