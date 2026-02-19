import { Test, TestingModule } from '@nestjs/testing';
import { BetaService } from './beta.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  accessCode: {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  accessCodeRedemption: {
    create: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrismaService)),
};

describe('BetaService', () => {
  let service: BetaService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetaService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BetaService>(BetaService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redeemCode', () => {
    const userId = 'user-123';
    const code = 'PHY-TEST';
    const validCode = {
      id: 'code-1',
      code: 'PHY-TEST',
      uses: 0,
      maxUses: 100,
      isActive: true,
      expiresAt: null,
    };

    it('should successfully redeem a valid code', async () => {
      // Mock User not having beta access
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, betaAccess: false });
      
      // Mock Find Code
      mockPrismaService.accessCode.findUnique.mockResolvedValue(validCode);

      // Mock Update Code (Atomic simulation)
      mockPrismaService.accessCode.updateMany.mockResolvedValue({ count: 1 });

      // Mock Update User
      mockPrismaService.user.update.mockResolvedValue({ id: userId, betaAccess: true });

      const result = await service.redeemCode(userId, code);

      expect(result.success).toBe(true);
      expect(mockPrismaService.accessCode.updateMany).toHaveBeenCalled();
      expect(mockPrismaService.accessCodeRedemption.create).toHaveBeenCalledWith({
        data: { userId, accessCodeId: validCode.id },
      });
    });

    it('should throw ConflictException if user already has access', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, betaAccess: true });

      await expect(service.redeemCode(userId, code)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if code not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, betaAccess: false });
      mockPrismaService.accessCode.findUnique.mockResolvedValue(null);

      await expect(service.redeemCode(userId, code)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if code is inactive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, betaAccess: false });
      mockPrismaService.accessCode.findUnique.mockResolvedValue({ ...validCode, isActive: false });

      await expect(service.redeemCode(userId, code)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if code is expired', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, betaAccess: false });
      mockPrismaService.accessCode.findUnique.mockResolvedValue({ 
        ...validCode, 
        expiresAt: new Date(Date.now() - 1000) // Past
      });

      await expect(service.redeemCode(userId, code)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if max uses reached', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, betaAccess: false });
        mockPrismaService.accessCode.findUnique.mockResolvedValue(validCode);
        
        // Simulate update failing or returning null/error (though in our logic we check before update too, 
        // but the atomic update with WHERE uses < maxUses is critical)
        // Since we mock the transaction callback, we need to ensure our service logic handles the "check then update" correctly.
        // Or if we rely on the atomic update to fail?
        // Let's see the service logic.
        
        // If the service checks uses >= maxUses before update:
        mockPrismaService.accessCode.findUnique.mockResolvedValue({ ...validCode, uses: 100, maxUses: 100 });
  
        await expect(service.redeemCode(userId, code)).rejects.toThrow(BadRequestException);
    });
  });
});
