/**
 * Domain-level User interface.
 * Decouples the service/controller layers from Prisma's generated types.
 * Maps 1:1 to the `User` model in prisma/schema.prisma.
 */
export interface IUser {
  id: string;
  email: string;
  firebaseUid: string;
  role: 'FREE' | 'PLUS' | 'PRO' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  language: string;
  preferredArchitectModel: string | null;
  preferredAuditorModel: string | null;
  emailOnComplete: boolean;
  emailOnProductUpdate: boolean;
  allowDataTraining: boolean;
}
