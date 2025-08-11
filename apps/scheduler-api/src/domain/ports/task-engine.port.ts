export type TRegisterTaskInput = { ssuuid: string; message: string; };
export type TRegisterTaskOutput = { taskId: string };

export abstract class TaskEnginePort {
  abstract registerTask(input: TRegisterTaskInput): Promise<TRegisterTaskOutput>;
  abstract deleteTask(taskId: string): Promise<{ ok: boolean }>;
  abstract ping(): Promise<{ message: string }>;
}


