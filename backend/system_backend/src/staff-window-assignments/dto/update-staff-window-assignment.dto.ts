import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffWindowAssignmentDto } from './create-staff-window-assignment.dto';

export class UpdateStaffWindowAssignmentDto extends PartialType(CreateStaffWindowAssignmentDto) {}