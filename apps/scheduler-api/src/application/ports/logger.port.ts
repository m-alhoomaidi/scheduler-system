export type TLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'alert' | 'audit';

export interface TLogMeta {
  [key: string]: unknown;
}

export abstract class LoggerPort {
  abstract debug(message: string, meta?: TLogMeta): void;
  abstract info(message: string, meta?: TLogMeta): void;
  abstract warn(message: string, meta?: TLogMeta): void;
  abstract log(message: string, meta?: TLogMeta): void;
  abstract error(message: string, meta?: TLogMeta & { err?: Error }): void;
  abstract alert(message: string, meta?: TLogMeta): void;
  abstract audit(action: string, meta?: TLogMeta & { actor?: string; subject?: string }): void;
  abstract child(context: TLogMeta): LoggerPort;
}


