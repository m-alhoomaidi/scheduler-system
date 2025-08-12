export class IdempotencyEntity {
   constructor(
    public readonly requestId: string,
    public readonly ssuuid: string,
    public readonly method: string,
    public readonly path: string,
    public readonly body: string,
    public readonly response: string,
    public readonly createdAt: Date=new Date(),
   ) {}
}