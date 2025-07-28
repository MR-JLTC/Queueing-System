// src/service-windows/service-windows.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceWindow } from './entities/service-window.entity';
import { CreateServiceWindowDto } from './dto/create-service-window.dto';
import { UpdateServiceWindowDto } from './dto/update-service-window.dto';
import { Branch } from '../branches/entities/branch.entity'; // Import Branch entity

@Injectable()
export class ServiceWindowsService {
  constructor(
    @InjectRepository(ServiceWindow)
    private serviceWindowsRepository: Repository<ServiceWindow>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createServiceWindowDto: CreateServiceWindowDto): Promise<ServiceWindow> {
    const { windowNumber, branchId, isActive, visibilityStatus } = createServiceWindowDto;

    const branch = await this.branchRepository.findOne({ where: { branchId } });
    if (!branch) {
      throw new BadRequestException(`Branch with ID ${branchId} not found.`);
    }

    const serviceWindow = this.serviceWindowsRepository.create({
      windowNumber,
      branch, // Assign the branch entity
      isActive: isActive !== undefined ? isActive : true,
      visibilityStatus: visibilityStatus || 'ON_LIVE',
      createdAt: new Date(),
    });
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
      throw new NotFoundException(`Service window with ID "${windowId}" not found`);
    }
    return serviceWindow;
  }

  async update(windowId: number, updateServiceWindowDto: UpdateServiceWindowDto): Promise<ServiceWindow> {
    const serviceWindow = await this.findOne(windowId);

    if (updateServiceWindowDto.branchId !== undefined) {
      const branch = await this.branchRepository.findOne({ where: { branchId: updateServiceWindowDto.branchId } });
      if (!branch) {
        throw new BadRequestException(`Branch with ID ${updateServiceWindowDto.branchId} not found.`);
      }
      serviceWindow.branch = branch;
      delete updateServiceWindowDto.branchId;
    }

    Object.assign(serviceWindow, updateServiceWindowDto);
    return this.serviceWindowsRepository.save(serviceWindow);
  }

  async remove(windowId: number): Promise<void> {
    const serviceWindow = await this.findOne(windowId);
    if (!serviceWindow) {
      throw new NotFoundException(`Service window with ID "${windowId}" not found`);
    }
    serviceWindow.visibilityStatus = 'ON_DELETE';
    serviceWindow.isActive = false;
    await this.serviceWindowsRepository.save(serviceWindow);
  }
}
