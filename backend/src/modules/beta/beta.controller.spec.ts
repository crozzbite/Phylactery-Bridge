import { BetaController } from './beta.controller';
import { BetaService } from './beta.service';

describe('BetaController', () => {
  const betaService = {
    redeemCode: jest.fn(),
    getStatus: jest.fn(),
  } as unknown as jest.Mocked<BetaService>;

  let controller: BetaController;

  beforeEach(() => {
    controller = new BetaController(betaService);
    jest.clearAllMocks();
  });

  it('uses normalized userId for redeem', async () => {
    const request = {
      user: {
        firebaseUid: 'firebase-uid-1',
        userId: 'user-123',
      },
    } as any;

    betaService.redeemCode.mockResolvedValue({ success: true, role: 'PRO' } as never);

    await controller.redeem(request, { code: 'PHY-LAUNCH' } as any);

    expect(betaService.redeemCode).toHaveBeenCalledWith('user-123', 'PHY-LAUNCH');
  });

  it('uses normalized userId for status', async () => {
    const request = {
      user: {
        firebaseUid: 'firebase-uid-2',
        userId: 'user-789',
      },
    } as any;

    betaService.getStatus.mockResolvedValue({ hasAccess: false, role: 'FREE' } as never);

    await controller.getStatus(request);

    expect(betaService.getStatus).toHaveBeenCalledWith('user-789');
  });
});
