// src/staff/staff.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { Staff } from './entities/staff.entity';
import { Branch } from '../branches/entities/branch.entity'; // Needed for StaffService to link staff to branch

@Module({
  imports: [TypeOrmModule.forFeature([Staff, Branch])], // Only Staff and Branch are needed here
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
