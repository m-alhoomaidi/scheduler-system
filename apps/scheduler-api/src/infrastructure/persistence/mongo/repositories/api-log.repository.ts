import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiLogRepositoryPort, LogApiRequestParams   } from '@domain/ports';
import { ApiLog } from '@domain/entities';
import { ApiLogDocument } from '../models/api-log.schema';

@Injectable()
export class ApiLogRepository extends ApiLogRepositoryPort {
  constructor(@InjectModel('ApiLog') private readonly apiLogModel: Model<ApiLogDocument>) {
    super();
  }

  private toDomain(doc: ApiLogDocument): ApiLog {
    return new ApiLog(
      doc.id,
      doc.ssuuid,
      doc.method,
      doc.path,
      doc.statusCode,
      doc.ip ?? null,
      doc.traceId ?? null,
      doc.request,
      doc.response,
      doc.durationMs,
      doc.createdAt ?? new Date(),
      doc.updatedAt ?? new Date(),
    );
  } 

  async log(entry: LogApiRequestParams): Promise<ApiLog> {
    const created = new this.apiLogModel(entry);
    const saved = await created.save();
    return this.toDomain(saved) ?? null;
  }

  // TODO add pagination and smart search and filter
  async findBySSUUID(ssuuid: string, options?: { page?: number; limit?: number }): Promise<{ data: ApiLog[]; total: number }> {
    const { page = 1, limit = 10 } = options ?? {};
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.apiLogModel.find({ ssuuid }).skip(skip).limit(limit).lean(),
      this.apiLogModel.countDocuments({ ssuuid }),
    ]);
    return { data: data.map(this.toDomain), total };
  }

  async findPaginated(options?: { page?: number; limit?: number }): Promise<{ data: ApiLog[]; total: number }> {
    const { page = 1, limit = 10 } = options ?? {};
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.apiLogModel.find().skip(skip).limit(limit).lean(),
      this.apiLogModel.countDocuments(),
    ]);
    return { data: data.map(this.toDomain), total };
  }
}