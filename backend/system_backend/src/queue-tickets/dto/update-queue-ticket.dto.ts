import { PartialType } from '@nestjs/mapped-types';
import { CreateQueueTicketDto } from './create-queue-ticket.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateQueueTicketDto extends PartialType(CreateQueueTicketDto) {
  @IsOptional()
  @IsInt()
  currentStatusId?: number; // Allow updating the status ID
}