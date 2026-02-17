
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaService } from '../../core/prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeService, PrismaService],
  exports: [StripeService],
})
export class StripeModule {}
