// src/service-windows/dto/create-service-window.dto.ts
import { IsInt, IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateServiceWindowDto {
  @IsInt() // windowNumber should be an integer
  @IsNotEmpty()
  windowNumber: number;

  @IsString()
  @IsNotEmpty()
  windowName: string; // Ensure windowName is present

  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  visibilityStatus?: string;

  @IsOptional()
  @IsInt()
  lastTicketNumber?: number; // Added as optional for creation
}
