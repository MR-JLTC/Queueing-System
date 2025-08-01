// src/queue-tickets/queue-tickets.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
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

  // NEW ROUTE TO GET QUEUES FOR A SPECIFIC WINDOW
  @Get('window-queues/:windowId') // This defines the path segment
  async getQueueForWindow(@Param('windowId', ParseIntPipe) windowId: number) {
    return this.queueTicketsService.getQueueForWindowByWindowID(windowId);
  }

  // NEW ROUTE to check a queue ticket
  @Post('check')
  async checkQueueTicket(@Body() { ticketNumber }: { ticketNumber: string }) {
    return this.queueTicketsService.checkTicketStatus(ticketNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queueTicketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateQueueTicketDto: UpdateQueueTicketDto) {
    return this.queueTicketsService.update(id, updateQueueTicketDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.queueTicketsService.remove(id);
  }

  @Get('branch/:branchId/queue-status')
  async getQueueStatusForBranch(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.queueTicketsService.getQueueStatusByBranchAndWindow(branchId);
  }
}
