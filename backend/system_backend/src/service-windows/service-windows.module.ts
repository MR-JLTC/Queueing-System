import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceWindowsService } from './service-windows.service';
import { ServiceWindowsController } from './service-windows.controller';
import { ServiceWindow } from './entities/service-window.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceWindow])],
  controllers: [ServiceWindowsController],
  providers: [ServiceWindowsService],
  exports: [ServiceWindowsService],
})
export class ServiceWindowsModule {}