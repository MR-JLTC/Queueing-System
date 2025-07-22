import { IsString, MaxLength, IsBoolean, IsEnum } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateServiceWindowDto {
  @IsString()
  @MaxLength(255)
  counterLabel: string;

  @IsString()
  @MaxLength(255)
  serviceArea: string;

  @IsBoolean()
  isOpen: boolean;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}