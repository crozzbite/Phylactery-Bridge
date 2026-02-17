
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { FirebaseService } from '../auth/firebase.service';
import { ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';

const mockFirebaseService = {
  auth: {
    verifyIdToken: jest.fn(),
  },
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let firebaseService: typeof mockFirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: FirebaseService, useValue: mockFirebaseService },
        Logger,
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    firebaseService = module.get(FirebaseService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access with valid token', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token', 'x-request-id': 'test-trace' },
        }),
      }),
    } as unknown as ExecutionContext;

    (mockFirebaseService.auth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-uid' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    // Also verify request.user is set
    // expect(context.switchToHttp().getRequest().user).toEqual({ uid: 'test-uid' });
  });

  it('should deny access without token', async () => {
    const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as unknown as ExecutionContext;
  
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

    it('should deny access with invalid token', async () => {
    const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Bearer invalid-token' },
          }),
        }),
      } as unknown as ExecutionContext;

    (mockFirebaseService.auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));
  
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
