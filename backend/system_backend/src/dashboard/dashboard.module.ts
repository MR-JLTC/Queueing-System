import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

// Import all entities that the dashboard service will interact with
import { QueueTicket } from '../queue-tickets/entities/queue-ticket.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity';
import { User } from '../users/entities/user.entity'; // For staff details
import { Branch } from '../branches/entities/branch.entity'; // For branch details
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { CustomerCategory } from '../customer-categories/entities/customer-category.entity';
import { TicketStatusHistory } from '../ticket-status-history/entities/ticket-status-history.entity';
import { StaffWindowAssignment } from '../staff-window-assignments/entities/staff-window-assignment.entity';

@Module({
  imports: [
    // Register all repositories that DashboardService will need to query
    TypeOrmModule.forFeature([
      QueueTicket,
      ServiceWindow,
      User,
      Branch,
      TicketStatus,
      CustomerCategory,
      TicketStatusHistory,
      StaffWindowAssignment,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService], // Export if other modules might need to inject DashboardService
})
export class DashboardModule {}