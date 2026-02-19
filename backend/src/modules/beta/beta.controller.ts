import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { BetaService } from './beta.service';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Beta Access')
@Controller('beta')
@UseGuards(ThrottlerGuard) // Rate limiting applied to controller
export class BetaController {
  constructor(private readonly betaService: BetaService) {}

  @Post('redeem')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redeem a beta access code' })
  @ApiBody({ schema: { type: 'object', properties: { code: { type: 'string', example: 'PHY-LAUNCH' } } } })
  @ApiResponse({ status: 200, description: 'Access granted.', schema: { example: { success: true, role: 'PRO' } } })
  @ApiResponse({ status: 400, description: 'Invalid code, expired, or limit reached.' })
  @ApiResponse({ status: 409, description: 'User already has beta access.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  @HttpCode(HttpStatus.OK)
  async redeem(@Request() req: any, @Body('code') code: string) {
    return this.betaService.redeemCode(req.user.uid, code);
  }

  @Get('status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check current user beta status' })
  @ApiResponse({ status: 200, description: 'Returns beta access status.', schema: { example: { hasAccess: true, role: 'PRO' } } })
  async getStatus(@Request() req: any) {
    return this.betaService.getStatus(req.user.uid);
  }
}
