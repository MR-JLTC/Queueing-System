import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateDailyQueueSummaryDto {
  @IsDateString()
  summaryDate: Date;

  @IsInt()
  @Min(0)
  totalQueued: number;

  @IsInt()
  @Min(0)
  totalServed: number;

  @IsInt()
  @Min(0)
  totalRequeued: number;

  @IsInt()
  @Min(0)
  seniorCount: number;

  @IsInt()
  @Min(0)
  pwdCount: number;

  @IsInt()
  @Min(0)
  otherCount: number;

  @IsInt()
  @Min(0)
  cancelledCount: number;
}
