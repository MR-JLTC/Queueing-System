// src/queue-tickets/dto/create-queue-ticket.dto.ts
import { IsString, IsInt, IsOptional, IsNotEmpty, IsDateString, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateQueueTicketDto {
  @IsString()
  @IsNotEmpty()
  ticketNumber: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsOptional()
  @IsPhoneNumber('PH', { message: 'Customer phone must be a valid Philippine phone number.' })
  customerPhone?: string | null; // Type is string | null

  @IsOptional()
  @IsEmail({}, { message: 'Customer email must be a valid email address.' })
  customerEmail?: string | null; // Type is string | null

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @IsInt()
  @IsNotEmpty()
  currentStatusId: number;

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
