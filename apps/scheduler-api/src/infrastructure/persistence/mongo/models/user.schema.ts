import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchema & Document;

@Schema({ timestamps: true })
export class UserSchema {
  @Prop({ required: true, unique: true })
  ssuuid: string; // scheduler system user unique identifier

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // hashed with bcrypt

  @Prop({ required: true, enum: ['USER', 'ADMIN'], default: 'USER' })
  role: string;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: String, default: null })
  lastLoginIp: string | null;

  @Prop({ type: Date, default: null })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const UserSchemaFactory = SchemaFactory.createForClass(UserSchema);
