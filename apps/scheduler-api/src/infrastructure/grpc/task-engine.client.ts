import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { TaskEnginePort, TRegisterTaskInput, TRegisterTaskOutput } from '@/domain/ports/task-engine.port';

interface GrpcTaskEngine {
  RegisterTask(req: TRegisterTaskInput): any;
  DeleteTask(req: { taskId: string }): any;
  Ping(req: {}): any;
}

@Injectable()
export class TaskEngineGrpcClient implements TaskEnginePort, OnModuleInit {
  private svc!: GrpcTaskEngine;
  constructor(@Inject('TASK_ENGINE_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.svc = this.client.getService<GrpcTaskEngine>('TaskEngine');
  }

  async registerTask(input: TRegisterTaskInput): Promise<TRegisterTaskOutput> {
    const res = await lastValueFrom(this.svc.RegisterTask(input));
    return res as TRegisterTaskOutput;
  }

  async deleteTask(taskId: string): Promise<{ ok: boolean }> {
    const res = await lastValueFrom(this.svc.DeleteTask({ taskId }));
    return res as { ok: boolean };
  }

  async ping(): Promise<{ message: string }> {
    const res = await lastValueFrom(this.svc.Ping({}));
    return res as { message: string };
  }
}


