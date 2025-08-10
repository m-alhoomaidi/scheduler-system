export interface ILogger {
  log(message: string, metadata?: unknown): void;
  debug(message: string, metadata?: unknown): void;
  error(error: unknown, metadata?: unknown): void;
  warn(message: string, metadata?: unknown): void;

  alert(message: string, metadata?: unknown): void;
  audit(message: string, metadata?: unknown): void;
} 