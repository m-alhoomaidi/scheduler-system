import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Document } from 'mongoose';

export type ApiLogDocument = ApiLogSchema & Document;

@Schema({ timestamps: true })
export class ApiLogSchema {
  @Prop({ required: false, default: () => randomUUID() })
  id?: string; // Optional business ID; ensure uniqueness with a UUID

  @Prop({ required: true })
  ssuuid: string; // scheduler system user unique identifier

  @Prop()
  method: string;

  @Prop()
  path: string;

  @Prop()
  statusCode: number;

  @Prop()
  ip?: string;

  @Prop()
  traceId?: string;

  @Prop({ type: Object })
  request: any;

  @Prop({ type: Object })
  response: any;

  @Prop()
  durationMs: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ApiLogSchemaFactory = SchemaFactory.createForClass(ApiLogSchema);
