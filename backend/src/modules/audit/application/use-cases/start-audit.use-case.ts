import { Injectable, Inject } from '@nestjs/common';
import type { IAuditRepository } from '../../domain/repositories/audit.repository.interface';
import { AuditSession } from '../../domain/entities/audit-session.entity';
// import { UsageCounter } from '../../../identity/domain/value-objects/usage-counter.vo';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

// TODO: Move DTO to shared or interface
export interface StartAuditDto {
  userId: string;
  workspaceId: string;
  title: string;
  description?: string;
  inputs: Record<string, any>;
}


@Injectable()
export class StartAuditUseCase {
  constructor(
    @Inject('IAuditRepository')
    private readonly auditRepository: IAuditRepository,
    @InjectQueue('deliberation') private readonly deliberationQueue: Queue,
  ) {}

  async execute(dto: StartAuditDto): Promise<AuditSession> {
    // 1. Check Usage Limits (Future)
    // const usage = await this.usageRepository.findByUser(dto.userId);
    // if (!usage.canStartNewAudit()) throw new Error('Limit Reached');

    // 2. Create Audit Session (Domain Logic)
    const session = AuditSession.create(
      dto.userId,
      dto.workspaceId,
      dto.title,
      dto.description || null,
      dto.inputs,
    );

    // 3. Persist (Status: PENDING)
    await this.auditRepository.save(session);

    // 4. Trigger Async Job (BullMQ)
    await this.deliberationQueue.add('process-audit', {
      sessionId: session.id,
      userId: dto.userId,
    });

    return session;
  }
}
