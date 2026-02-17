import { Controller, Post, Body, Get, UseGuards, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.authService.register(dto);
    return plainToInstance(AuthResponseDto, user, { excludeExtraneousValues: true });
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any): Promise<AuthResponseDto> {
    // req.user is set by AuthGuard (decoded Firebase token)
    const user = await this.authService.getUserProfile(req.user.uid);
    return plainToInstance(AuthResponseDto, user, { excludeExtraneousValues: true });
  }
}
