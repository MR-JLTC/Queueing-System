import { IsString, IsInt, IsBoolean, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateServiceWindowDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  windowNumber: string;

  @IsInt()
  branchId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}