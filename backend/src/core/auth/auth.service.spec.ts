
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { Logger } from '@nestjs/common';
import { mockFirebaseAdmin, mockDecodedToken, mockUserRecord } from '../../../test/fixtures/firebase-mock';
import { UnauthorizedException } from '@nestjs/common';

const mockPrismaService = {
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockFirebaseService = {
  auth: {
    verifyIdToken: jest.fn(),
  }
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;
  let firebase: typeof mockFirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        Logger,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    firebase = module.get(FirebaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto = { firebaseToken: 'valid-token' };
      const expectedUser = { id: '1', firebaseUid: 'test-uid', email: 'test@phylactery.ai', role: 'FREE' };

      mockFirebaseService.auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockPrismaService.user.upsert.mockResolvedValue(expectedUser);

      const result = await service.register(dto);

      expect(firebase.auth.verifyIdToken).toHaveBeenCalledWith(dto.firebaseToken);
      expect(prisma.user.upsert).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
        const dto = { firebaseToken: 'invalid-token' };
        mockFirebaseService.auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));
  
        await expect(service.register(dto)).rejects.toThrow(UnauthorizedException);
      });
  });

  describe('getUserProfile', () => {
    it('should return user profile if user exists', async () => {
        const uid = 'test-uid';
        const expectedUser = { id: '1', firebaseUid: uid, email: 'test@phylactery.ai' };
        
        mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

        const result = await service.getUserProfile(uid);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { firebaseUid: uid } });
        expect(result).toEqual(expectedUser);
    });

    it('should return null if user does not exist', async () => {
        const uid = 'non-existent-uid';
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.getUserProfile(uid)).rejects.toThrow(UnauthorizedException);
    });
  });
});
