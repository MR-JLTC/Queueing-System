import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { QueueTicketsService } from './queue-tickets.service';
import { CreateQueueTicketDto } from './dto/create-queue-ticket.dto';
import { UpdateQueueTicketDto } from './dto/update-queue-ticket.dto';
// REMOVED: import { TicketStatus } from './entities/queue-ticket.entity';

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

  // Example of a new endpoint to change ticket status
  @Patch(':id/status/:statusId')
  @HttpCode(HttpStatus.OK)
  async updateTicketStatus(
    @Param('id') ticketId: string,
    @Param('statusId') newStatusId: string,
  ) {
    return this.queueTicketsService.updateTicketStatus(+ticketId, +newStatusId);
  }
}