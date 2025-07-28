// src/ticket-status-history/dto/create-ticket-status-history.dto.ts
import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateTicketStatusHistoryDto {
  @IsInt()
  ticketId: number;

  @IsInt()
  @IsOptional()
  oldStatusId?: number | null; // Corrected type for nullable

  @IsInt()
  newStatusId: number;

  @IsDateString()
  @IsOptional()
  changeTimestamp?: Date;

  @IsInt()
  @IsOptional()
  changedByUserId?: number | null; // Corrected type for nullable

  @IsInt()
  @IsOptional()
  relatedStatusId?: number | null; // Corrected type for nullable
}
