import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';
import { environment } from '@config/environment';

export interface EmailContent {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
}

/**
 * The composer window. Owns every composer locator so specs and workflows never touch
 * Proton's DOM directly. The body editor lives inside an iframe (Roosterjs).
 */
export class ComposeDialog {
  readonly root: Locator;
  readonly subjectInput: Locator;
  readonly sendButton: Locator;
  private readonly editorFrame: FrameLocator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId('composer').or(page.locator('div.composer')).first();
    this.subjectInput = this.root
      .getByTestId('composer:subject')
      .or(this.root.getByPlaceholder('Subject'))
      .first();
    this.sendButton = this.root
      .getByTestId('composer:send-button')
      .or(this.root.getByRole('button', { name: /^send$/i }))
      .first();
    this.editorFrame = this.root
      .frameLocator('iframe[data-testid="rooster-iframe"], iframe[title*="composer" i]')
      .first();
  }

  // ---------- locators ----------

  private recipientInput(field: 'To' | 'CC' | 'BCC'): Locator {
    const testId = { To: 'composer:to', CC: 'composer:to-cc', BCC: 'composer:to-bcc' }[field];
    return this.root.getByTestId(testId).or(this.root.getByLabel(field, { exact: true })).first();
  }

  private revealButton(field: 'CC' | 'BCC'): Locator {
    return this.root
      .getByTestId(`composer:recipients:${field.toLowerCase()}-button`)
      .or(this.root.getByRole('button', { name: field === 'CC' ? /^(cc|carbon copy)$/i : /^(bcc|blind carbon copy)$/i }))
      .first();
  }

  get editor(): Locator {
    return this.editorFrame.locator('#rooster-editor, [contenteditable="true"]').first();
  }

  private get attachmentInput(): Locator {
    return this.root.locator('input[type="file"]').first();
  }

  attachment(fileName: string): Locator {
    return this.root.getByText(fileName, { exact: false }).first();
  }

  private get closeButton(): Locator {
    return this.root
      .getByTestId('composer:close-button')
      .or(this.root.getByRole('button', { name: /^close/i }))
      .first();
  }

  private get deleteDraftButton(): Locator {
    return this.root
      .getByTestId('composer:delete-draft-button')
      .or(this.root.getByRole('button', { name: /delete draft|discard/i }))
      .first();
  }

  private get scheduleDropdownButton(): Locator {
    return this.root
      .getByTestId('composer:scheduled-send:open-dropdown')
      .or(this.root.getByRole('button', { name: /schedule|open actions dropdown|more sending options/i }))
      .first();
  }

  // ---------- actions ----------

  async expectOpen(): Promise<void> {
    await expect(this.root, 'Composer should be open').toBeVisible();
    await expect(this.subjectInput).toBeEditable();
  }

  async expectClosed(): Promise<void> {
    await expect(this.root, 'Composer should be closed').toBeHidden();
  }

  async addRecipients(field: 'To' | 'CC' | 'BCC', addresses: string[]): Promise<void> {
    if (addresses.length === 0) return;
    if (field !== 'To' && !(await this.recipientInput(field).isVisible())) {
      await this.revealButton(field).click();
    }
    const input = this.recipientInput(field);
    for (const address of addresses) {
      await input.fill(address);
      // Enter converts the typed text into a recipient "chip".
      await input.press('Enter');
      await expect(this.root.getByText(address, { exact: false }).first()).toBeVisible();
    }
  }

  async setSubject(subject: string): Promise<void> {
    await this.subjectInput.fill(subject);
    await expect(this.subjectInput).toHaveValue(subject);
  }

  /** Replaces the whole body (including the default signature) with `body`. */
  async setBody(body: string): Promise<void> {
    await this.editor.click();
    await this.editor.fill(body);
    await expect(this.editor).toContainText(body);
  }

  async appendToBody(text: string): Promise<void> {
    await this.editor.click();
    await this.editor.press('Control+End');
    await this.editor.pressSequentially(text);
    await expect(this.editor).toContainText(text);
  }

  async fill(content: EmailContent): Promise<void> {
    await this.addRecipients('To', content.to ?? []);
    await this.addRecipients('CC', content.cc ?? []);
    await this.addRecipients('BCC', content.bcc ?? []);
    await this.setSubject(content.subject);
    await this.setBody(content.body);
  }

  /** Uploads a file and waits until Proton has finished encrypting/uploading it. */
  async attachFile(filePath: string, fileName: string): Promise<void> {
    await this.attachmentInput.setInputFiles(filePath);
    await expect(this.attachment(fileName), `Attachment "${fileName}" should be listed`).toBeVisible({
      timeout: environment.timeouts.navigation,
    });
    await expect(this.root.getByRole('progressbar')).toHaveCount(0, { timeout: environment.timeouts.navigation });
  }

  async send(): Promise<void> {
    await expect(this.sendButton).toBeEnabled();
    await this.sendButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.expectClosed();
  }

  async deleteDraft(): Promise<void> {
    await this.deleteDraftButton.click();
    const confirm = this.page.getByRole('dialog').getByRole('button', { name: /^(delete|discard)$/i });
    if (await confirm.isVisible().catch(() => false)) await confirm.click();
    await this.expectClosed();
  }

  /** Opens the send-later menu and picks the first "Tomorrow ..." preset. */
  async scheduleForTomorrow(): Promise<void> {
    await this.scheduleDropdownButton.click();
    await this.page.getByRole('button', { name: /^tomorrow/i }).or(this.page.getByRole('menuitem', { name: /^tomorrow/i })).first().click();
  }

  async expectContent(content: Pick<EmailContent, 'subject' | 'body'>): Promise<void> {
    await expect(this.subjectInput).toHaveValue(content.subject);
    await expect(this.editor).toContainText(content.body);
  }
}
