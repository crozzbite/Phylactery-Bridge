
import { Controller, Post, Body, Req, UseGuards, UnauthorizedException, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PrismaService } from '../../core/prisma/prisma.service';

@Controller('billing')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckoutSession(@Body() body: { priceId: string }, @Req() req: any) {
     // Resolve User ID from Firebase UID
     const user = await this.prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
     if (!user) throw new UnauthorizedException('User not found');

     return this.stripeService.createCheckoutSession(user.id, body.priceId);
  }

  @Post('portal')
  @UseGuards(AuthGuard)
  async createCustomerPortal(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (!user) throw new UnauthorizedException('User not found');
    
    return this.stripeService.createCustomerPortal(user.id);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
    if (!signature) throw new UnauthorizedException('Missing Stripe Signature');
    // req.rawBody is available because rawBody: true in main.ts
    await this.stripeService.handleWebhook(signature, req.rawBody);
    return { received: true };
  }
}
