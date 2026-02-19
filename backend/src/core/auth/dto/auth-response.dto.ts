import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'usr_123456' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'] })
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
