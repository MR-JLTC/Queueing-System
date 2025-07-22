import { IsString, MaxLength, IsInt, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';
import { RecordStatus } from '../../common/enums/record-status.enum';

export class CreateQueueTicketDto {
  @IsString()
  @MaxLength(255)
  queueNumber: string;

  @IsString()
  @MaxLength(255)
  customerName: string;

  @IsInt()
  categoryId: number;

  @IsDateString()
  issuedAt: Date;

  @IsOptional()
  @IsInt()
  windowId?: number;

  @IsString()
  @MaxLength(1)
  currentStatus: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  requeueCount?: number;

  @IsOptional()
  @IsDateString()
  servedAt?: Date;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;

  @IsOptional()
  @IsInt()
  cancelledByUserId?: number;

  @IsEnum(RecordStatus)
  recordStatus: RecordStatus;
}
