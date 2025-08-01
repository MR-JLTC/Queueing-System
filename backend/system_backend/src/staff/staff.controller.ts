// src/staff/staff.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common'; // Import UsePipes and ValidationPipe
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffWindowAssignmentsService } from '../staff-window-assignments/staff-window-assignments.service';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly staffWindowAssignmentsService: StaffWindowAssignmentsService,
  ) {}

  // FIX: Add a specific ValidationPipe to ensure 'fullName' is treated as a string
  @Get('assignment-by-name')
  @UsePipes(new ValidationPipe({ transform: false })) // Crucial: disable transform for this route
  async getStaffAssignmentByName(@Query('fullName') fullName: string) {
    if (!fullName) {
      throw new NotFoundException('Full name is required.');
    }
    const staff = await this.staffService.findOneByName(fullName);
    const assignment = await this.staffWindowAssignmentsService.findActiveAssignmentByStaffId(staff.staffId);

    if (!assignment || !assignment.window || !assignment.window.branch) {
      throw new NotFoundException(`Staff "${fullName}" is not currently assigned to an active window or window/branch details are missing.`);
    }

    return {
      staffId: staff.staffId,
      fullName: staff.fullName,
      branchId: assignment.window.branch.branchId,
      branchName: assignment.window.branch.branchName,
      windowId: assignment.window.windowId,
      windowNumber: assignment.window.windowNumber,
      windowName: assignment.window.windowName,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  async findAll(@Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number) {
    return this.staffService.findAll(branchId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.staffService.remove(id);
  }
}
