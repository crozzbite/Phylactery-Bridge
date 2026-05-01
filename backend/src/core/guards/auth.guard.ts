import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../auth/firebase.service';
import { IdentityResolverService } from '../auth/identity-resolver.service';
import type { AuthenticatedRequest } from '../auth/interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly identityResolver: IdentityResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    const traceHeader = request.headers['x-request-id'];
    const traceId = Array.isArray(traceHeader) ? traceHeader[0] : traceHeader ?? 'no-trace';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn(`[${traceId}] Auth attempt with no/invalid Bearer header`);
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    let decodedToken: { uid: string; email?: string } & Record<string, unknown>;
    try {
      decodedToken = await this.firebaseService.auth.verifyIdToken(token);
    } catch (error) {
      this.logger.warn(`[${traceId}] Token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    const normalizedIdentity = await this.identityResolver.resolve({
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      claims: decodedToken,
    });

    if (!normalizedIdentity) {
      this.logger.warn(`[${traceId}] Authenticated Firebase identity has no internal user mapping`);
      throw new ForbiddenException('IDENTITY_NOT_RESOLVED');
    }

    request.user = normalizedIdentity;
    return true;
  }
}
