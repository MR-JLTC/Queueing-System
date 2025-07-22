import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TicketStatusesService } from './ticket-statuses.service';
import { CreateTicketStatusDto } from './dto/create-ticket-status.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Controller('ticket-statuses')
export class TicketStatusesController {
  constructor(private readonly ticketStatusesService: TicketStatusesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTicketStatusDto: CreateTicketStatusDto) {
    return this.ticketStatusesService.create(createTicketStatusDto);
  }

  @Get()
  findAll() {
    return this.ticketStatusesService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.ticketStatusesService.findOne(code);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Body() updateTicketStatusDto: UpdateTicketStatusDto) {
    return this.ticketStatusesService.update(code, updateTicketStatusDto);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('code') code: string) {
    return this.ticketStatusesService.remove(code);
  }
}