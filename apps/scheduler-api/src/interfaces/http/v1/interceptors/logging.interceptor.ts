import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { ApiLogRepositoryPort } from '@/domain/ports';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';

function maskSensitive(
  obj: Record<string, unknown> | undefined,
  maxLen = 2048,
): Record<string, unknown> | undefined {
  try {
    const redactKeys = new Set([
      'password',
      'authorization',
      'token',
      'accessToken',
    ]);
    const replacer = (_key: string, value: any) => {
      if (typeof value === 'string' && value.length > 512)
        return value.slice(0, 512) + '…';
      return value;
    };
    const cloned = JSON.parse(JSON.stringify(obj ?? {}, replacer));
    const traverse = (o: any) => {
      if (!o || typeof o !== 'object') return;
      for (const k of Object.keys(o)) {
        if (redactKeys.has(k.toLowerCase())) o[k] = '***';
        else traverse(o[k]);
      }
    };
    traverse(cloned);
    const str = JSON.stringify(cloned);
    if (str.length > maxLen) return JSON.parse(str.slice(0, maxLen));
    return cloned;
  } catch {
    return undefined;
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly apiLogRepo: ApiLogRepositoryPort) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const res = context.switchToHttp().getResponse<Response>();
    const start = Date.now();

    const traceId = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('X-Request-Id', traceId);

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;

    const ssuuid = req.user?.ssuid || 'anonymous';
    const method = req.method;
    const path = req.originalUrl || req.url;
    const maskedReq = maskSensitive({
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    return next.handle().pipe(
      tap((body) => {
        const durationMs = Date.now() - start;
        const statusCode = res.statusCode;
        const maskedRes = maskSensitive(body as Record<string, unknown>);

        this.apiLogRepo
          .log({
            ssuuid,
            method,
            path,
            statusCode,
            ip,
            traceId: String(traceId),
            request: maskedReq,
            response: maskedRes,
            durationMs,
          })
          .catch((err) => {
            console.error('Failed to log API call', err);
          });
      }),
    );
  }
}
