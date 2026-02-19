import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Access Gate: Hard Security Check.
 * Ensures the user has the 'betaAccess' flag set to true.
 * Must be used AFTER AuthGuard (requires request.user to be populated).
 */
@Injectable()
export class BetaGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // Should likely fail before this guard if AuthGuard is present, 
      // but strictly speaking, no user means no beta access.
      throw new ForbiddenException('User not authenticated'); 
    }

    // Check the JWT claim OR fetch from DB if critical (JWT is faster but might be stale).
    // For this Sprint, we rely on the custom claim 'betaAccess' injected by Firebase 
    // OR we check the user object attached by our AuthMiddleware/Service if it fetches fresh data.
    
    // NOTE: Our AuthGuard typically attaches the decoded token (uid, email) OR the full user.
    // Let's assume for high security we check the database status via a service if needed,
    // OR we trust the user object if it was hydrated with DB data.
    
    // Looking at AuthMiddleware/Guard patterns in this project, we usually get a firebase user.
    // We need to ensure we have the DB user state.
    // If request.user is just flags, checking betaAccess property is enough.
    
    // CRITICAL: Inspecting typical User payload in this system.
    // If request.user is strictly from Firebase Token, it might NOT have 'betaAccess' 
    // unless we add it as a custom claim.
    // STRATEGY: We will assume the User object on request has 'betaAccess'.
    // If not, we block.
    
    if (user.betaAccess === true) {
      return true;
    }

    throw new ForbiddenException('Beta Access Required. Please redeem an invite code.');
  }
}
