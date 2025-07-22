import { IsInt, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateStaffWindowAssignmentDto {
  @IsInt()
  staffId: number;

  @IsInt()
  windowId: number;

  @IsDateString()
  assignedFrom: Date;

  @IsOptional()
  @IsDateString()
  assignedTo?: Date;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}
