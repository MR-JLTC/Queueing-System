import { IsInt, IsOptional, IsNumber } from 'class-validator';

export class CreateTicketStatusHistoryDto {
  @IsInt()
  ticketId: number;

  @IsOptional()
  @IsNumber() // Ensures it's a number if provided, but allows undefined and null due to @IsOptional()
  oldStatusId?: number | null; // Allows null for oldStatusId, and undefined if omitted

  @IsInt()
  newStatusId: number;

  @IsInt()
  relatedStatusId: number; // For the related TicketStatus entity ID

  @IsOptional()
  @IsInt()
  changedById?: number; // User who changed the status, if applicable
}