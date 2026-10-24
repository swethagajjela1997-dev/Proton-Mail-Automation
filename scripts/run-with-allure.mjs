/**
 * Runs the Playwright suite and ALWAYS builds the Allure report afterwards, even when tests
 * fail, then exits with the test run's exit code.
 *
 * Usage: npm run test:allure [-- <extra playwright args>]   e.g. npm run test:allure -- --grep @smoke
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = path.join(root, 'reports', 'allure-results');
const reportDir = path.join(root, 'reports', 'allure-report');
const run = (args) => spawnSync('npx', args, { cwd: root, stdio: 'inherit', shell: true }).status ?? 1;

const testExitCode = run(['playwright', 'test', ...process.argv.slice(2)]);

// Carry the previous report's history into the new results so Allure shows trends across runs.
const previousHistory = path.join(reportDir, 'history');
if (fs.existsSync(previousHistory) && fs.existsSync(resultsDir)) {
  fs.cpSync(previousHistory, path.join(resultsDir, 'history'), { recursive: true });
}

const reportExitCode = run(['allure', 'generate', 'reports/allure-results', '--clean', '-o', 'reports/allure-report']);
console.log(
  reportExitCode === 0
    ? '\nAllure report: reports/allure-report/index.html  (view with: npm run allure:open)'
    : '\nAllure report generation failed - check that Java 8+ is installed and on PATH.',
);
process.exit(testExitCode || reportExitCode);
