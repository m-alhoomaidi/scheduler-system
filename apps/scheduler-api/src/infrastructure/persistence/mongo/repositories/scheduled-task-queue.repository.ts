import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {  DispatchScheduledTaskParams, EnqueueScheduledTaskParams, ScheduledTaskQueueRepositoryPort } from '@domain/ports';
import { ScheduledTaskQueue } from '@domain/entities';
import { ScheduledTaskQueueDocument } from '../models';
@Injectable()
export class ScheduledTaskQueueRepository extends ScheduledTaskQueueRepositoryPort {
  constructor(@InjectModel('ScheduledTaskQueue') private readonly scheduledTaskQueueModel: Model<ScheduledTaskQueueDocument>) {
    super();
  }

  private toDomain(doc: ScheduledTaskQueueDocument): ScheduledTaskQueue {
    return new ScheduledTaskQueue(
      doc.id,
      doc.ssuuid,
      doc.message,
      doc.idempotencyKey ?? null,
      doc.grpcResponse,
      doc.isDispatched,
      doc.dispatchedAt,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async enqueue(entry: EnqueueScheduledTaskParams): Promise<ScheduledTaskQueue> {
    const created = new this.scheduledTaskQueueModel(entry);
    const saved = await created.save();
    return this.toDomain(saved) ?? null;
  }

  async markDispatched(entry: DispatchScheduledTaskParams): Promise<void> {
    await this.scheduledTaskQueueModel.updateOne({ id: entry.id }, { $set: { isDispatched: true, dispatchedAt: entry.dispatchedAt } });
  }

  async findPending(limit?: number): Promise<ScheduledTaskQueue[]> {
    const docs = await this.scheduledTaskQueueModel.find({ isDispatched: false }).limit(limit ?? 10).lean();
    return docs.map(this.toDomain);
  }
}