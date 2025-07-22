// src/daily-queue-summary/daily-queue-summary.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { DailyQueueSummaryService } from './daily-queue-summary.service';
import { CreateDailyQueueSummaryDto } from './dto/create-daily-queue-summary.dto';
import { UpdateDailyQueueSummaryDto } from './dto/update-daily-queue-summary.dto';

@Controller('daily-queue-summary')
export class DailyQueueSummaryController {
  constructor(private readonly dailyQueueSummaryService: DailyQueueSummaryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDailyQueueSummaryDto: CreateDailyQueueSummaryDto) {
    return this.dailyQueueSummaryService.create(createDailyQueueSummaryDto);
  }

  @Get()
  findAll() {
    return this.dailyQueueSummaryService.findAll();
  }

  @Get(':date')
  findOne(@Param('date') date: string) {
    return this.dailyQueueSummaryService.findOne(new Date(date));
  }

  @Patch(':date')
  update(@Param('date') date: string, @Body() updateDailyQueueSummaryDto: UpdateDailyQueueSummaryDto) {
    return this.dailyQueueSummaryService.update(new Date(date), updateDailyQueueSummaryDto);
  }

  @Delete(':date')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('date') date: string) {
    return this.dailyQueueSummaryService.remove(new Date(date));
  }
}