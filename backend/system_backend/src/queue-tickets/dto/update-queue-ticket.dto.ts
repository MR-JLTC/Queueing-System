import { PartialType } from '@nestjs/mapped-types';
import { CreateQueueTicketDto } from './create-queue-ticket.dto';

export class UpdateQueueTicketDto extends PartialType(CreateQueueTicketDto) {}
