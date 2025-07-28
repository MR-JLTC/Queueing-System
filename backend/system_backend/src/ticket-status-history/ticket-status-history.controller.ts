import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common'; // Removed Patch
import { TicketStatusHistoryService } from './ticket-status-history.service';
import { CreateTicketStatusHistoryDto } from './dto/create-ticket-status-history.dto';
// import { UpdateTicketStatusHistoryDto } from './dto/update-ticket-status-history.dto'; // Removed Update DTO import

@Controller('ticket-status-history')
export class TicketStatusHistoryController {
  constructor(private readonly ticketStatusHistoryService: TicketStatusHistoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTicketStatusHistoryDto: CreateTicketStatusHistoryDto) {
    return this.ticketStatusHistoryService.create(createTicketStatusHistoryDto);
  }

  @Get()
  findAll() {
    return this.ticketStatusHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.findOne(id);
  }

  // Removed the @Patch endpoint as history records are typically immutable
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTicketStatusHistoryDto: UpdateTicketStatusHistoryDto) {
  //   return this.ticketStatusHistoryService.update(+id, updateTicketStatusHistoryDto);
  // }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusHistoryService.remove(id);
  }
}
