import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class BetaService {
  private readonly logger = new Logger(BetaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Redeems an access code for a user.
   * Atomically increments usage and grants access.
   */
  async redeemCode(userId: string, code: string) {
    const normalizedCode = code.trim().toUpperCase();

    // 1. Check if user already has access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { betaAccess: true },
    });

    if (user?.betaAccess) {
      throw new ConflictException('User already has beta access');
    }

    // 2. Atomic Transaction: Validate & Increment
    return this.prisma.$transaction(async (tx) => {
      // Find the code first to get its ID (needed for audit log) 
      // and ensure it exists/is valid for update
      const accessCode = await tx.accessCode.findUnique({
        where: { code: normalizedCode },
      });

      if (!accessCode) {
        throw new BadRequestException('Invalid access code');
      }

      if (!accessCode.isActive) {
        throw new BadRequestException('Access code is inactive');
      }

      if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
        throw new BadRequestException('Access code has expired');
      }

      if (accessCode.uses >= accessCode.maxUses) {
        throw new BadRequestException('Access code usage limit reached');
      }

      // Atomic Increment
      // We use updateMany to ensure we only increment if constraints still hold 
      // (in case of race condition between find and update)
      // tailored for concurrency safety
      const updateResult = await tx.accessCode.updateMany({
        where: {
          id: accessCode.id,
          uses: { lt: accessCode.maxUses }, // Concurrency Guard
          isActive: true,
          OR: [
             { expiresAt: null },
             { expiresAt: { gt: new Date() } }
          ]
        },
        data: {
          uses: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException('Code invalid, expired, or limit reached during redemption');
      }

      // 3. Grant Access to User
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          betaAccess: true,
          role: 'PRO', // Grant PRO role as per spec
        },
      });

      // 4. Create Audit Log
      await tx.accessCodeRedemption.create({
        data: {
          userId,
          accessCodeId: accessCode.id,
        },
      });

      this.logger.log(`Beta Access granted to user ${userId} via code ${normalizedCode}`);

      return { success: true, role: updatedUser.role };
    });
  }

  /**
   * Checks the beta status of a user.
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { betaAccess: true, role: true },
    });

    return {
      hasAccess: user?.betaAccess ?? false,
      role: user?.role ?? 'FREE',
    };
  }
}
