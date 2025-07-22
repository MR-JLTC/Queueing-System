import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketStatusesService } from './ticket-statuses.service';
import { TicketStatusesController } from './ticket-statuses.controller';
import { TicketStatus } from './entities/ticket-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketStatus])],
  controllers: [TicketStatusesController],
  providers: [TicketStatusesService],
  exports: [TicketStatusesService],
})
export class TicketStatusesModule {}
