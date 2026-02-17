import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IAuditRepository } from '../domain/repositories/audit.repository.interface';
import { AuditSession, AuditStatus } from '../domain/entities/audit-session.entity';

@Processor('deliberation')
@Injectable()
export class AuditWorker extends WorkerHost {
  private readonly logger = new Logger(AuditWorker.name);

  constructor(
    @Inject('IAuditRepository')
    private readonly auditRepository: IAuditRepository,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { sessionId } = job.data;
    this.logger.log(`Processing Audit Session: ${sessionId}`);

    try {
      const session = await this.auditRepository.findById(sessionId);
      if (!session) {
        throw new Error(`AuditSession not found: ${sessionId}`);
      }
      
      this.logger.debug(`Starting processing logic for session ${session.id}...`);

      // Verify state transition is valid
      if (session.status !== AuditStatus.PENDING) {
          this.logger.warn(`Session ${sessionId} is not pending (${session.status}). Skipping.`);
          return;
      }

      session.startProcessing();
      await this.auditRepository.save(session);

      // Simulating AI Engine Processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult = {
        summary: 'Audit completed successfully (Mock)',
        score: 95,
        details: 'This audit was processed by BullMQ worker via Bun in local dev environment.',
      };

      session.complete(mockResult);
      session.estimatedCost = 0.05;
      session.totalInputTokens = 1500; 
      session.totalOutputTokens = 500;

      await this.auditRepository.save(session);
      this.logger.log(`Audit Session Completed: ${sessionId}`);

      return mockResult;

    } catch (error) {
      this.logger.error(`Audit Processing Failed: ${sessionId}`, error);
      // In a real scenario, we might want to reload session to ensure we are updating latest version
      const session = await this.auditRepository.findById(sessionId);
      if (session) {
          session.fail(error instanceof Error ? error.message : 'Unknown error');
          await this.auditRepository.save(session);
      }
      throw error;
    }
  }
}
