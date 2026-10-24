import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

export interface AccountCredentials {
  /** Logical role used in logs and storage-state file names. Never the real address. */
  readonly role: 'sender' | 'receiver';
  readonly username: string;
  readonly password: string;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  return raw === undefined || raw === '' ? fallback : raw.toLowerCase() === 'true';
}

function readNumber(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function readBrowsers(): BrowserName[] {
  const value = (process.env.BROWSER ?? 'chromium').toLowerCase();
  if (value === 'all') return ['chromium', 'firefox', 'webkit'];
  if (value === 'chromium' || value === 'firefox' || value === 'webkit') return [value];
  throw new Error(`Unsupported BROWSER "${value}". Use chromium | firefox | webkit | all.`);
}

/** Single source of truth for runtime configuration. Everything is overridable via env vars. */
export const environment = {
  baseUrl: process.env.BASE_URL || 'https://proton.me/mail',
  mailUrl: process.env.MAIL_URL || 'https://mail.proton.me',
  accountUrl: process.env.ACCOUNT_URL || 'https://account.proton.me',
  browsers: readBrowsers(),
  headless: readBoolean('HEADLESS', true),
  skipPreflight: readBoolean('SKIP_PREFLIGHT', false),
  logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase(),
  isCI: readBoolean('CI', false),

  timeouts: {
    /** Single UI action / assertion. */
    action: 15_000,
    /** Page navigation and app boot (Proton decrypts the mailbox client-side). */
    navigation: 60_000,
    /** Cross-account delivery is eventually consistent. */
    delivery: readNumber('DELIVERY_TIMEOUT_MS', 120_000),
    /** Whole test, including two-account flows. */
    test: 240_000,
  },

  accounts: {
    sender: {
      role: 'sender',
      username: process.env.PROTON_USERNAME ?? '',
      password: process.env.PROTON_PASSWORD ?? '',
    } as AccountCredentials,
    receiver: {
      role: 'receiver',
      username: process.env.PROTON_RECEIVER_USERNAME ?? '',
      password: process.env.PROTON_RECEIVER_PASSWORD ?? '',
    } as AccountCredentials,
  },

  paths: {
    root: path.resolve(__dirname, '..'),
    reports: path.resolve(__dirname, '..', 'reports'),
    authState: path.resolve(__dirname, '..', '.auth'),
    testData: path.resolve(__dirname, '..', 'test-data'),
  },
};

export function hasCredentials(account: AccountCredentials): boolean {
  return account.username.length > 0 && account.password.length > 0;
}
