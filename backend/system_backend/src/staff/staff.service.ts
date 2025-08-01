// src/staff/staff.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Branch } from '../branches/entities/branch.entity'; // Import Branch entity

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    const { fullName, branchId, isActive, visibilityStatus } = createStaffDto;

    // 1. Validate Branch
    const branch = await this.branchRepository.findOne({ where: { branchId } });
    if (!branch) {
      throw new BadRequestException(`Branch with ID ${branchId} not found.`);
    }

    // 2. Create the Staff profile
    const staff = this.staffRepository.create({
      fullName,
      branch: branch, // Link to the branch
      isActive: isActive !== undefined ? isActive : true,
      visibilityStatus: visibilityStatus || 'ON_LIVE',
      createdAt: new Date(),
    });

    return this.staffRepository.save(staff);
  }

  async findAll(branchId?: number): Promise<Staff[]> {
    const findOptions: FindManyOptions<Staff> = {
      relations: ['branch'], // Include branch details
      where: {},
    };

    if (branchId) {
      (findOptions.where as any).branch = { branchId: branchId };
    }

    (findOptions.where as any).visibilityStatus = 'ON_LIVE'; // Only show ON_LIVE staff profiles

    return this.staffRepository.find(findOptions);
  }

  async findOne(staffId: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { staffId },
      relations: ['branch'], // Only include branch
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID "${staffId}" not found`);
    }
    return staff;
  }

  // NEW/UPDATED METHOD: Find staff by full name, ensuring they are active and ON_LIVE
  async findOneByName(fullName: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: {
        fullName,
        isActive: true, // Ensure staff is active
        visibilityStatus: 'ON_LIVE', // Ensure staff is not soft-deleted
      },
      relations: ['branch'], // Include branch relation for completeness, though not strictly needed for this endpoint's return
    });
    if (!staff) {
      throw new NotFoundException(`Staff with full name "${fullName}" not found or is inactive/deleted.`);
    }
    return staff;
  }

  async update(staffId: number, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(staffId);

    // Update Staff profile
    if (updateStaffDto.branchId !== undefined) {
      const branch = await this.branchRepository.findOne({ where: { branchId: updateStaffDto.branchId } });
      if (!branch) {
        throw new BadRequestException(`Branch with ID ${updateStaffDto.branchId} not found.`);
      }
      staff.branch = branch;
      delete updateStaffDto.branchId; // Prevent direct assignment by Object.assign
    }

    Object.assign(staff, updateStaffDto);
    return this.staffRepository.save(staff);
  }

  async remove(staffId: number): Promise<void> {
    // Soft delete Staff profile
    const staff = await this.findOne(staffId);
    if (!staff) {
      throw new NotFoundException(`Staff with ID "${staffId}" not found`);
    }

    // Mark Staff profile as ON_DELETE
    staff.visibilityStatus = 'ON_DELETE';
    staff.isActive = false; // Also mark as inactive
    await this.staffRepository.save(staff);
  }
}
