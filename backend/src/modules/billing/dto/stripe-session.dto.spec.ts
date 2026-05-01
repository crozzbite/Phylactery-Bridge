import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCheckoutSessionDto, CreatePortalSessionDto } from './stripe-session.dto';

describe('Stripe session DTOs', () => {
  it('accepts valid checkout payload', async () => {
    const dto = plainToInstance(CreateCheckoutSessionDto, { priceId: 'price_123' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid checkout payload', async () => {
    const dto = plainToInstance(CreateCheckoutSessionDto, { priceId: '' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts valid portal payload', async () => {
    const dto = plainToInstance(CreatePortalSessionDto, { returnUrl: 'https://app.example/account' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid portal payload', async () => {
    const dto = plainToInstance(CreatePortalSessionDto, { returnUrl: 'invalid-url' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
