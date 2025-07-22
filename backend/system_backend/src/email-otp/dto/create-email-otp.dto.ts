import { IsInt, IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

export class CreateEmailOtpDto {
  @IsInt()
  userId: number;

  @IsString()
  @MaxLength(255)
  otpCode: string;

  @IsDateString()
  expiresAt: Date;

  @IsOptional()
  @IsDateString()
  usedAt?: Date;
}
