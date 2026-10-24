import type { EmailContent } from '@components/ComposeDialog';
import { Folder } from '@components/Navigation';
import type { MailUser } from '@fixtures/accountFixtures';
import { createLogger } from '@utils/logger';

const log = createLogger('DraftWorkflow');

/** Draft lifecycle: create (auto-save) → reopen/edit → persist across reload → send or delete. */
export class DraftWorkflow {
  /** Types a message and closes the composer; Proton auto-saves it as a draft. */
  async createDraft(user: MailUser, content: EmailContent): Promise<void> {
    log.info(`${user.role} creates draft "${content.subject}"`);
    const composer = await user.compose.openNew();
    await composer.fill(content);
    await composer.close();
    await user.drafts.expectDraftSaved(content.subject);
  }

  /** Full page reload: proves the draft is stored server-side, not only in client memory. */
  async reloadMailbox(user: MailUser): Promise<void> {
    await user.page.reload({ waitUntil: 'domcontentloaded' });
    await user.mailbox.navigation.expectMailboxReady();
  }

  async deleteDraft(user: MailUser, subject: string): Promise<void> {
    const composer = await user.drafts.reopen(subject);
    await composer.deleteDraft();
    await user.drafts.expectDraftAbsent(subject);
  }

  /** Best-effort teardown helper: removes a draft if a failed test left it behind. */
  async deleteIfPresent(user: MailUser, subject: string): Promise<void> {
    await user.mailbox.openFolder(Folder.Drafts);
    if (await user.mailbox.row(subject).root.isVisible().catch(() => false)) await this.deleteDraft(user, subject);
  }
}
