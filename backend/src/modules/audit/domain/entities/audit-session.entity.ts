import { UsageCounter } from '../../../identity/domain/value-objects/usage-counter.vo';

export enum AuditStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class AuditSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly workspaceId: string,
    public readonly title: string,
    public readonly description: string | null,
    public architectModel: string | null,
    public auditorModel: string | null,
    public status: AuditStatus,
    public readonly inputs: Record<string, any>, // Mapped to contextFiles or other JSON
    public result: Record<string, any> | null,
    // Metrics
    public totalInputTokens: number,
    public totalOutputTokens: number,
    public estimatedCost: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    userId: string,
    workspaceId: string,
    title: string,
    description: string | null,
    inputs: Record<string, any>,
  ): AuditSession {
    return new AuditSession(
      crypto.randomUUID(),
      userId,
      workspaceId,
      title,
      description,
      null, // Models selected later? Or passed in create?
      null,
      AuditStatus.PENDING,
      inputs,
      null,
      0,
      0,
      0,
      new Date(),
      new Date(),
    );
  }

  startProcessing(): void {
    if (this.status !== AuditStatus.PENDING) {
      throw new Error('Audit session must be pending to start processing.');
    }
    this.status = AuditStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  complete(result: Record<string, any>): void {
    if (this.status !== AuditStatus.PROCESSING) {
      throw new Error('Audit session must be processing to complete.');
    }
    this.status = AuditStatus.COMPLETED;
    this.result = result;
    this.updatedAt = new Date();
  }

  fail(reason: string): void {
    this.status = AuditStatus.FAILED;
    this.result = { error: reason };
    this.updatedAt = new Date();
  }
}
