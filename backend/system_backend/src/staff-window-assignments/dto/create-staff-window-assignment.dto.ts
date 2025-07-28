// src/staff-window-assignments/dto/create-staff-window-assignment.dto.ts
import { IsInt, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { AssignmentStatus } from '../../common/enums/assignment-status.enum'; // Correct import path

export class CreateStaffWindowAssignmentDto {
  @IsInt()
  staffId: number;

  @IsInt()
  windowId: number;

  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;

  @IsDateString()
  @IsOptional()
  assignedAt?: Date;

  @IsDateString()
  @IsOptional()
  unassignedAt?: Date;
}
