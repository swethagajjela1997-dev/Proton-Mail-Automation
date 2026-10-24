import { defineConfig, devices } from '@playwright/test';
import { environment } from './config/environment';

const DEVICE_BY_BROWSER = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
} as const;

/**
 * Proton Mail regression suite configuration.
 * All environment-specific values come from config/environment.ts (.env driven).
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './reports/test-results',
  globalSetup: './config/globalSetup.ts',

  timeout: environment.timeouts.test,
  expect: { timeout: environment.timeouts.action },

  // Tests share two real mailboxes; isolation comes from unique data, not from ordering.
  fullyParallel: true,
  workers: Number(process.env.WORKERS) || (environment.isCI ? 1 : 2),
  forbidOnly: environment.isCI,
  // One retry in CI only, to absorb infrastructure noise. Retried passes are reported as
  // "flaky" in the HTML report, so they stay visible instead of being silently masked.
  retries: environment.isCI ? 1 : 0,

  reporter: [
    ['list'],
    ['html', { outputFolder: './reports/html', open: 'never' }],
    ['json', { outputFile: './reports/results.json' }],
    ['./utils/executionSummaryReporter.ts'],
    [
      'allure-playwright',
      {
        resultsDir: './reports/allure-results',
        detail: true,
        suiteTitle: true,
        // Same failure classification as reports/Final_Execution_Summary.md.
        categories: [
          { name: 'Environment issue', messageRegex: '(?s).*(net::ERR_|ENOTFOUND|ECONNREFUSED|ERR_CERT).*' },
          { name: 'Test-data issue', messageRegex: '(?s).*TEST-DATA ISSUE.*' },
          { name: 'Authentication limitation', messageRegex: '(?s).*AUTHENTICATION LIMITATION.*' },
          { name: 'Locator / synchronization / application (needs triage)', messageRegex: '(?s).*(Timeout|waiting for|toBeVisible|toHaveURL).*', matchedStatuses: ['failed', 'broken'] },
        ],
        environmentInfo: {
          Application: environment.mailUrl,
          Browsers: environment.browsers.join(', '),
          Headless: String(environment.headless),
          OS: `${process.platform} ${process.arch}`,
          Node: process.version,
        },
      },
    ],
  ],

  use: {
    baseURL: environment.mailUrl,
    headless: environment.headless,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'UTC',
    actionTimeout: environment.timeouts.action,
    navigationTimeout: environment.timeouts.navigation,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  projects: environment.browsers.map((browser) => ({
    name: browser,
    use: { ...DEVICE_BY_BROWSER[browser], viewport: { width: 1440, height: 900 } },
  })),
});
