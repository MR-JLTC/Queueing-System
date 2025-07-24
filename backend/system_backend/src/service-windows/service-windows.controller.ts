import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ServiceWindowsService } from './service-windows.service';
import { CreateServiceWindowDto } from './dto/create-service-window.dto';
import { UpdateServiceWindowDto } from './dto/update-service-window.dto';

@Controller('service-windows')
export class ServiceWindowsController {
  constructor(private readonly serviceWindowsService: ServiceWindowsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceWindowDto: CreateServiceWindowDto) {
    return this.serviceWindowsService.create(createServiceWindowDto);
  }

  @Get()
  findAll() {
    return this.serviceWindowsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceWindowsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceWindowDto: UpdateServiceWindowDto) {
    return this.serviceWindowsService.update(+id, updateServiceWindowDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.serviceWindowsService.remove(+id);
  }
}