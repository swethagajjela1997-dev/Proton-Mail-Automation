import type { MailUser } from '@fixtures/accountFixtures';
import type { SubjectFilterRule } from '@pages/FilterPage';
import { createLogger } from '@utils/logger';

const log = createLogger('FilterWorkflow');

/** Name prefix of every filter this suite creates - used to find leftovers of aborted runs. */
export const FILTER_NAME_PREFIX = 'PMA filter';

export class FilterWorkflow {
  /**
   * Creates a subject-based filter. Leftover suite filters are removed first, because the
   * free plan allows only one custom filter and a stale one would break isolation.
   */
  async createSubjectFilter(user: MailUser, rule: SubjectFilterRule): Promise<void> {
    await user.filters.open();
    for (const stale of await user.filters.listedFilterNames(new RegExp(`^${FILTER_NAME_PREFIX}`))) {
      log.warn(`Removing stale filter "${stale}" from a previous run`);
      await user.filters.deleteFilter(stale);
    }
    log.info(`${user.role} creates filter "${rule.name}" (subject contains "${rule.subjectContains}" -> ${rule.moveTo})`);
    await user.filters.createSubjectFilter(rule);
  }

  async deleteFilter(user: MailUser, name: string): Promise<void> {
    await user.filters.open();
    await user.filters.deleteFilter(name);
  }
}
