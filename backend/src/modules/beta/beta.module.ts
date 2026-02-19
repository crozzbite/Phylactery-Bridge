import { Module } from '@nestjs/common';
import { BetaService } from './beta.service';
import { BetaController } from './beta.controller';
import { CoreModule } from '../../core/core.module';
import { AuthModule } from '../../core/auth/auth.module';

@Module({
  imports: [CoreModule, AuthModule],
  controllers: [BetaController],
  providers: [BetaService],
  exports: [BetaService],
})
export class BetaModule {}
