import { expect, type Locator, type Page } from '@playwright/test';

export interface SearchCriteria {
  keyword: string;
  from?: string;
  /** Folder name as shown in the "Search in" select, e.g. "Inbox". */
  folder?: string;
}

/**
 * Header search bar and its advanced-search panel.
 * Proton reflects the active query in the URL hash (e.g. #keyword=...), which gives a
 * deterministic state to assert on in addition to the rendered results.
 */
export class SearchControls {
  readonly keywordInput: Locator;
  private readonly advancedToggle: Locator;
  private readonly clearButton: Locator;

  constructor(private readonly page: Page) {
    this.keywordInput = page
      .getByTestId('search-keyword')
      .or(page.getByPlaceholder(/search messages/i))
      .or(page.getByRole('searchbox'))
      .first();
    this.advancedToggle = page
      .getByTestId('advanced-search:toggle')
      .or(page.getByRole('button', { name: /advanced search|search options/i }))
      .first();
    this.clearButton = page
      .getByTestId('search:clear')
      .or(page.getByRole('button', { name: /clear search|^clear$|reset/i }))
      .first();
  }

  private get advancedPanel(): Locator {
    return this.page.getByTestId('advanced-search').or(this.page.locator('form').filter({ has: this.keywordInput })).first();
  }

  async searchKeyword(keyword: string): Promise<void> {
    await this.keywordInput.click();
    await this.keywordInput.fill(keyword);
    await this.keywordInput.press('Enter');
    await this.expectQueryInUrl(keyword);
  }

  async advancedSearch(criteria: SearchCriteria): Promise<void> {
    await this.keywordInput.click();
    if (!(await this.page.getByLabel(/^(from|sender)$/i).first().isVisible().catch(() => false))) {
      await this.advancedToggle.click();
    }
    await this.keywordInput.fill(criteria.keyword);
    if (criteria.from) {
      const from = this.advancedPanel.getByLabel(/^(from|sender)$/i).first();
      await from.fill(criteria.from);
      await from.press('Enter');
    }
    if (criteria.folder) {
      await this.advancedPanel.getByLabel(/search in|folder|location/i).first().click();
      await this.page.getByRole('option', { name: criteria.folder, exact: true }).click();
    }
    await this.advancedPanel.getByRole('button', { name: /^search$/i }).click();
    await this.expectQueryInUrl(criteria.keyword);
  }

  async clear(): Promise<void> {
    await this.clearButton.click();
    await expect(this.page).not.toHaveURL(/keyword=/);
  }

  private async expectQueryInUrl(keyword: string): Promise<void> {
    await expect(this.page, 'Search query should be reflected in the URL').toHaveURL(
      new RegExp(`keyword=${encodeURIComponent(keyword)}`),
    );
  }
}
