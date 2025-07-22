import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerCategoriesService } from './customer-categories.service';
import { CreateCustomerCategoryDto } from './dto/create-customer-category.dto';
import { UpdateCustomerCategoryDto } from './dto/update-customer-category.dto';

@Controller('customer-categories')
export class CustomerCategoriesController {
  constructor(private readonly customerCategoriesService: CustomerCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomerCategoryDto: CreateCustomerCategoryDto) {
    return this.customerCategoriesService.create(createCustomerCategoryDto);
  }

  @Get()
  findAll() {
    return this.customerCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerCategoryDto: UpdateCustomerCategoryDto) {
    return this.customerCategoriesService.update(+id, updateCustomerCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customerCategoriesService.remove(+id);
  }
}