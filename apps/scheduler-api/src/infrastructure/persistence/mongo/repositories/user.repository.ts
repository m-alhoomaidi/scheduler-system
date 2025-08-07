// src/infrastructure/persistence/mongo/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLastLoginParams, UserRepositoryPort } from '@domain/ports';
import { User } from '@domain/entities';
import { UserDocument } from '../models/user.schema';

@Injectable()
export class UserRepository extends UserRepositoryPort {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {
    super();
  }

  private toDomain(doc: UserDocument): User {
    return new User(
      doc.ssuuid,
      doc.username,
      doc.password,
      doc.role as User['role'],
      doc.lastLoginAt,
      doc.lastLoginIp,
      doc.createdAt,
      doc.updatedAt,
      doc.deletedAt,
    );
  }

  async create(userData: {
    ssuuid: string;
    username: string;
    password: string;
    role: User['role'];
  }): Promise<User> {
    const created = new this.userModel(userData);
    const saved = await created.save();
    return this.toDomain(saved) ?? null;
  }

  async findBySSUUID(ssuuid: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ ssuuid, deletedAt: null });
    return doc ? this.toDomain(doc) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ username, deletedAt: null });
    return doc ? this.toDomain(doc) : null;
  }

  async softDelete(ssuuid: string, deletedAt: Date): Promise<void> {
    await this.userModel.updateOne({ ssuuid }, { deletedAt });
  }

  async updateLastLogin(userData: UpdateLastLoginParams): Promise<User | null> {
    const updated = await this.userModel.findOneAndUpdate({ ssuuid: userData.ssuuid }, userData, { new: true });
    if (!updated) return null;
    if (!updated.toObject()) return null;
    return this.toDomain(updated.toObject());
  }
}
