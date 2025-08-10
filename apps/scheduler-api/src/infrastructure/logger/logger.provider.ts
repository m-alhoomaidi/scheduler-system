import { Injectable, Inject, Optional } from "@nestjs/common";
import { INQUIRER } from "@nestjs/core";
import { ILogger } from "./interfaces/logger.interface";
import { DefaultLogger } from "./default.logger";

@Injectable()
export class LoggerProvider extends DefaultLogger implements ILogger {
  constructor(
    @Optional() @Inject(INQUIRER) parentClass: object,
    @Optional() @Inject('LOGGER_OPTIONS') options?: any
  ) {
    const context = parentClass?.constructor?.name || "App";
    const defaultMetadata = options?.defaultMetadata;
    super(context, defaultMetadata);
  }

  setContext(context: string) {
    this.context = context;
  }

  getContext(): string {
    return this.context || 'App';
  }
}
