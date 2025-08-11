import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class IdempotencyDto {
    @ApiProperty({ type: String })
    @IsUUID()
    @IsOptional()
    requestId: string;
}