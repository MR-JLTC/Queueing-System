import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchesRepository.create(createBranchDto);
    return this.branchesRepository.save(branch);
  }

  findAll(): Promise<Branch[]> {
    return this.branchesRepository.find();
  }

  async findOne(branchId: number): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({ where: { branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID "${branchId}" not found`);
    }
    return branch;
  }

  async update(branchId: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(branchId);
    Object.assign(branch, updateBranchDto);
    return this.branchesRepository.save(branch);
  }

  async remove(branchId: number): Promise<void> {
    const result = await this.branchesRepository.delete(branchId);
    if (result.affected === 0) {
      throw new NotFoundException(`Branch with ID "${branchId}" not found`);
    }
  }
}