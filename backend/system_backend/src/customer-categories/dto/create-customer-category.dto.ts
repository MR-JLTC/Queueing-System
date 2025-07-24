import { IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateCustomerCategoryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  categoryName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}