import * as https from 'https';
import { environment, hasCredentials } from '@config/environment';

export type PreflightStatus = 'READY' | 'UNREACHABLE' | 'NOT_CHECKED';

export interface PreflightResult {
  status: PreflightStatus;
  detail: string;
  senderConfigured: boolean;
  receiverConfigured: boolean;
  checkedAt: string;
}

/** Text of generic "access blocked" pages returned instead of the real application. */
const BLOCK_PAGE_SIGNATURE = /URL you requested has been blocked|Web Page Blocked|Access Denied by policy/i;

/**
 * Verifies that Proton Mail can actually be reached before 20 UI tests time out one by one
 * (no route, untrusted TLS certificate, or a block page served instead of the app), and
 * records whether credentials are configured. It never works around a failed check.
 */
export async function runPreflight(): Promise<PreflightResult> {
  const base = {
    senderConfigured: hasCredentials(environment.accounts.sender),
    receiverConfigured: hasCredentials(environment.accounts.receiver),
    checkedAt: new Date().toISOString(),
  };
  const target = `${environment.accountUrl}/login`;
  const unreachable = (reason: string): PreflightResult => ({
    ...base,
    status: 'UNREACHABLE',
    detail: `Proton Mail is not reachable from this machine (${reason}).`,
  });

  return new Promise((resolve) => {
    const request = https.get(target, { timeout: 20_000 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk: string) => {
        if (body.length < 20_000) body += chunk;
      });
      response.on('end', () => {
        resolve(
          BLOCK_PAGE_SIGNATURE.test(body)
            ? unreachable(`access-blocked page returned, HTTP ${response.statusCode}`)
            : { ...base, status: 'READY', detail: `${target} reachable (HTTP ${response.statusCode}).` },
        );
      });
    });
    request.on('timeout', () => request.destroy(new Error('timeout after 20s')));
    request.on('error', (error: NodeJS.ErrnoException) => resolve(unreachable(error.code ?? error.message)));
  });
}
