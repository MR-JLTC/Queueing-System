import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueTicketsService } from './queue-tickets.service';
import { QueueTicketsController } from './queue-tickets.controller';
import { QueueTicket } from './entities/queue-ticket.entity';
import { CustomerCategory } from '../customer-categories/entities/customer-category.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity';
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QueueTicket, CustomerCategory, ServiceWindow, TicketStatus, User])],
  controllers: [QueueTicketsController],
  providers: [QueueTicketsService],
  exports: [QueueTicketsService],
})
export class QueueTicketsModule {}