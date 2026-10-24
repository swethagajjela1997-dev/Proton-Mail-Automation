import { test } from '@fixtures/testFixtures';
import { Folder } from '@components/Navigation';
import { TestData } from '@utils/testDataGenerator';

test.describe('Drafts & persistence', () => {
  test('DRAFT-001 An unsent message is auto-saved to Drafts and persists after a full page reload', { tag: ['@smoke', '@P1'] }, async ({ sender, drafts, cleanup }) => {
    const content = { subject: TestData.subject('DRAFT-001'), body: TestData.body('DRAFT-001') };
    cleanup.register('delete DRAFT-001 draft', () => drafts.deleteIfPresent(sender, content.subject));

    const composer = await sender.compose.openNew();
    await composer.fill(content);
    // The composer stays open: the draft must appear through auto-save alone.
    await sender.drafts.expectDraftSaved(content.subject);

    await drafts.reloadMailbox(sender);

    const reopened = await sender.drafts.reopen(content.subject);
    await reopened.expectContent(content);
  });

  test('DRAFT-002 A reopened draft keeps edits across reload and moves from Drafts to Sent when sent', { tag: ['@P1'] }, async ({ sender, drafts, email, cleanup }) => {
    const original = { to: [sender.address], subject: TestData.subject('DRAFT-002'), body: TestData.body('DRAFT-002') };
    const edit = ` EDITED-${TestData.searchToken()}`;
    cleanup.trashMessage(sender, Folder.Sent, original.subject);
    await drafts.createDraft(sender, original);

    const composer = await sender.drafts.reopen(original.subject);
    await composer.expectContent(original);
    await composer.appendToBody(edit);
    await composer.close();
    await drafts.reloadMailbox(sender);

    const edited = await sender.drafts.reopen(original.subject);
    await edited.expectContent({ subject: original.subject, body: edit.trim() });
    await edited.send();
    await email.expectSendConfirmed(sender);

    await sender.drafts.expectDraftAbsent(original.subject);
    await email.expectInSent(sender, original.subject);
  });

  test('DRAFT-003 Deleting a draft removes it permanently from Drafts', { tag: ['@P2'] }, async ({ sender, drafts }) => {
    const content = { subject: TestData.subject('DRAFT-003'), body: TestData.body('DRAFT-003') };
    await drafts.createDraft(sender, content);

    await drafts.deleteDraft(sender, content.subject);

    await drafts.reloadMailbox(sender);
    await sender.drafts.expectDraftAbsent(content.subject);
  });
});
