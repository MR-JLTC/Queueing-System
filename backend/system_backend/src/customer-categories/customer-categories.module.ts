import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCategoriesService } from './customer-categories.service';
import { CustomerCategoriesController } from './customer-categories.controller';
import { CustomerCategory } from './entities/customer-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerCategory])],
  controllers: [CustomerCategoriesController],
  providers: [CustomerCategoriesService],
  exports: [CustomerCategoriesService],
})
export class CustomerCategoriesModule {}