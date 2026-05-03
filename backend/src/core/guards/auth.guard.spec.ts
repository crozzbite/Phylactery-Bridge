import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { FirebaseService } from '../auth/firebase.service';
import { ExecutionContext, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { IdentityResolverService } from '../auth/identity-resolver.service';

const mockFirebaseService = {
  auth: {
    verifyIdToken: jest.fn(),
  },
};

const mockIdentityResolver = {
  resolve: jest.fn(),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const createContext = (authorization?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: authorization
            ? { authorization, 'x-request-id': 'test-trace' }
            : { 'x-request-id': 'test-trace' },
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: IdentityResolverService, useValue: mockIdentityResolver },
        Logger,
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('attaches normalized identity and allows access when token and internal user are valid', async () => {
    const request = {
      headers: { authorization: 'Bearer valid-token', 'x-request-id': 'test-trace' },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    (mockFirebaseService.auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'firebase-uid-123',
      email: 'valid@example.com',
    });
    mockIdentityResolver.resolve.mockResolvedValue({
      firebaseUid: 'firebase-uid-123',
      userId: 'internal-user-123',
      email: 'valid@example.com',
      claims: { sub: 'firebase-uid-123' },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockIdentityResolver.resolve).toHaveBeenCalledWith({
      firebaseUid: 'firebase-uid-123',
      email: 'valid@example.com',
      claims: { uid: 'firebase-uid-123', email: 'valid@example.com' },
    });
    expect(request).toMatchObject({
      user: {
        firebaseUid: 'firebase-uid-123',
        userId: 'internal-user-123',
        email: 'valid@example.com',
      },
    });
  });

  it('returns 401 when bearer token is missing', async () => {
    const context = createContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(mockFirebaseService.auth.verifyIdToken).not.toHaveBeenCalled();
    expect(mockIdentityResolver.resolve).not.toHaveBeenCalled();
  });

  it('returns 401 when Firebase token is invalid or expired', async () => {
    const context = createContext('Bearer invalid-token');
    (mockFirebaseService.auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(mockIdentityResolver.resolve).not.toHaveBeenCalled();
  });

  it('returns 403 when token is valid but no internal user mapping exists', async () => {
    const context = createContext('Bearer valid-token');
    (mockFirebaseService.auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'firebase-uid-123',
    });
    mockIdentityResolver.resolve.mockResolvedValue(null);

    const activation = guard.canActivate(context);
    await expect(activation).rejects.toThrow(ForbiddenException);
    await expect(activation).rejects.toThrow('IDENTITY_NOT_RESOLVED');
  });
});
