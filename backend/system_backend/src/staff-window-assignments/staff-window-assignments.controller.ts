import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { StaffWindowAssignmentsService } from './staff-window-assignments.service';
import { CreateStaffWindowAssignmentDto } from './dto/create-staff-window-assignment.dto';
import { UpdateStaffWindowAssignmentDto } from './dto/update-staff-window-assignment.dto';

@Controller('staff-window-assignments')
export class StaffWindowAssignmentsController {
  constructor(private readonly staffWindowAssignmentsService: StaffWindowAssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStaffWindowAssignmentDto: CreateStaffWindowAssignmentDto) {
    return this.staffWindowAssignmentsService.create(createStaffWindowAssignmentDto);
  }

  @Get()
  findAll() {
    return this.staffWindowAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffWindowAssignmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffWindowAssignmentDto: UpdateStaffWindowAssignmentDto) {
    return this.staffWindowAssignmentsService.update(+id, updateStaffWindowAssignmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.staffWindowAssignmentsService.remove(+id);
  }
}