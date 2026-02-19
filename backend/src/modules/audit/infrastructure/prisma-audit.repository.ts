import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { IAuditRepository } from '../domain/repositories/audit.repository.interface';
import { AuditSession, AuditStatus } from '../domain/entities/audit-session.entity';
import { Deliberation, DeliberationStatus } from '@prisma/client';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(auditSession: AuditSession): Promise<void> {
    const data = this.mapToPersistence(auditSession);
    await this.prisma.deliberation.upsert({
      where: { id: auditSession.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<AuditSession | null> {
    const model = await this.prisma.deliberation.findUnique({
      where: { id },
    });
    if (!model) return null;
    return this.mapToDomain(model);
  }

  async findByUserId(userId: string): Promise<AuditSession[]> {
    const models = await this.prisma.deliberation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return models.map((model) => this.mapToDomain(model));
  }

  private mapToDomain(model: Deliberation): AuditSession {
    return new AuditSession(
      model.id,
      model.userId,
      model.workspaceId,
      model.title,
      model.description,
      model.architectModel,
      model.auditorModel,
      this.mapStatusToDomain(model.status),
      (model.contextFiles as Record<string, any>) || {},
      null,
      model.totalInputTokens,
      model.totalOutputTokens,
      model.estimatedCost,
      model.createdAt,
      model.updatedAt,
    );
  }

  private mapToPersistence(entity: AuditSession): any {
    return {
      id: entity.id,
      userId: entity.userId,
      workspaceId: entity.workspaceId,
      title: entity.title,
      description: entity.description,
      architectModel: entity.architectModel,
      auditorModel: entity.auditorModel,
      status: this.mapStatusToPersistence(entity.status),
      contextFiles: entity.inputs,
      totalInputTokens: entity.totalInputTokens,
      totalOutputTokens: entity.totalOutputTokens,
      estimatedCost: entity.estimatedCost,
      updatedAt: new Date(),
    };
  }

  private mapStatusToDomain(status: DeliberationStatus): AuditStatus {
    switch (status) {
      case DeliberationStatus.PENDING:
        return AuditStatus.PENDING;
      case DeliberationStatus.IN_PROGRESS:
        return AuditStatus.PROCESSING;
      case DeliberationStatus.COMPLETED:
        return AuditStatus.COMPLETED;
      case DeliberationStatus.FAILED:
        return AuditStatus.FAILED;
      default:
        // Handle DRAFT or unexpected statuses if necessary, defaulting to PENDING for now
        // logic should depend on if DRAFT is a valid domain state
        return AuditStatus.PENDING; 
    }
  }

  private mapStatusToPersistence(status: AuditStatus): DeliberationStatus {
    switch (status) {
      case AuditStatus.PENDING:
        return DeliberationStatus.PENDING;
      case AuditStatus.PROCESSING:
        return DeliberationStatus.IN_PROGRESS;
      case AuditStatus.COMPLETED:
        return DeliberationStatus.COMPLETED;
      case AuditStatus.FAILED:
        return DeliberationStatus.FAILED;
      default:
        return DeliberationStatus.PENDING;
    }
  }
}
