// src/service-windows/dto/create-service-window.dto.ts
import { IsInt, IsBoolean, IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateServiceWindowDto {
  @IsInt() // windowNumber should be an integer
  @IsNotEmpty()
  windowNumber: number;

  // NEW: Add windowName
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  windowName: string;

  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  visibilityStatus?: string;
}
