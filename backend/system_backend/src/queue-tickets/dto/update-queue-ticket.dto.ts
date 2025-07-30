// src/queue-tickets/dto/update-queue-ticket.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateQueueTicketDto } from './create-queue-ticket.dto';
import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator'; // Removed IsEmail, IsPhoneNumber

export class UpdateQueueTicketDto extends PartialType(CreateQueueTicketDto) {
  @IsOptional()
  @IsString()
  ticketNumber?: string; // Kept as optional for potential updates, but typically not updated

  @IsOptional()
  @IsString()
  customerName?: string;

  // Removed: customerPhone as requested
  // @IsOptional()
  // @IsPhoneNumber('PH', { message: 'Customer phone must be a valid Philippine phone number.' })
  // customerPhone?: string | null;

  // Removed: customerEmail as requested
  // @IsOptional()
  // @IsEmail({}, { message: 'Customer email must be a valid email address.' })
  // customerEmail?: string | null;

  @IsOptional()
  @IsInt()
  categoryId?: number; // Renamed from customerCategoryId

  @IsOptional()
  @IsInt()
  branchId?: number;

  @IsOptional()
  @IsInt()
  currentStatusId?: number;

  @IsOptional()
  @IsInt()
  assignedToWindowId?: number | null;

  @IsOptional()
  @IsInt()
  assignedToStaffId?: number | null;

  @IsOptional()
  @IsString()
  serviceType?: string | null;

  @IsOptional()
  @IsDateString()
  queuedAt?: Date;

  @IsOptional()
  @IsInt()
  issuedByUserId?: number | null;

  @IsOptional()
  @IsDateString()
  calledAt?: Date;

  @IsOptional()
  @IsDateString()
  servedAt?: Date;

  @IsOptional()
  @IsInt()
  cancelledById?: number | null;

  @IsOptional()
  @IsString()
  visibilityStatus?: string;
}
