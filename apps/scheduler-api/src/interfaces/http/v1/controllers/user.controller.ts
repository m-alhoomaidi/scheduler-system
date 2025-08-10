import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "../dto/create-user.dto";

@ApiTags('users')
@Controller('users')
export class UserController{
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created, returns user ID', schema: { example: { id: '60f8a...' } } })
    async create(@Body() dto: CreateUserDto) {
    //   return this.createUser.execute(dto);
    }       
}