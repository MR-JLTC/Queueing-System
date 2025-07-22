import { IsInt, IsString, MaxLength, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { RecordStatus } from '../../common/enums/record-status.enum';

export class CreateTicketStatusHistoryDto {
  @IsInt()
  ticketId: number;

  @IsString()
  @MaxLength(1)
  statusCode: string;

  @IsInt()
  changedByUserId: number;

  @IsDateString()
  changedAt: Date;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;

  @IsEnum(RecordStatus)
  recordStatus: RecordStatus;
}