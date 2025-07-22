import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerCategory } from './entities/customer-category.entity';
import { CreateCustomerCategoryDto } from './dto/create-customer-category.dto';
import { UpdateCustomerCategoryDto } from './dto/update-customer-category.dto';

@Injectable()
export class CustomerCategoriesService {
  constructor(
    @InjectRepository(CustomerCategory)
    private customerCategoriesRepository: Repository<CustomerCategory>,
  ) {}

  create(createCustomerCategoryDto: CreateCustomerCategoryDto): Promise<CustomerCategory> {
    const category = this.customerCategoriesRepository.create(createCustomerCategoryDto);
    return this.customerCategoriesRepository.save(category);
  }

  findAll(): Promise<CustomerCategory[]> {
    return this.customerCategoriesRepository.find();
  }

  async findOne(categoryId: number): Promise<CustomerCategory> {
    const category = await this.customerCategoriesRepository.findOne({ where: { categoryId } });
    if (!category) {
      throw new NotFoundException(`Customer category with ID "${categoryId}" not found`);
    }
    return category;
  }

  async update(categoryId: number, updateCustomerCategoryDto: UpdateCustomerCategoryDto): Promise<CustomerCategory> {
    const category = await this.findOne(categoryId);
    Object.assign(category, updateCustomerCategoryDto);
    return this.customerCategoriesRepository.save(category);
  }

  async remove(categoryId: number): Promise<void> {
    const result = await this.customerCategoriesRepository.delete(categoryId);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer category with ID "${categoryId}" not found`);
    }
  }
}