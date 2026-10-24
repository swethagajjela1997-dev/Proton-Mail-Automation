import { expect, type Locator, type Page } from '@playwright/test';
import { SettingsPage } from './SettingsPage';

export interface SubjectFilterRule {
  name: string;
  /** Messages whose subject contains this text match the rule. */
  subjectContains: string;
  /** System folder the matching messages are moved to, e.g. "Archive". */
  moveTo: string;
}

/** Settings > Filters: list of custom filters and the multi-step "Add filter" modal. */
export class FilterPage {
  private readonly settings: SettingsPage;

  constructor(private readonly page: Page) {
    this.settings = new SettingsPage(page);
  }

  private get addFilterButton(): Locator {
    return this.page.getByRole('button', { name: /^add filter$/i });
  }

  private get modal(): Locator {
    return this.page.getByRole('dialog').last();
  }

  private filterRow(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name }).or(this.page.locator('li').filter({ hasText: name })).first();
  }

  async open(): Promise<void> {
    await this.settings.open('filters');
    await expect(this.addFilterButton).toBeVisible();
  }

  private async next(): Promise<void> {
    await this.modal.getByRole('button', { name: /^next$/i }).click();
  }

  async createSubjectFilter(rule: SubjectFilterRule): Promise<void> {
    await this.addFilterButton.click();
    await expect(this.modal).toBeVisible();

    // Step 1 - name
    await this.modal.getByLabel(/^name$/i).or(this.modal.getByPlaceholder(/name/i)).first().fill(rule.name);
    await this.next();

    // Step 2 - condition: "The subject" "contains" <text>  (subject/contains are Proton's defaults)
    const conditionInput = this.modal.getByPlaceholder(/type text or keyword|keyword/i).first();
    await conditionInput.fill(rule.subjectContains);
    await conditionInput.press('Enter');
    await expect(this.modal.getByText(rule.subjectContains).first()).toBeVisible();
    await this.next();

    // Step 3 - action: move to folder
    await this.modal.getByRole('button', { name: /move to|select a folder|do not move/i }).or(this.modal.getByLabel(/move to/i)).first().click();
    await this.page.getByRole('option', { name: rule.moveTo, exact: true }).or(this.page.getByRole('button', { name: rule.moveTo, exact: true })).first().click();
    await this.next();

    // Step 4 - preview & save
    await this.modal.getByRole('button', { name: /^save$/i }).click();
    await expect(this.modal).toBeHidden();
    await this.expectFilterListed(rule.name, true);
  }

  async expectFilterListed(name: string, enabled?: boolean): Promise<void> {
    const row = this.filterRow(name);
    await expect(row, `Filter "${name}" should be listed`).toBeVisible();
    if (enabled !== undefined) {
      const toggle = row.getByRole('checkbox').or(row.getByRole('switch')).first();
      await (enabled ? expect(toggle).toBeChecked() : expect(toggle).not.toBeChecked());
    }
  }

  async expectFilterAbsent(name: string): Promise<void> {
    await expect(this.filterRow(name)).toHaveCount(0);
  }

  /** Names of listed filters that match `pattern` - used to clean up leftovers of aborted runs. */
  async listedFilterNames(pattern: RegExp): Promise<string[]> {
    const texts = await this.page.getByRole('row').or(this.page.locator('li')).allInnerTexts();
    return texts.map((text) => text.split('\n')[0].trim()).filter((text) => pattern.test(text));
  }

  async deleteFilter(name: string): Promise<void> {
    const row = this.filterRow(name);
    await row.getByRole('button', { name: /^(edit|more|open actions|actions)/i }).last().click();
    await this.page.getByRole('button', { name: /^delete$/i }).first().click();
    await this.modal.getByRole('button', { name: /^delete$/i }).click();
    await this.expectFilterAbsent(name);
  }
}
