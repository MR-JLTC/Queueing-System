import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { EmailOtpModule } from './email-otp/email-otp.module';
import { CustomerCategoriesModule } from './customer-categories/customer-categories.module';
import { TicketStatusesModule } from './ticket-statuses/ticket-statuses.module';
import { ServiceWindowsModule } from './service-windows/service-windows.module';
import { StaffWindowAssignmentsModule } from './staff-window-assignments/staff-window-assignments.module';
import { QueueTicketsModule } from './queue-tickets/queue-tickets.module';
import { TicketStatusHistoryModule } from './ticket-status-history/ticket-status-history.module';
import { DailyQueueSummaryModule } from './daily-queue-summary/daily-queue-summary.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
    RolesModule,
    EmailOtpModule,
    CustomerCategoriesModule,
    TicketStatusesModule,
    ServiceWindowsModule,
    StaffWindowAssignmentsModule,
    QueueTicketsModule,
    TicketStatusHistoryModule,
    DailyQueueSummaryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}