export class IdempotencyEntity {
    requestId: string;
    ssuuid: string;
    method: string;
    path: string;
    body: string;
    response: string;
    createdAt: Date;
}