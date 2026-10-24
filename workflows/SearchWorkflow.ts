import type { SearchCriteria } from '@components/SearchControls';
import type { MailUser } from '@fixtures/accountFixtures';
import { createLogger } from '@utils/logger';

const log = createLogger('SearchWorkflow');

/**
 * Search flows. Proton's server-side search indexes message metadata (subject, addresses),
 * so test data puts unique search tokens in the subject; body search would need the
 * optional client-side content index, which is deliberately out of scope.
 */
export class SearchWorkflow {
  async searchAndExpect(user: MailUser, keyword: string, expectedSubjects: string[]): Promise<void> {
    log.info(`${user.role} searches "${keyword}" expecting ${expectedSubjects.length} result(s)`);
    await user.search.search(keyword);
    await this.expectResults(user, expectedSubjects);
  }

  async advancedSearchAndExpect(user: MailUser, criteria: SearchCriteria, expectedSubjects: string[]): Promise<void> {
    log.info(`${user.role} advanced search ${JSON.stringify(criteria)}`);
    await user.search.advancedSearch(criteria);
    await this.expectResults(user, expectedSubjects);
  }

  private async expectResults(user: MailUser, expectedSubjects: string[]): Promise<void> {
    if (expectedSubjects.length === 0) await user.search.expectNoResults();
    else await user.search.expectExactResults(expectedSubjects);
  }
}
