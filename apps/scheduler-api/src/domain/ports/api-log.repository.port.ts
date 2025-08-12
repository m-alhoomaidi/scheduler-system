import { ApiLog } from '../entities';

export type LogApiRequestParams = {
  ssuuid: string;
  method: string;
  path: string;
  statusCode: number;
  ip?: string;
  traceId?: string;
  request: any;
  response: any;
  durationMs: number;
};

export abstract class ApiLogRepositoryPort {
  abstract log(entry: LogApiRequestParams): Promise<ApiLog>;

  abstract findPaginated(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: ApiLog[]; total: number }>;

  abstract findBySSUUID(
    ssuuid: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: ApiLog[]; total: number }>;
}
