import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketStatusHistoryDto } from './create-ticket-status-history.dto';

export class UpdateTicketStatusHistoryDto extends PartialType(CreateTicketStatusHistoryDto) {}
