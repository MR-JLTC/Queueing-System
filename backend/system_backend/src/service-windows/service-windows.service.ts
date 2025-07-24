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

  async create(createServiceWindowDto: CreateServiceWindowDto): Promise<ServiceWindow> {
    const serviceWindow = this.serviceWindowsRepository.create(createServiceWindowDto);
    return this.serviceWindowsRepository.save(serviceWindow);
  }

  findAll(): Promise<ServiceWindow[]> {
    return this.serviceWindowsRepository.find({ relations: ['branch'] });
  }

  async findOne(windowId: number): Promise<ServiceWindow> {
    const serviceWindow = await this.serviceWindowsRepository.findOne({
      where: { windowId },
      relations: ['branch'],
    });
    if (!serviceWindow) {
      throw new NotFoundException(`Service Window with ID "${windowId}" not found`);
    }
    return serviceWindow;
  }

  async update(windowId: number, updateServiceWindowDto: UpdateServiceWindowDto): Promise<ServiceWindow> {
    const serviceWindow = await this.findOne(windowId);
    Object.assign(serviceWindow, updateServiceWindowDto);
    return this.serviceWindowsRepository.save(serviceWindow);
  }

  async remove(windowId: number): Promise<void> {
    const result = await this.serviceWindowsRepository.delete(windowId);
    if (result.affected === 0) {
      throw new NotFoundException(`Service Window with ID "${windowId}" not found`);
    }
  }
}