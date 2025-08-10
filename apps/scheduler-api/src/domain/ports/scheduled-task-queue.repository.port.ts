import { ScheduledTaskQueue } from "../entities";

export type EnqueueScheduledTaskParams = {
  ssuuid: string;
  message: string;
  idempotencyKey?: string;
};

export type DispatchScheduledTaskParams={
    id: string,
    grpcResponse: any,
    dispatchedAt: Date,
}

export abstract class ScheduledTaskQueueRepositoryPort {
    abstract enqueue(data:  EnqueueScheduledTaskParams): Promise<ScheduledTaskQueue>;
  
    abstract markDispatched(data:DispatchScheduledTaskParams): Promise<void>;
  
    abstract findPending(limit?: number): Promise<ScheduledTaskQueue[]>;
  }