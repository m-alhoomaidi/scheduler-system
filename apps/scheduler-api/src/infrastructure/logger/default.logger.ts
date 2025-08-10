import { Logger } from "@nestjs/common";
import { ILogger } from "./interfaces/logger.interface";

export class DefaultLogger extends Logger implements ILogger {
  private defaultMetadata: Record<string, any> = {};

  constructor(context?: string, defaultMetadata?: Record<string, any>) {
    super(context || 'App');
    this.defaultMetadata = defaultMetadata || {};
  }

  debug(message: string, metadata?: unknown): void {
    const meta = this.buildMetadata(metadata);
    if (meta) {
      return super.debug(message, meta);
    }
    return super.debug(message);
  }

  log(message: string | any, metadata?: unknown): void {
    const meta = this.buildMetadata(metadata);
    if (meta) {
      return super.log(message, meta);
    }
    return super.log(message);
  }

  warn(message: string | any, metadata?: unknown): void {
    const meta = this.buildMetadata(metadata);
    if (meta) {
      return super.warn(message, meta);
    }
    return super.warn(message);
  }

  error(error: unknown, metadata?: unknown): void {
    const meta = this.buildMetadata(metadata);
    if (meta) {
      return super.error(error, meta);
    }
    return super.error(error);
  }

  alert(message: string, metadata?: unknown): void {
    const meta = this.buildMetadata(metadata);
    const alertMessage = `🚨 ALERT: ${message}`;
    if (meta) {
      return super.error(alertMessage, meta);
    }
    return super.error(alertMessage);
  }

  audit(message: string, metadata?: unknown): void {
    const meta = this.buildMetadata(metadata);
    const auditMessage = `📋 AUDIT: ${message}`;
    if (meta) {
      return super.log(auditMessage, meta);
    }
    return super.log(auditMessage);
  }

  setMetadata(metadata: Record<string, any>): void {
    this.defaultMetadata = metadata;
  }

  private buildMetadata(metadata?: unknown): unknown {
    if (!metadata && Object.keys(this.defaultMetadata).length === 0) {
      return null;
    }

    if (typeof metadata === 'object' && metadata !== null) {
      return { ...this.defaultMetadata, ...metadata };
    }

    if (metadata !== undefined) {
      return { ...this.defaultMetadata, data: metadata };
    }

    return Object.keys(this.defaultMetadata).length > 0 ? this.defaultMetadata : null;
  }
}