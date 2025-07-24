import { IsString, IsInt, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateQueueTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  ticketNumber: string;

  @IsInt()
  branchId: number;

  @IsOptional()
  @IsInt()
  assignedToWindowId?: number;

  @IsOptional()
  @IsInt()
  assignedToStaffId?: number;

  @IsOptional()
  @IsInt()
  customerCategoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  serviceType?: string;

  @IsInt() // Initial status is now an ID referencing TicketStatus entity
  currentStatusId: number;
}