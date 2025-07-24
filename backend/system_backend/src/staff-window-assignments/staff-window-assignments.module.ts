import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffWindowAssignmentsService } from './staff-window-assignments.service';
import { StaffWindowAssignmentsController } from './staff-window-assignments.controller';
import { StaffWindowAssignment } from './entities/staff-window-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaffWindowAssignment])],
  controllers: [StaffWindowAssignmentsController],
  providers: [StaffWindowAssignmentsService],
  exports: [StaffWindowAssignmentsService],
})
export class StaffWindowAssignmentsModule {}