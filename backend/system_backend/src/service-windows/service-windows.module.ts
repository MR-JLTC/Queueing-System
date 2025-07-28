// src/service-windows/service-windows.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceWindowsService } from './service-windows.service';
import { ServiceWindowsController } from './service-windows.controller';
import { ServiceWindow } from './entities/service-window.entity';
import { Branch } from '../branches/entities/branch.entity'; // IMPORT Branch entity

@Module({
  imports: [TypeOrmModule.forFeature([ServiceWindow, Branch])], // ADD Branch to forFeature
  controllers: [ServiceWindowsController],
  providers: [ServiceWindowsService],
  exports: [ServiceWindowsService],
})
export class ServiceWindowsModule {}
