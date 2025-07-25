// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });
    return this.usersRepository.save(user);
  }

  // MODIFIED: Added relations to include 'branch' and 'role'
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['branch', 'role'], // Include the 'branch' and 'role' relations
      // You might also want to order them, e.g., order: { userId: 'ASC' }
    });
  }

  async findOne(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { userId },
      relations: ['branch', 'role'], // Include relations for findOne as well
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId); // findOne already loads relations

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      // Ensure password field is not directly assigned from DTO if it exists
      // as we're handling passwordHash separately.
      delete (updateUserDto as any).password;
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(userId: number): Promise<void> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
  }
}
