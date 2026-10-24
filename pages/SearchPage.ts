import { expect, type Page } from '@playwright/test';
import { MessageRow } from '@components/MessageRow';
import { SearchControls, type SearchCriteria } from '@components/SearchControls';
import { MailboxPage } from './MailboxPage';

/** Search results view: the same message list, scoped by the active query. */
export class SearchPage {
  readonly controls: SearchControls;
  private readonly mailbox: MailboxPage;

  constructor(private readonly page: Page) {
    this.controls = new SearchControls(page);
    this.mailbox = new MailboxPage(page);
  }

  async search(keyword: string): Promise<void> {
    await this.controls.searchKeyword(keyword);
  }

  async advancedSearch(criteria: SearchCriteria): Promise<void> {
    await this.controls.advancedSearch(criteria);
  }

  /** Exactly these subjects (and nothing else) are returned. */
  async expectExactResults(subjects: string[]): Promise<void> {
    for (const subject of subjects) await this.mailbox.row(subject).expectVisible();
    await expect(MessageRow.all(this.page), 'Unexpected extra search results').toHaveCount(subjects.length);
  }

  async expectNoResults(): Promise<void> {
    await expect(this.mailbox.noResultsMessage).toBeVisible();
    await expect(MessageRow.all(this.page)).toHaveCount(0);
  }

  async clear(): Promise<void> {
    await this.controls.clear();
  }
}
