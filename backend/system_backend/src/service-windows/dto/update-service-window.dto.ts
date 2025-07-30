import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceWindowDto } from './create-service-window.dto';
import { IsInt, IsOptional } from 'class-validator'; // Added IsInt for lastTicketNumber if updated directly

export class UpdateServiceWindowDto extends PartialType(CreateServiceWindowDto) {
  @IsOptional()
  @IsInt()
  lastTicketNumber?: number; // Added as optional for updates
}
