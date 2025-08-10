import { DynamicModule, Global, Module, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { LoggerModuleOptions } from './interfaces/logger-options.interface';
import { LoggerPort } from '@/application/ports/logger.port';
import { LoggerProvider } from './logger.provider';
import { LoggerNestAdapter } from './logger.adapter';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options?: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      global: true,
      providers: [
        { provide: 'LOGGER_OPTIONS', useValue: options ?? {} },
        LoggerProvider,
        { 
          provide: LoggerPort, 
          useFactory: (p: LoggerProvider, parentClass: object) => {
            const context = parentClass?.constructor?.name || 'App';
            return new LoggerNestAdapter(p, { context });
          }, 
          inject: [LoggerProvider, INQUIRER], 
          scope: Scope.TRANSIENT 
        },
      ],
      exports: [LoggerPort],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: LoggerModule,
      global: true,
      providers: [
        {
          provide: 'LOGGER_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        LoggerProvider,
        { 
          provide: LoggerPort, 
          useFactory: (p: LoggerProvider, parentClass: object) => {
            const context = parentClass?.constructor?.name || 'App';
            return new LoggerNestAdapter(p, { context });
          }, 
          inject: [LoggerProvider, INQUIRER], 
          scope: Scope.TRANSIENT 
        },
      ],
      exports: [LoggerPort],
    };
  }
}
