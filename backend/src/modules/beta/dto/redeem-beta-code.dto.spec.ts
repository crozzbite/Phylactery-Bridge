import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RedeemBetaCodeDto } from './redeem-beta-code.dto';

describe('RedeemBetaCodeDto', () => {
  it('accepts a valid beta code', async () => {
    const dto = plainToInstance(RedeemBetaCodeDto, { code: 'PHY-LAUNCH' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects malformed beta code', async () => {
    const dto = plainToInstance(RedeemBetaCodeDto, { code: 'bad code' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
