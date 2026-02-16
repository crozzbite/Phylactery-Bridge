import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../auth/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const traceId = request.headers['x-request-id'] ?? 'no-trace';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn(`[${traceId}] Auth attempt with no/invalid Bearer header`);
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      this.logger.warn(`[${traceId}] Token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
