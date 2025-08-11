import { IdempotencyEntity } from "../entities/idempotency.entity";

export abstract class IdempotencyPort {
    abstract create(idempotency: IdempotencyEntity): Promise<IdempotencyEntity>;
    abstract findByRequestId(requestId: string): Promise<IdempotencyEntity | null>;
    }