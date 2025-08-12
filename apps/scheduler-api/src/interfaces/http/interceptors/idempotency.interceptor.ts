import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Request } from 'express';
import { LoggerPort } from '@/application/ports/logger.port';
import { IdempotencyPort } from '@/domain/ports/idempotency.port';
import { IdempotencyEntity } from '@/domain/entities/idempotency.entity';


@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    constructor(
        private readonly idempotencyRepo: IdempotencyPort,
        private readonly logger: LoggerPort
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest<Request>();

        this.logger.debug('start idemptoncy')

        // ---------- skip GET/HEAD/OPTIONS or @SkipIdempotency -------------
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next.handle();
        }

        

        // ---------- idempotency key ----------
        const key = req.body?.requestId;
        this.logger.debug('requestId', key)
        if (!key) return next.handle();

        // ---------- 1) check cache, maybe short‑circuit ----------
        return from(this.idempotencyRepo.findByRequestId(key)).pipe(
                    switchMap((idempotency) => {
                        this.logger.debug('find',{idempotency})
                if (idempotency) {
                    this.logger.log(`Idempotency hit for ${key}`, {
                        meta: {
                            idempotencyKey: key,
                            method: req.method,
                            path: req.path,
                        }
                    });
                    return of(idempotency.response); // ← immediately return cached body
                }

                return next.handle().pipe(
                    tap(async (data) => {
                        this.logger.debug('Idempotency created')
                        const ssuuid = (req as any).user?.ssuuid ?? 'anonymous';
                        const record = new  IdempotencyEntity(
                            key,
                            ssuuid,
                            req.method,
                            req.path,
                            req.body,   
                            data,
                            
                        );
                        try {
                            await this.idempotencyRepo.create(record);
                            this.logger.debug('Idempotency created')
                        } catch (err) {
                            this.logger.error(
                                `Failed to store idempotent response: ${err.message}`,
                                err.stack,
                            );
                        }
                    }),
                );
            }),
        );
    }
}
