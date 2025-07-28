// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { Branch } from '../branches/entities/branch.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { fullName, email, password, roleId, branchId, isActive, visibilityStatus } = createUserDto;

    const role = await this.rolesRepository.findOne({ where: { roleId } });
    if (!role) {
      throw new BadRequestException(`Role with ID ${roleId} not found.`);
    }

    if (branchId !== undefined && branchId !== null) { // Check if branchId is provided
        const branch = await this.branchRepository.findOne({ where: { branchId } });
        if (!branch) {
            throw new BadRequestException(`Branch with ID ${branchId} not found.`);
        }
    }

    // Check for existing user with the same email, but only if email is provided and not null
    if (email !== null && email !== undefined) {
      const existingUserByEmail = await this.usersRepository.findOne({ where: { email } });
      if (existingUserByEmail) {
          throw new BadRequestException(`Email '${email}' already exists.`);
      }
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      fullName,
      email: email === undefined ? null : email, // Ensure email is explicitly null if undefined
      passwordHash: hashedPassword,
      role: role,
      branchId: branchId === undefined ? null : branchId, // Ensure branchId is explicitly null if undefined
      isActive: isActive !== undefined ? isActive : true,
      visibilityStatus: visibilityStatus || 'ON_LIVE',
      createdAt: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async findAll(branchId?: number, roleId?: number): Promise<User[]> {
    const findOptions: FindManyOptions<User> = {
      relations: ['branch', 'role'],
      where: {},
    };

    if (branchId !== undefined && branchId !== null) {
      (findOptions.where as any).branch = { branchId: branchId };
    }
    if (roleId !== undefined && roleId !== null) {
      (findOptions.where as any).role = { roleId: roleId };
    }

    (findOptions.where as any).visibilityStatus = 'ON_LIVE';

    return this.usersRepository.find(findOptions);
  }

  async findOne(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { userId },
      relations: ['branch', 'role'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password;
    }

    if (updateUserDto.email !== undefined) {
        if (updateUserDto.email === '') { // If empty string is passed, set to null
            user.email = null;
            delete updateUserDto.email;
        } else if (updateUserDto.email !== user.email) {
            // Only check for existing email if the new email is not null and is different
            if (updateUserDto.email !== null) {
              const existingUser = await this.usersRepository.findOne({ where: { email: updateUserDto.email } });
              if (existingUser && existingUser.userId !== userId) {
                  throw new BadRequestException(`Email '${updateUserDto.email}' is already in use by another user.`);
              }
            }
            user.email = updateUserDto.email;
            delete updateUserDto.email;
        }
    }

    if (updateUserDto.branchId !== undefined) {
        if (updateUserDto.branchId === null) { // If null is passed, set to null
            user.branchId = null;
            user.branch = null;
            delete updateUserDto.branchId;
        } else {
            const branch = await this.branchRepository.findOne({ where: { branchId: updateUserDto.branchId } });
            if (!branch) {
                throw new BadRequestException(`Branch with ID ${updateUserDto.branchId} not found.`);
            }
            user.branch = branch;
            user.branchId = branch.branchId;
            delete updateUserDto.branchId;
        }
    }


    if (updateUserDto.isActive !== undefined) {
        user.isActive = updateUserDto.isActive;
        delete updateUserDto.isActive;
    }
    if (updateUserDto.visibilityStatus !== undefined) {
        user.visibilityStatus = updateUserDto.visibilityStatus;
        delete updateUserDto.visibilityStatus;
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(userId: number): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    user.visibilityStatus = 'ON_DELETE';
    user.isActive = false;
    await this.usersRepository.save(user);
  }
}
