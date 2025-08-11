import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { TaskEnginePort, TRegisterTaskInput, TRegisterTaskOutput } from '@/domain/ports/task-engine.port';


import {
  TaskEngineClient,           
  RegisterTaskRequest,
  RegisterTaskResponse,
  DeleteTaskRequest,
  DeleteTaskResponse,
  PingRequest,
  PingResponse,
} from './types/scheduler'; 

@Injectable()
export class TaskEngineGrpcClient implements TaskEnginePort, OnModuleInit {
  private svc!: TaskEngineClient;

  constructor(@Inject('TASK_ENGINE_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit() {
    // 'TaskEngine' must match the service name in .proto
    this.svc = this.client.getService<TaskEngineClient>('TaskEngine');
  }

  async registerTask(input: TRegisterTaskInput): Promise<TRegisterTaskOutput> {
    const req: RegisterTaskRequest = {
     
      ssuuid: input.ssuuid,
      message: input.message,
    };

    const res: RegisterTaskResponse = await lastValueFrom(this.svc.registerTask(req));

   
    const out: TRegisterTaskOutput = { taskId: res.taskId };
    return out;
  }

  async deleteTask(taskId: string): Promise<{ ok: boolean }> {
    const req: DeleteTaskRequest = { taskId };
    const res: DeleteTaskResponse = await lastValueFrom(this.svc.deleteTask(req));
    // proto has `deleted: boolean`; your domain expects `{ ok: boolean }`
    return { ok: res.deleted };
  }

  async ping(): Promise<{ message: string }> {
    const req: PingRequest = {};
    const res: PingResponse = await lastValueFrom(this.svc.ping(req));
    // proto has `status: string`; your domain expects `{ message: string }`
    return { message: res.status };
  }
}
