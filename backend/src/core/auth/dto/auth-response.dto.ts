import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;
}
