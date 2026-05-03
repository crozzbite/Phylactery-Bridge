
import { Controller, Post, Body, Req, UseGuards, UnauthorizedException, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from '../../core/guards/auth.guard';
import type { AuthenticatedRequest } from '../../core/auth/interfaces';
import { CreateCheckoutSessionDto, CreatePortalSessionDto } from './dto/stripe-session.dto';

@Controller('billing')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckoutSession(@Body() body: CreateCheckoutSessionDto, @Req() req: AuthenticatedRequest) {
     return this.stripeService.createCheckoutSession(req.user.userId, body.priceId);
  }

  @Post('portal')
  @UseGuards(AuthGuard)
  async createCustomerPortal(@Body() body: CreatePortalSessionDto, @Req() req: AuthenticatedRequest) {
    return this.stripeService.createCustomerPortal(req.user.userId, body.returnUrl);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
    if (!signature) throw new UnauthorizedException('Missing Stripe Signature');
    // req.rawBody is available because rawBody: true in main.ts
    await this.stripeService.handleWebhook(signature, req.rawBody);
    return { received: true };
  }
}
