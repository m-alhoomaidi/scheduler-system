import { Injectable } from "@nestjs/common";
import { IdempotencyPort } from "@domain/ports/idempotency.port";
import { IdempotencyDocument } from "../models/idempotency.schema";
import { Model } from "mongoose";
import { IdempotencyEntity } from "@/domain/entities/idempotency.entity";

@Injectable()
export class IdempotencyRepository extends IdempotencyPort {
    constructor(private readonly idempotencyModel: Model<IdempotencyDocument>) {
        super();
    }

    toDomain(idempotency: IdempotencyDocument): IdempotencyEntity {
        return {
            requestId: idempotency.requestId,
            ssuuid: idempotency.ssuuid,
            method: idempotency.method,
            path: idempotency.path,
            body: idempotency.body,
            response: idempotency.response,
            createdAt: idempotency.createdAt,
        };
    }

    async create(idempotency: IdempotencyEntity): Promise<IdempotencyEntity> {
        const newIdempotency = new this.idempotencyModel(idempotency);
        return this.toDomain(await newIdempotency.save());
    }

    async findByRequestId(requestId: string): Promise<IdempotencyEntity | null> {
        const idempotency = await this.idempotencyModel.findOne({ requestId });
        return idempotency ? this.toDomain(idempotency) : null;
    }
}
