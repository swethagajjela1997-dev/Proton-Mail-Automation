import * as fs from 'fs';
import * as path from 'path';
import type { FullConfig } from '@playwright/test';
import { environment } from './environment';
import { runPreflight, type PreflightResult } from '../utils/environmentValidator';
import { createLogger } from '../utils/logger';

const log = createLogger('globalSetup');

/**
 * Runs once before all workers:
 *  1. assigns one RUN_ID shared by every worker (unique, traceable test data),
 *  2. checks network reachability and credentials and records the result. The check is
 *     informational: every test still runs and is reported as passed or failed.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  process.env.PMA_RUN_ID = process.env.PMA_RUN_ID ?? Date.now().toString(36);
  fs.mkdirSync(environment.paths.reports, { recursive: true });
  // Fresh Allure results per run (trend history is carried over by scripts/run-with-allure.mjs).
  fs.rmSync(path.join(environment.paths.reports, 'allure-results'), { recursive: true, force: true });

  const preflight: PreflightResult = environment.skipPreflight
    ? {
        status: 'NOT_CHECKED',
        detail: 'SKIP_PREFLIGHT=true',
        senderConfigured: false,
        receiverConfigured: false,
        checkedAt: new Date().toISOString(),
      }
    : await runPreflight();

  fs.writeFileSync(path.join(environment.paths.reports, 'preflight.json'), JSON.stringify(preflight, null, 2));

  log.info(`Run ${process.env.PMA_RUN_ID} | browsers=${environment.browsers.join(',')} | headless=${environment.headless}`);
  log.info(`Preflight: ${preflight.status} - ${preflight.detail}`);
  log.info(`Accounts configured: sender=${preflight.senderConfigured} receiver=${preflight.receiverConfigured}`);
  if (preflight.status !== 'READY' && !environment.skipPreflight) {
    log.warn('Proton Mail is not reachable from this machine. All tests still run; expect environment failures.');
  }
}
