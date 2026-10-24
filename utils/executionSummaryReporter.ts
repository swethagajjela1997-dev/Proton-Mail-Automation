import * as fs from 'fs';
import * as path from 'path';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

const REPORTS = path.resolve(__dirname, '..', 'reports');

type Row = { id: string; title: string; project: string; status: string; durationMs: number; classification: string; detail: string };

/**
 * Failure classification used throughout the docs. Based on markers the framework itself
 * raises (BLOCKED / TEST-DATA ISSUE / AUTHENTICATION LIMITATION) plus well-known
 * browser network errors. Anything else needs human triage.
 */
function classify(status: string, message: string): string {
  if (status === 'passed') return '-';
  if (/BLOCKED \(environment\)|ERR_CERT|net::ERR_|ENOTFOUND|ECONNREFUSED/i.test(message)) return 'Environment issue';
  if (/BLOCKED \(test-data\)|TEST-DATA ISSUE/i.test(message)) return 'Test-data issue';
  if (/AUTHENTICATION LIMITATION/i.test(message)) return 'Authentication limitation';
  if (status === 'skipped') return 'Skipped';
  if (/Timeout|toBeVisible|waiting for/i.test(message)) return 'Needs triage (locator / synchronization / application)';
  return 'Needs triage';
}

function firstLine(text: string): string {
  // Strip ANSI colour codes so the summary is readable in plain Markdown.
  return text.replace(/\u001b\[[0-9;]*m/g, '').split('\n').find((line) => line.trim().length > 0)?.trim().slice(0, 220) ?? '';
}

/**
 * Writes reports/Final_Execution_Summary.md from the *actual* run and files evidence
 * (traces, videos, screenshots) into reports/traces, reports/videos, reports/screenshots
 * with test-friendly names. Nothing in the summary is hand-written.
 */
export default class ExecutionSummaryReporter implements Reporter {
  private readonly rows: Row[] = [];
  private startedAt = new Date();
  private browsers: string[] = [];

  onBegin(config: FullConfig, _suite: Suite): void {
    this.startedAt = new Date();
    this.browsers = config.projects.map((project) => project.name);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const message = [result.error?.message ?? '', ...test.annotations.filter((a) => a.type === 'skip').map((a) => a.description ?? '')].join(' ');
    const id = test.title.split(/\s+/)[0];
    this.rows.push({
      id,
      title: test.title,
      project: test.parent.project()?.name ?? '',
      status: result.status,
      durationMs: result.duration,
      classification: classify(result.status, message),
      detail: firstLine(message),
    });
    this.fileEvidence(id, result);
  }

  private fileEvidence(id: string, result: TestResult): void {
    const targets: Record<string, string> = { trace: 'traces', video: 'videos', 'receiver-video': 'videos' };
    for (const attachment of result.attachments) {
      const folder = targets[attachment.name];
      if (!folder || !attachment.path || !fs.existsSync(attachment.path)) continue;
      const destination = path.join(REPORTS, folder, `${id}-${attachment.name}-retry${result.retry}${path.extname(attachment.path)}`);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(attachment.path, destination);
    }
  }

  onEnd(result: FullResult): void {
    const count = (status: string) => this.rows.filter((row) => row.status === status).length;
    const total = this.rows.length;
    const passed = count('passed');
    const failed = count('failed') + count('timedOut') + count('interrupted');
    const skipped = count('skipped');
    const executed = total - skipped;
    const passRate = executed === 0 ? 'n/a (0 executed)' : `${((passed / executed) * 100).toFixed(1)}%`;
    // A run in which nothing executed must never read as "passed".
    const verdict =
      executed === 0 ? 'NOT EXECUTED - every test was blocked or skipped' : failed > 0 ? 'FAILED' : skipped > 0 ? 'PASSED WITH SKIPS' : 'PASSED';
    const durationS =((Date.now() - this.startedAt.getTime()) / 1000).toFixed(1);

    const lines = [
      '# Final Execution Summary',
      '',
      '> Generated automatically by `utils/executionSummaryReporter.ts` from the last `npx playwright test` run.',
      '',
      '| Item | Value |',
      '|---|---|',
      `| Execution date (UTC) | ${this.startedAt.toISOString()} |`,
      `| Verdict | ${verdict} |`,
      `| Playwright run status | ${result.status} |`,
      `| Browser project(s) | ${this.browsers.join(', ')} |`,
      `| Environment | ${process.env.MAIL_URL || 'https://mail.proton.me'} on ${process.platform} / Node ${process.version} |`,
      `| Total tests | ${total} |`,
      `| Passed | ${passed} |`,
      `| Failed | ${failed} |`,
      `| Skipped / blocked | ${skipped} |`,
      `| Pass rate (of executed) | ${passRate} |`,
      `| Duration | ${durationS} s |`,
      '',
      '## Results',
      '',
      '| ID | Test | Browser | Status | Duration | Classification | Detail |',
      '|---|---|---|---|---|---|---|',
      ...[...this.rows].sort((a, b) => a.id.localeCompare(b.id)).map((row) =>
        `| ${row.id} | ${row.title.replace(/\|/g, '/')} | ${row.project} | ${row.status} | ${(row.durationMs / 1000).toFixed(1)} s | ${row.classification} | ${row.detail.replace(/\|/g, '/')} |`,
      ),
      '',
      'Evidence: `reports/html/index.html` (HTML report), `reports/traces/`, `reports/videos/`, `reports/screenshots/`, `reports/logs/`.',
      '',
    ];
    fs.mkdirSync(REPORTS, { recursive: true });
    fs.writeFileSync(path.join(REPORTS, 'Final_Execution_Summary.md'), lines.join('\n'));
  }

  printsToStdio(): boolean {
    return false;
  }
}
