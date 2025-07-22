import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { QueueTicketsService } from './queue-tickets.service';
import { CreateQueueTicketDto } from './dto/create-queue-ticket.dto';
import { UpdateQueueTicketDto } from './dto/update-queue-ticket.dto';

@Controller('queue-tickets')
export class QueueTicketsController {
  constructor(private readonly queueTicketsService: QueueTicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createQueueTicketDto: CreateQueueTicketDto) {
    return this.queueTicketsService.create(createQueueTicketDto);
  }

  @Get()
  findAll() {
    return this.queueTicketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueTicketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueTicketDto: UpdateQueueTicketDto) {
    return this.queueTicketsService.update(+id, updateQueueTicketDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.queueTicketsService.remove(+id);
  }
}