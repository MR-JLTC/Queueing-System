import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketStatusHistoryService } from './ticket-status-history.service';
import { TicketStatusHistoryController } from './ticket-status-history.controller';
import { TicketStatusHistory } from './entities/ticket-status-history.entity';
import { QueueTicket } from '../queue-tickets/entities/queue-ticket.entity';
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketStatusHistory, QueueTicket, TicketStatus, User])],
  controllers: [TicketStatusHistoryController],
  providers: [TicketStatusHistoryService],
  exports: [TicketStatusHistoryService],
})
export class TicketStatusHistoryModule {}
