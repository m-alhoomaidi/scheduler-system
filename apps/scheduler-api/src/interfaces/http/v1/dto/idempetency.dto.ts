import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class IdempotencyDto {
    @ApiProperty({ type: String,
        example:'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11. '
     })
    @IsUUID()
    @IsOptional()
    requestId: string;
}