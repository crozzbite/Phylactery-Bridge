import { Test, TestingModule } from '@nestjs/testing';
import { IdentityResolverService } from './identity-resolver.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IdentityResolverService', () => {
  let service: IdentityResolverService;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityResolverService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<IdentityResolverService>(IdentityResolverService);
  });

  it('returns normalized identity when user exists by firebaseUid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-internal-1',
      firebaseUid: 'fb-uid-1',
      email: 'jane@example.com',
    });

    const result = await service.resolve({
      firebaseUid: 'fb-uid-1',
      email: 'jane@example.com',
      claims: { role: 'PRO' },
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'fb-uid-1' },
    });
    expect(result).toEqual({
      firebaseUid: 'fb-uid-1',
      userId: 'user-internal-1',
      email: 'jane@example.com',
      claims: { role: 'PRO' },
    });
  });

  it('returns null when no internal user matches the firebaseUid', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await service.resolve({ firebaseUid: 'unknown-uid' });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'unknown-uid' },
    });
    expect(result).toBeNull();
  });

  it('does not cache identity across calls (queries Prisma each time)', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-internal-1',
      firebaseUid: 'fb-uid-1',
      email: 'jane@example.com',
    });

    await service.resolve({ firebaseUid: 'fb-uid-1' });
    await service.resolve({ firebaseUid: 'fb-uid-1' });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
  });

  it('falls back to internal email when token email is absent', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-internal-2',
      firebaseUid: 'fb-uid-2',
      email: 'fallback@example.com',
    });

    const result = await service.resolve({ firebaseUid: 'fb-uid-2' });

    expect(result).toEqual({
      firebaseUid: 'fb-uid-2',
      userId: 'user-internal-2',
      email: 'fallback@example.com',
      claims: undefined,
    });
  });
});
