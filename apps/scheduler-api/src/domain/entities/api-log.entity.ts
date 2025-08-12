export class ApiLog {
  constructor(
    public readonly id: string, // DB ID
    public readonly ssuuid: string,
    public method: string,
    public path: string,
    public statusCode: number,
    public ip: string | null,
    public traceId: string | null,
    public request: any,
    public response: any,
    public durationMs: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
