import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ScheduledTaskQueueDocument = ScheduledTaskQueueSchema & Document;

@Schema({ timestamps: true })
export class ScheduledTaskQueueSchema {
  @Prop({ required: false })
  id?: string; // Optional business ID

  @Prop({ required: true })
  ssuuid: string; // scheduler system user unique identifier

  @Prop({ required: true })
  message: string;

 

  @Prop({ type: Object })
  grpcResponse?: any;

  @Prop({ default: false })
  isDispatched: boolean;

  @Prop({ type: Date, default: null })
  dispatchedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ScheduledTaskQueueSchemaFactory = SchemaFactory.createForClass(ScheduledTaskQueueSchema);