import type { Request } from 'express';

/**
 * Normalized identity attached to a request after the AuthGuard:
 * - `firebaseUid` proves the Firebase-authenticated subject.
 * - `userId` is the internal business user id resolved by IdentityResolverService.
 * - `email` and `claims` are optional pass-through context.
 *
 * Business endpoints MUST consume `userId` for internal operations and MUST NOT
 * depend on the legacy `req.user.uid` shape.
 */
export interface AuthenticatedUser {
  firebaseUid: string;
  userId: string;
  email?: string;
  claims?: Record<string, unknown>;
}

/**
 * Express Request narrowed to the authenticated identity contract.
 * Use this type in protected controllers/handlers instead of `req: any`.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
