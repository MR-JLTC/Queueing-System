import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueTicketsService } from './queue-tickets.service';
import { QueueTicketsController } from './queue-tickets.controller';
import { QueueTicket } from './entities/queue-ticket.entity';
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity'; // <--- Import TicketStatus entity
import { TicketStatusHistoryModule } from '../ticket-status-history/ticket-status-history.module'; // <--- Import history module

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueTicket, TicketStatus]), // Include TicketStatus here
    TicketStatusHistoryModule, // Import the module to use its service
  ],
  controllers: [QueueTicketsController],
  providers: [QueueTicketsService],
  exports: [QueueTicketsService], // Export if other modules need to use this service
})
export class QueueTicketsModule {}