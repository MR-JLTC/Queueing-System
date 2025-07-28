// src/staff/dto/create-staff.dto.ts
import { IsString, IsBoolean, IsInt, MinLength, MaxLength, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fullName: string;

  @IsNotEmpty() // The branch ID this staff belongs to
  @IsInt()
  branchId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(VisibilityStatus)
  visibilityStatus?: VisibilityStatus;
}
