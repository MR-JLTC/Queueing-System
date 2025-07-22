// src/daily-queue-summary/daily-queue-summary.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyQueueSummaryService } from './daily-queue-summary.service';
import { DailyQueueSummaryController } from './daily-queue-summary.controller';
import { DailyQueueSummary } from './entities/daily-queue-summary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyQueueSummary])],
  controllers: [DailyQueueSummaryController],
  providers: [DailyQueueSummaryService],
  exports: [DailyQueueSummaryService],
})
export class DailyQueueSummaryModule {}