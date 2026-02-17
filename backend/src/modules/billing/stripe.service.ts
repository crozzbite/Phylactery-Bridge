import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2026-01-28.clover',
    });
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    let customerId = user.stripeCustomerId;

    if (!customerId) {
        // Create new customer if not exists
        const customer = await this.stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id },
        });
        customerId = customer.id;
        await this.prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
        });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${this.configService.get('ALLOWED_ORIGINS').split(',')[0]}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('ALLOWED_ORIGINS').split(',')[0]}/billing/cancel`,
      metadata: { userId },
    });

    return { url: session.url };
  }

  async createCustomerPortal(userId: string) {
     const user = await this.prisma.user.findUnique({ where: { id: userId } });
     if (!user || !user.stripeCustomerId) throw new Error('User/Customer not found');

     const session = await this.stripe.billingPortal.sessions.create({
         customer: user.stripeCustomerId,
         return_url: `${this.configService.get('ALLOWED_ORIGINS').split(',')[0]}/dashboard`,
     });

     return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET') ?? '',
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new UnauthorizedException('Webhook Error: ' + err.message);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      case 'invoice.payment_succeeded':
        // Handle payment success (e.g., renew subscription)
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Sync subscription status with DB
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: session.customer as string },
    });
    
    // Provision subscription logic here...
    // Only basic syncing for now, relying on subscription.updated for status
  }
}
