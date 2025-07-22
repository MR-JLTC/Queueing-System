import { IsString, MaxLength, IsEnum } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum'; // Re-using enum

export class CreateRoleDto {
  @IsString()
  @MaxLength(255)
  roleName: string;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}