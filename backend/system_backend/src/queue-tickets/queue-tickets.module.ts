// src/queue-tickets/queue-tickets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueTicketsService } from './queue-tickets.service';
import { QueueTicketsController } from './queue-tickets.controller';
import { QueueTicket } from './entities/queue-ticket.entity';
import { Branch } from '../branches/entities/branch.entity';
import { CustomerCategory } from '../customer-categories/entities/customer-category.entity';
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity';
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QueueTicket,
      Branch,
      CustomerCategory,
      TicketStatus,
      ServiceWindow,
      Staff,
      User,
    ]),
  ],
  controllers: [QueueTicketsController],
  providers: [QueueTicketsService],
  exports: [QueueTicketsService],
})
export class QueueTicketsModule {}
