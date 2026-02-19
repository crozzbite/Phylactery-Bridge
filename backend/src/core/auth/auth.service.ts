import { Injectable, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { IUser } from './interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Registers or retrieves a user via Firebase token.
   * Idempotent: Uses `upsert` to safely handle concurrent requests
   * for the same Firebase UID without race conditions.
   */
  async register(dto: RegisterDto): Promise<IUser> {
    let decodedToken: { uid: string; email?: string };

    // Phase 1: Validate Token (Auth concern)
    try {
      decodedToken = await this.firebaseService.auth.verifyIdToken(dto.firebaseToken);
    } catch (error) {
      this.logger.warn(`Token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }

    const { uid, email } = decodedToken;

    // Phase 2: Upsert User (Data concern) - Idempotent operation
    try {
      const user = await this.prisma.user.upsert({
        where: { firebaseUid: uid },
        update: {}, // No-op if user already exists (idempotent)
        create: {
          firebaseUid: uid,
          email: email || dto.email || `anon-${uid}@phylactery.ai`,
          role: 'FREE', // Matches Prisma enum UserRole.FREE
        },
      });

      return user as IUser;
    } catch (error) {
      this.logger.error(
        `User upsert failed for UID ${uid}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Registration failed. Please try again.');
    }
  }

  async validateUser(uid: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({ where: { firebaseUid: uid } });
    return user as IUser | null;
  }

  async getUserProfile(firebaseUid: string): Promise<IUser> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user as IUser;
  }
}
