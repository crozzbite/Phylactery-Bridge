import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PrismaAuditRepository } from './infrastructure/prisma-audit.repository';
import { StartAuditUseCase } from './application/use-cases/start-audit.use-case';
import { AuditController } from './interface/audit.controller'; 
import { BullModule } from '@nestjs/bullmq';
import { AuditWorker } from './infrastructure/audit.worker';
import { AuthModule } from '../../core/auth/auth.module'; // Import AuthModule for AuthGuard if it exports it, otherwise AuthGuard might need FirebaseService

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'deliberation',
    }),
    AuthModule, // Assuming AuthModule exports FirebaseService for AuthGuard
  ],
  controllers: [AuditController],
  providers: [
    PrismaService, 
    StartAuditUseCase,
    AuditWorker,
    {
      provide: 'IAuditRepository',
      useClass: PrismaAuditRepository,
    },
  ],
  exports: [StartAuditUseCase],
})
export class AuditModule {}
