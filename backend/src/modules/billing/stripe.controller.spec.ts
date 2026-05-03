import { UnauthorizedException } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

describe('StripeController', () => {
  const stripeService = {
    createCheckoutSession: jest.fn(),
    createCustomerPortal: jest.fn(),
    handleWebhook: jest.fn(),
  } as unknown as jest.Mocked<StripeService>;

  let controller: StripeController;

  beforeEach(() => {
    controller = new StripeController(stripeService);
    jest.clearAllMocks();
  });

  it('uses normalized userId for checkout', async () => {
    const req = {
      user: {
        firebaseUid: 'firebase-uid-3',
        userId: 'user-321',
      },
    } as any;

    stripeService.createCheckoutSession.mockResolvedValue({ url: 'https://checkout.example' } as never);

    await controller.createCheckoutSession({ priceId: 'price_123' } as any, req);

    expect(stripeService.createCheckoutSession).toHaveBeenCalledWith('user-321', 'price_123');
  });

  it('uses normalized userId for portal', async () => {
    const req = {
      user: {
        firebaseUid: 'firebase-uid-4',
        userId: 'user-654',
      },
    } as any;

    stripeService.createCustomerPortal.mockResolvedValue({ url: 'https://portal.example' } as never);

    await controller.createCustomerPortal({} as any, req);

    expect(stripeService.createCustomerPortal).toHaveBeenCalledWith('user-654', undefined);
  });

  it('fails when webhook signature is missing', async () => {
    await expect(
      controller.handleWebhook({ rawBody: Buffer.from('body') } as any, undefined as unknown as string),
    ).rejects.toThrow(UnauthorizedException);
  });
});
