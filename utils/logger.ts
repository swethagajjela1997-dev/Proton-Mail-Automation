import * as fs from 'fs';
import * as path from 'path';
import { environment } from '@config/environment';

type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const logDir = path.join(environment.paths.reports, 'logs');
const logFile = path.join(logDir, `execution-${new Date().toISOString().slice(0, 10)}.log`);

/** Values that must never reach a log line, report or attachment. */
function secrets(): string[] {
  const { sender, receiver } = environment.accounts;
  return [sender.password, receiver.password].filter((secret) => secret.length > 0);
}

/** Masks passwords entirely and the local part of e-mail addresses (qa.user@proton.me -> q***@proton.me). */
export function mask(message: string): string {
  let result = message;
  for (const secret of secrets()) result = result.split(secret).join('********');
  return result.replace(/\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g, '$1***@$2');
}

/**
 * Minimal structured logger: console + daily file in reports/logs.
 * Dependency-free on purpose; every line is masked before it is written anywhere.
 */
export class Logger {
  constructor(private readonly scope: string) {}

  debug(message: string): void {
    this.write('debug', message);
  }

  info(message: string): void {
    this.write('info', message);
  }

  warn(message: string): void {
    this.write('warn', message);
  }

  error(message: string): void {
    this.write('error', message);
  }

  private write(level: Level, message: string): void {
    const threshold = LEVEL_ORDER[environment.logLevel as Level] ?? LEVEL_ORDER.info;
    if (LEVEL_ORDER[level] < threshold) return;
    const line = `${new Date().toISOString()} [${level.toUpperCase().padEnd(5)}] [${this.scope}] ${mask(message)}`;
    console.log(line);
    try {
      fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(logFile, `${line}\n`);
    } catch {
      // Logging must never fail a test.
    }
  }
}

export const createLogger = (scope: string): Logger => new Logger(scope);
