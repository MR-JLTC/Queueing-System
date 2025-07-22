import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffWindowAssignmentsService } from './staff-window-assignments.service';
import { StaffWindowAssignmentsController } from './staff-window-assignments.controller';
import { StaffWindowAssignment } from './entities/staff-window-assignment.entity';
import { User } from '../users/entities/user.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaffWindowAssignment, User, ServiceWindow])],
  controllers: [StaffWindowAssignmentsController],
  providers: [StaffWindowAssignmentsService],
  exports: [StaffWindowAssignmentsService],
})
export class StaffWindowAssignmentsModule {}
