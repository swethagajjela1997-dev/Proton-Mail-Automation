import type { FolderRef } from '@components/Navigation';
import type { MailUser } from '@fixtures/accountFixtures';
import { createLogger } from '@utils/logger';

const log = createLogger('CleanupWorkflow');

type CleanupTask = { description: string; run: () => Promise<void> };

/**
 * Collects teardown actions while a test runs and executes them afterwards in reverse order,
 * even when the test failed. Each task is best-effort: a cleanup problem is logged, never
 * allowed to hide the real test result.
 */
export class CleanupWorkflow {
  private readonly tasks: CleanupTask[] = [];

  register(description: string, run: () => Promise<void>): void {
    this.tasks.push({ description, run });
  }

  async runAll(): Promise<void> {
    for (const task of this.tasks.reverse()) {
      try {
        await task.run();
        log.info(`Cleanup done: ${task.description}`);
      } catch (error) {
        log.warn(`Cleanup failed (non-fatal): ${task.description} - ${(error as Error).message.split('\n')[0]}`);
      }
    }
    this.tasks.length = 0;
  }

  /** Registers "move this message to Trash" so test messages do not accumulate in the mailbox. */
  trashMessage(user: MailUser, folder: FolderRef, subject: string): void {
    this.register(`trash "${subject}" in ${user.role} ${folder.name}`, async () => {
      await user.mailbox.openFolder(folder);
      await user.mailbox.openMessage(subject);
      await user.mailbox.applyAction('trash');
    });
  }
}
