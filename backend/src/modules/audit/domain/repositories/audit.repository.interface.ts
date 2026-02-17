import { AuditSession } from '../entities/audit-session.entity';

export interface IAuditRepository {
  save(auditSession: AuditSession): Promise<void>;
  findById(id: string): Promise<AuditSession | null>;
  findByUserId(userId: string): Promise<AuditSession[]>;
}
