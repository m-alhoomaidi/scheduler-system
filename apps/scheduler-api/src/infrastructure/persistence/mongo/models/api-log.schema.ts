import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiLogDocument = ApiLogSchema & Document;

@Schema({ timestamps: true })
export class ApiLogSchema {
  @Prop({ required: true, unique: true })
  id: string; // DB ID

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

  @Prop({ type: Date, default: new Date() })
  createdAt: Date;

  // TODO fix this to be updated only when the document is updated

  @Prop({ type: Date, default: new Date() })
  updatedAt: Date;
}

export const ApiLogSchemaFactory = SchemaFactory.createForClass(ApiLogSchema);
