import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query, Optional, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number,
    @Query('roleId', new ParseIntPipe({ optional: true })) roleId?: number,
  ) {
    return this.usersService.findAll(branchId, roleId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmailExists(@Body('email') email: string): Promise<{ exists: boolean }> {
    const user = await this.usersService.findByEmail(email);
    return { exists: !!user }; // Returns true if user exists, false otherwise
  }

  // NEW ENDPOINT: Directly reset password by email
  @Post('reset-password-by-email')
  @HttpCode(HttpStatus.OK)
  async resetPasswordByEmail(
    @Body('email') email: string,
    @Body('password') newPassword: string,
  ) {
    if (!email || !newPassword) {
      throw new BadRequestException('Email and new password are required.');
    }
    return this.usersService.resetPasswordByEmail(email, newPassword);
  }
}
