import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './interfaces/authenticated-request.interface';

export interface IdentityResolverInput {
  firebaseUid: string;
  email?: string;
  claims?: Record<string, unknown>;
}

@Injectable()
export class IdentityResolverService {
  private readonly logger = new Logger(IdentityResolverService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolve(input: IdentityResolverInput): Promise<AuthenticatedUser | null> {
    const internal = await this.prisma.user.findUnique({
      where: { firebaseUid: input.firebaseUid },
    });

    if (!internal) {
      return null;
    }

    return {
      firebaseUid: input.firebaseUid,
      userId: internal.id,
      email: input.email ?? internal.email,
      claims: input.claims,
    };
  }
}
