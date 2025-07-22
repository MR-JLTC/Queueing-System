import { IsString, MaxLength, IsEnum } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateCustomerCategoryDto {
  @IsString()
  @MaxLength(255)
  categoryName: string;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}