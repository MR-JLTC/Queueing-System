import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffWindowAssignment } from './entities/staff-window-assignment.entity';
import { CreateStaffWindowAssignmentDto } from './dto/create-staff-window-assignment.dto';
import { UpdateStaffWindowAssignmentDto } from './dto/update-staff-window-assignment.dto';

@Injectable()
export class StaffWindowAssignmentsService {
  constructor(
    @InjectRepository(StaffWindowAssignment)
    private staffWindowAssignmentsRepository: Repository<StaffWindowAssignment>,
  ) {}

  async create(createStaffWindowAssignmentDto: CreateStaffWindowAssignmentDto): Promise<StaffWindowAssignment> {
    const assignment = this.staffWindowAssignmentsRepository.create(createStaffWindowAssignmentDto);
    return this.staffWindowAssignmentsRepository.save(assignment);
  }

  findAll(): Promise<StaffWindowAssignment[]> {
    return this.staffWindowAssignmentsRepository.find({ relations: ['staff', 'window'] });
  }

  async findOne(assignmentId: number): Promise<StaffWindowAssignment> {
    const assignment = await this.staffWindowAssignmentsRepository.findOne({
      where: { assignmentId },
      relations: ['staff', 'window'],
    });
    if (!assignment) {
      throw new NotFoundException(`Staff Window Assignment with ID "${assignmentId}" not found`);
    }
    return assignment;
  }

  async update(assignmentId: number, updateStaffWindowAssignmentDto: UpdateStaffWindowAssignmentDto): Promise<StaffWindowAssignment> {
    const assignment = await this.findOne(assignmentId);
    Object.assign(assignment, updateStaffWindowAssignmentDto);
    return this.staffWindowAssignmentsRepository.save(assignment);
  }

  async remove(assignmentId: number): Promise<void> {
    const result = await this.staffWindowAssignmentsRepository.delete(assignmentId);
    if (result.affected === 0) {
      throw new NotFoundException(`Staff Window Assignment with ID "${assignmentId}" not found`);
    }
  }
}