import * as path from 'path';
import testData from '../test-data/testData.json';
import { environment } from '@config/environment';

/** One id per `playwright test` invocation, shared by all workers (set in global setup). */
export const RUN_ID: string = process.env.PMA_RUN_ID ?? Date.now().toString(36);

/** Prefix that tags every message this suite creates, so test data is traceable and cleanable. */
export const RUN_TAG = `[PMA-${RUN_ID}]`;

function randomToken(length = 6): string {
  return Math.random().toString(36).slice(2, 2 + length).padEnd(length, '0');
}

/**
 * Generates unique, self-describing test data. Uniqueness is what keeps tests independent
 * of each other and of whatever else already lives in the shared mailbox.
 */
export const TestData = {
  /** e.g. "Automation Assessment [PMA-lq3x9k] COMP-001 7f2kq1" */
  subject(testId: string): string {
    return `${testData.subjectPrefix} ${RUN_TAG} ${testId} ${randomToken()}`;
  },

  /** A single alphanumeric word: safe for Proton's server-side (metadata) keyword search. */
  searchToken(): string {
    return `pmatok${randomToken(8)}`;
  },

  body(testId: string): string {
    return `${testData.bodyTemplate} Test: ${testId}. Reference: ${randomToken(10)}.`;
  },

  invalidRecipients: testData.invalidRecipients,

  invalidCredentials: testData.invalidCredentials,

  attachmentPath(): string {
    return path.join(environment.paths.testData, testData.attachmentFile);
  },

  attachmentName(): string {
    return testData.attachmentFile;
  },

  /** Proton supports plus-addressing: user+tag@domain is delivered to user@domain. */
  plusAlias(address: string, tag: string): string {
    const [local, domain] = address.split('@');
    return `${local}+${tag}@${domain}`;
  },
};
