import { expect, type Locator, type Page } from '@playwright/test';
import { environment } from '@config/environment';

/** System folders and their URL slugs in the Proton Mail web client (/u/<n>/<slug>). */
export const Folder = {
  Inbox: { name: 'Inbox', slug: 'inbox' },
  Drafts: { name: 'Drafts', slug: 'drafts' },
  Sent: { name: 'Sent', slug: 'sent' },
  Starred: { name: 'Starred', slug: 'starred' },
  Archive: { name: 'Archive', slug: 'archive' },
  Trash: { name: 'Trash', slug: 'trash' },
  Scheduled: { name: 'Scheduled', slug: 'scheduled' },
  AllMail: { name: 'All mail', slug: 'all-mail' },
} as const;

export type FolderRef = (typeof Folder)[keyof typeof Folder];

/** Left sidebar + header account menu: everything used to move around the mail app. */
export class Navigation {
  readonly composeButton: Locator;
  private readonly userMenuButton: Locator;
  private readonly signOutButton: Locator;

  constructor(private readonly page: Page) {
    this.composeButton = page
      .getByTestId('sidebar:compose')
      .or(page.getByRole('button', { name: /^new message$|^compose$/i }))
      .first();
    this.userMenuButton = page
      .getByTestId('heading:userdropdown')
      .or(page.getByRole('button', { name: /open user menu|account menu/i }))
      .first();
    this.signOutButton = page
      .getByTestId('userdropdown:button:logout')
      .or(page.getByRole('button', { name: /^sign out$/i }))
      .first();
  }

  folderLink(folder: FolderRef): Locator {
    return this.page
      .getByTestId(`navigation-link:${folder.slug}`)
      .or(this.page.getByRole('link', { name: new RegExp(`^${folder.name}\\b`, 'i') }))
      .first();
  }

  /**
   * Opens a folder via the sidebar. Clicking the *current* folder also asks Proton's event
   * manager for fresh data, which is how delivery polling avoids full page reloads.
   */
  async openFolder(folder: FolderRef): Promise<void> {
    await this.folderLink(folder).click();
    await this.page.waitForURL(new RegExp(`/u/\\d+/${folder.slug}(?:[/?#]|$)`), {
      timeout: environment.timeouts.navigation,
    });
  }

  async expectMailboxReady(): Promise<void> {
    await expect(this.composeButton, 'Mail app should finish booting').toBeVisible({
      timeout: environment.timeouts.navigation,
    });
  }

  async signOut(): Promise<void> {
    await this.userMenuButton.click();
    await this.signOutButton.click();
  }
}
