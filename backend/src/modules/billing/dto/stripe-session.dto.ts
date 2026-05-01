import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^price_[A-Za-z0-9_]+$/)
  priceId: string;
}

export class CreatePortalSessionDto {
  @IsOptional()
  @IsString()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  returnUrl?: string;
}
