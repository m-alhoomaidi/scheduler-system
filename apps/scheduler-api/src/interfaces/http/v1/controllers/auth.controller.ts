import { Body, Controller, Get, Headers, Param, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuth } from "../../decorators/jwt-auth.decorator";
import { AuthResponseDto } from "../dto/verify-auth-response";
import { VerifyAuthDto } from "../dto/verify-auth.dto";
import { AuthService } from "@/application/ports/auth.service";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiTags('authentication')
@Controller('v1/auth')
export class AuthController{

    constructor(private readonly authService: AuthService) {}

    @Post('verify')
    @ApiOperation({ summary: 'Verify credentials and issue a JWT' })
    @ApiResponse({ status: 201, type: AuthResponseDto })
    async verify(
      @Body() creds: VerifyAuthDto,
      @Headers('x-forwarded-for') forwardedFor?: string,
      @Req() req?: any,
    ): Promise<AuthResponseDto> {
      const ip = forwardedFor?.split(',')[0]?.trim() || req?.ip || '';
      return this.authService.verify(creds, ip)
    }       


    @Get('validate/:accessToken')
    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Validate if the access token is valid or not' })
    @ApiResponse({ status: 201 })

    async validateAccessToken(
      @Param('accessToken')  accessToken:string
    ){
      return this.authService.validateToken(accessToken)
    }
}