// src/staff/staff.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { Staff } from './entities/staff.entity';
import { Branch } from '../branches/entities/branch.entity'; // Needed for StaffService to link staff to branch
import { StaffWindowAssignmentsModule } from '../staff-window-assignments/staff-window-assignments.module'; // Import this module

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, Branch]), // Only Staff and Branch are needed here for StaffService
    StaffWindowAssignmentsModule, // Import this module so StaffController can inject StaffWindowAssignmentsService
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
