import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyQueueSummaryDto } from './create-daily-queue-summary.dto';

export class UpdateDailyQueueSummaryDto extends PartialType(CreateDailyQueueSummaryDto) {}
