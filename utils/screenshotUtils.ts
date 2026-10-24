import * as fs from 'fs';
import * as path from 'path';
import type { Page, TestInfo } from '@playwright/test';
import { environment } from '@config/environment';
import { mask } from './logger';

const screenshotDir = path.join(environment.paths.reports, 'screenshots');

function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 120);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
}

/** True when no application page was rendered (blank tab or browser network-error page). */
function noApplicationPage(page: Page): boolean {
  const url = page.url();
  return url === 'about:blank' || url.startsWith('chrome-error://') || url === '';
}

/**
 * When a test fails before any application page loaded, a plain screenshot is just a blank
 * image. Instead, render a clearly labelled failure card (test, status, masked error, time)
 * so the screenshot still explains the failure. It never imitates an application page.
 */
async function renderFailureCard(page: Page, testInfo: TestInfo): Promise<void> {
  const error = mask((testInfo.error?.message ?? 'No error message').replace(/\u001b\[[0-9;]*m/g, '')).slice(0, 1500);
  await page.setContent(`
    <html><body style="font-family:Segoe UI,Arial,sans-serif;background:#f6f7f9;margin:0;padding:40px;color:#1f2a44">
      <div style="max-width:1100px;margin:auto;background:#fff;border-left:8px solid #c62828;border-radius:6px;padding:28px 32px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <div style="font-size:13px;letter-spacing:.08em;color:#c62828;font-weight:700">TEST FAILURE EVIDENCE - NO APPLICATION PAGE WAS LOADED</div>
        <h1 style="font-size:22px;margin:12px 0 4px">${escapeHtml(testInfo.title)}</h1>
        <div style="color:#5b6478;font-size:14px">${escapeHtml(path.relative(environment.paths.root, testInfo.file))} &middot; ${escapeHtml(testInfo.project.name)} &middot; status: ${escapeHtml(String(testInfo.status))} &middot; ${new Date().toISOString()}</div>
        <div style="margin-top:12px;font-size:14px">Last URL: <code>${escapeHtml(page.url())}</code></div>
        <pre style="white-space:pre-wrap;background:#1f2a44;color:#f3f4f6;padding:16px;border-radius:4px;font-size:13px;margin-top:16px">${escapeHtml(error)}</pre>
        <div style="color:#5b6478;font-size:13px">Full details: trace and video attached to this test in the HTML / Allure report.</div>
      </div>
    </body></html>`);
}

/**
 * Captures a named full-page screenshot into reports/screenshots and attaches it to the
 * HTML and Allure reports. Used for failure evidence and for checkpoints in long flows.
 */
export async function captureEvidence(page: Page, testInfo: TestInfo, label: string): Promise<void> {
  if (page.isClosed()) return;
  fs.mkdirSync(screenshotDir, { recursive: true });
  const testName = safeFileName(testInfo.titlePath.slice(1).join('-'));
  const file = path.join(screenshotDir, `${testName}-${safeFileName(label)}-retry${testInfo.retry}.png`);
  try {
    if (noApplicationPage(page)) await renderFailureCard(page, testInfo);
    await page.screenshot({ path: file, fullPage: true, timeout: 10_000 });
    await testInfo.attach(label, { path: file, contentType: 'image/png' });
  } catch {
    // Evidence capture is best-effort and must never mask the original failure.
  }
}
