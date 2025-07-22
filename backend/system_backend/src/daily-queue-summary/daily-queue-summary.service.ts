import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQueueSummary } from './entities/daily-queue-summary.entity';
import { CreateDailyQueueSummaryDto } from './dto/create-daily-queue-summary.dto';
import { UpdateDailyQueueSummaryDto } from './dto/update-daily-queue-summary.dto';

@Injectable()
export class DailyQueueSummaryService {
  constructor(
    @InjectRepository(DailyQueueSummary)
    private dailyQueueSummaryRepository: Repository<DailyQueueSummary>,
  ) {}

  create(createDailyQueueSummaryDto: CreateDailyQueueSummaryDto): Promise<DailyQueueSummary> {
    const summary = this.dailyQueueSummaryRepository.create(createDailyQueueSummaryDto);
    return this.dailyQueueSummaryRepository.save(summary);
  }

  findAll(): Promise<DailyQueueSummary[]> {
    return this.dailyQueueSummaryRepository.find();
  }

  async findOne(summaryDate: Date): Promise<DailyQueueSummary> {
    const summary = await this.dailyQueueSummaryRepository.findOne({ where: { summaryDate } });
    if (!summary) {
      throw new NotFoundException(`Daily queue summary for date "${summaryDate.toISOString().split('T')[0]}" not found`);
    }
    return summary;
  }

  async update(summaryDate: Date, updateDailyQueueSummaryDto: UpdateDailyQueueSummaryDto): Promise<DailyQueueSummary> {
    const summary = await this.findOne(summaryDate);
    Object.assign(summary, updateDailyQueueSummaryDto);
    return this.dailyQueueSummaryRepository.save(summary);
  }

  async remove(summaryDate: Date): Promise<void> {
    const result = await this.dailyQueueSummaryRepository.delete(summaryDate);
    if (result.affected === 0) {
      throw new NotFoundException(`Daily queue summary for date "${summaryDate.toISOString().split('T')[0]}" not found`);
    }
  }
}