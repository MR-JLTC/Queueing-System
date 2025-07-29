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
    const { windowNumber, windowName, branchId, isActive, visibilityStatus } = createServiceWindowDto; // Added windowName
    
    const branch = await this.branchRepository.findOne({ where: { branchId } });
    if (!branch) {
      throw new BadRequestException(`Branch with ID ${branchId} not found.`);
    }

    const serviceWindow = this.serviceWindowsRepository.create({
      windowNumber,
      windowName, // Assign windowName
      branch, // Assign the branch entity
      isActive: isActive !== undefined ? isActive : true,
      visibilityStatus: visibilityStatus || 'ON_LIVE',
      createdAt: new Date(),
    });
    return this.serviceWindowsRepository.save(serviceWindow);
  }

  // Modified findAll to accept an optional branchId for filtering
  async findAll(branchId?: number): Promise<ServiceWindow[]> {
    const findOptions: any = { relations: ['branch'] }; // Start with relations

    if (branchId) {
      // If branchId is provided, add a where clause to filter by branch.branchId
      findOptions.where = { branch: { branchId: branchId } };
    }
    
    // Perform the find operation with the constructed options
    return this.serviceWindowsRepository.find(findOptions);
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

    // Assign other properties including windowName if present
    Object.assign(serviceWindow, updateServiceWindowDto);
    return this.serviceWindowsRepository.save(serviceWindow);
  }

  async remove(windowId: number): Promise<void> {
    // Attempt to delete the service window directly
    const result = await this.serviceWindowsRepository.delete(windowId);
    if (result.affected === 0) {
      throw new NotFoundException(`Service window with ID "${windowId}" not found or already deleted.`);
    }
  }
}
