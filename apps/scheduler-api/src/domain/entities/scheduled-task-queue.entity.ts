export class ScheduledTaskQueue {
  constructor(
    public readonly id: string, // DB ID
    public readonly ssuuid: string,
    public message: string,
    public grpcResponse: Record<string, unknown> | null,
    public isDispatched: boolean,
    public dispatchedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
