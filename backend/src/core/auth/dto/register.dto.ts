import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  firebaseToken: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
