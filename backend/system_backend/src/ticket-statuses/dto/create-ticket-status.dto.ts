import { IsString, MaxLength, IsEnum, IsNotEmpty } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateTicketStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  statusCode: string;

  @IsString()
  @MaxLength(255)
  statusLabel: string;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}
