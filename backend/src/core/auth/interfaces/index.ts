/**
 * Single source of truth for authenticated-request and user identity types.
 *
 * Guards, controllers, and services MUST import the normalized identity from
 * this barrel (`@core/auth/interfaces`) instead of reaching into individual
 * files. This keeps the contract upgrade path centralized.
 */
export type {
  AuthenticatedUser,
  AuthenticatedRequest,
} from './authenticated-request.interface';
export type { IUser } from './user.interface';
