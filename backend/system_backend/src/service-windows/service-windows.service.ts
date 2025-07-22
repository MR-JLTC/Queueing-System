import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceWindow } from './entities/service-window.entity';
import { CreateServiceWindowDto } from './dto/create-service-window.dto';
import { UpdateServiceWindowDto } from './dto/update-service-window.dto';

@Injectable()
export class ServiceWindowsService {
  constructor(
    @InjectRepository(ServiceWindow)
    private serviceWindowsRepository: Repository<ServiceWindow>,
  ) {}

  create(createServiceWindowDto: CreateServiceWindowDto): Promise<ServiceWindow> {
    const window = this.serviceWindowsRepository.create(createServiceWindowDto);
    return this.serviceWindowsRepository.save(window);
  }

  findAll(): Promise<ServiceWindow[]> {
    return this.serviceWindowsRepository.find();
  }

  async findOne(windowId: number): Promise<ServiceWindow> {
    const window = await this.serviceWindowsRepository.findOne({ where: { windowId } });
    if (!window) {
      throw new NotFoundException(`Service window with ID "${windowId}" not found`);
    }
    return window;
  }

  async update(windowId: number, updateServiceWindowDto: UpdateServiceWindowDto): Promise<ServiceWindow> {
    const window = await this.findOne(windowId);
    Object.assign(window, updateServiceWindowDto);
    return this.serviceWindowsRepository.save(window);
  }

  async remove(windowId: number): Promise<void> {
    const result = await this.serviceWindowsRepository.delete(windowId);
    if (result.affected === 0) {
      throw new NotFoundException(`Service window with ID "${windowId}" not found`);
    }
  }
}