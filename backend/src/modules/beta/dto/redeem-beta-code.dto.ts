import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export class RedeemBetaCodeDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @Length(3, 64)
  @Matches(/^[A-Z0-9-]+$/)
  code: string;
}
