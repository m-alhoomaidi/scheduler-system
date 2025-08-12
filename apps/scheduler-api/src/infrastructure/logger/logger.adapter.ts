import { LoggerPort, TLogMeta } from '@/application/ports/logger.port';
import { LoggerProvider } from './logger.provider';

export class LoggerNestAdapter implements LoggerPort {
  constructor(
    private readonly provider: LoggerProvider,
    private readonly contextMeta?: TLogMeta,
  ) {}

  private mergeContext(meta?: TLogMeta): TLogMeta | undefined {
    if (!this.contextMeta && !meta) return undefined;
    if (!this.contextMeta) return meta;
    if (!meta) return this.contextMeta;
    return meta;
  }

  private getContextName(): string {
    // Extract context from metadata or use default
    if (this.contextMeta?.context) {
      if (typeof this.contextMeta.context === 'string') {
        return this.contextMeta.context;
      }
      const ctx = this.contextMeta.context as any;
      return ctx.module || ctx.name || 'App';
    }
    return 'App';
  }

  debug(message: string, meta?: TLogMeta): void {
    this.provider.setContext(this.getContextName());
    this.provider.debug(message, this.mergeContext(meta));
  }

  info(message: string, meta?: TLogMeta): void {
    this.provider.setContext(this.getContextName());
    this.provider.log(message, this.mergeContext(meta));
  }

  log(message: string, meta?: TLogMeta): void {
    this.provider.setContext(this.getContextName());
    this.provider.log(message, this.mergeContext(meta));
  }

  warn(message: string, meta?: TLogMeta): void {
    this.provider.setContext(this.getContextName());
    this.provider.warn(message, this.mergeContext(meta));
  }

  error(message: string, meta?: TLogMeta & { err?: Error }): void {
    this.provider.setContext(this.getContextName());
    const { err, ...restMeta } = meta || {};

    if (err instanceof Error) {
      // Pass the Error object directly to leverage native error formatting
      this.provider.error(
        err,
        this.mergeContext({
          ...restMeta,
          originalMessage: message,
          errorMessage: err.message,
          stack: err.stack,
        }),
      );
    } else {
      this.provider.error(message, this.mergeContext(meta));
    }
  }

  alert(message: string, meta?: TLogMeta): void {
    this.provider.setContext(this.getContextName());
    this.provider.alert(message, this.mergeContext(meta));
  }

  audit(
    action: string,
    meta?: TLogMeta & { actor?: string; subject?: string },
  ): void {
    this.provider.setContext(this.getContextName());
    this.provider.audit(action, this.mergeContext(meta));
  }

  child(context: TLogMeta): LoggerPort {
    return new LoggerNestAdapter(this.provider, this.mergeContext(context));
  }
}
