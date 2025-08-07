import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ScheduledTaskQueueDocument = ScheduledTaskQueueSchema & Document;

@Schema({ timestamps: true })
export class ScheduledTaskQueueSchema {
  @Prop({ required: true, unique: true })
  id: string; // DB ID

  @Prop({ required: true })
  ssuuid: string; // scheduler system user unique identifier

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, default: null })
  idempotencyKey?: string;

  @Prop({ type: Object })
  grpcResponse?: any;

  @Prop({ default: false })
  isDispatched: boolean;

  @Prop({ type: Date, default: null })
  dispatchedAt: Date;

  @Prop({ type: Date, default: new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: new Date() })
  updatedAt: Date;
}

export const ScheduledTaskQueueSchemaFactory = SchemaFactory.createForClass(ScheduledTaskQueueSchema);