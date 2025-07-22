import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(roleId: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }
    return role;
  }

  async update(roleId: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(roleId);
    Object.assign(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(roleId: number): Promise<void> {
    const result = await this.rolesRepository.delete(roleId);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }
  }
}
