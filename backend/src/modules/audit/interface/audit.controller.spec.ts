
import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { StartAuditUseCase } from '../application/use-cases/start-audit.use-case';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockStartAuditUseCase = {
  execute: jest.fn(),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuditController', () => {
  let controller: AuditController;
  let startAuditUseCase: typeof mockStartAuditUseCase;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        { provide: StartAuditUseCase, useValue: mockStartAuditUseCase },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .compile();

    controller = module.get<AuditController>(AuditController);
    startAuditUseCase = module.get(StartAuditUseCase);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startAudit', () => {
    it('should start an audit successfully', async () => {
      const req = { user: { uid: 'test-uid' } };
      const body = { workspaceId: 'ws-1', title: 'Test Audit', inputs: { code: '...' } };
      const user = { id: 'user-1', firebaseUid: 'test-uid' };
      const session = { id: 'session-1', status: 'PENDING' };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockStartAuditUseCase.execute.mockResolvedValue(session);

      const result = await controller.startAudit(body, req);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { firebaseUid: 'test-uid' } });
      expect(startAuditUseCase.execute).toHaveBeenCalledWith({
        userId: user.id,
        workspaceId: body.workspaceId,
        title: body.title,
        description: undefined,
        inputs: body.inputs,
      });
      expect(result).toEqual(session);
    });

    it('should throw UnauthorizedException if user not found', async () => {
        const req = { user: { uid: 'test-uid' } };
        const body = { workspaceId: 'ws-1' };
  
        mockPrismaService.user.findUnique.mockResolvedValue(null);
  
        await expect(controller.startAudit(body, req)).rejects.toThrow(UnauthorizedException);
      });
  });
});
