import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { AssignmentStatus } from '../entities/staff-window-assignment.entity';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateStaffWindowAssignmentDto {
  @IsInt()
  staffId: number;

  @IsInt()
  windowId: number;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;
}