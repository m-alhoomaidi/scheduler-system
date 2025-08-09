import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiLogDocument = ApiLogSchema & Document;

@Schema({ timestamps: true })
export class ApiLogSchema {
  @Prop({ required: false })
  id?: string; // Optional business ID; Mongo _id is primary

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

  // createdAt/updatedAt come from timestamps option
}

export const ApiLogSchemaFactory = SchemaFactory.createForClass(ApiLogSchema);
