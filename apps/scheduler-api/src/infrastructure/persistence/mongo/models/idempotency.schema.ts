import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IdempotencyDocument = Idempotency & Document;

@Schema({ timestamps: true })
export class Idempotency {
    @Prop({ required: true })
    requestId: string;

    @Prop({ required: true })
    ssuuid: string;

    @Prop({ required: true })
    method: string;

    @Prop({ required: true })
    path: string;

    @Prop({ required: true })
    body: string;

    @Prop({ required: true })
    response: string;

    @Prop({ required: true })
    createdAt: Date;
    
}

export const IdempotencySchemaFactory = SchemaFactory.createForClass(Idempotency);