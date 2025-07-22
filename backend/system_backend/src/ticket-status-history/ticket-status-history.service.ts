import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketStatusHistory } from './entities/ticket-status-history.entity';
import { CreateTicketStatusHistoryDto } from './dto/create-ticket-status-history.dto';
import { UpdateTicketStatusHistoryDto } from './dto/update-ticket-status-history.dto';

@Injectable()
export class TicketStatusHistoryService {
  constructor(
    @InjectRepository(TicketStatusHistory)
    private ticketStatusHistoryRepository: Repository<TicketStatusHistory>,
  ) {}

  create(createTicketStatusHistoryDto: CreateTicketStatusHistoryDto): Promise<TicketStatusHistory> {
    const history = this.ticketStatusHistoryRepository.create(createTicketStatusHistoryDto);
    return this.ticketStatusHistoryRepository.save(history);
  }

  findAll(): Promise<TicketStatusHistory[]> {
    return this.ticketStatusHistoryRepository.find();
  }

  async findOne(historyId: number): Promise<TicketStatusHistory> {
    const history = await this.ticketStatusHistoryRepository.findOne({ where: { historyId } });
    if (!history) {
      throw new NotFoundException(`Ticket status history with ID "${historyId}" not found`);
    }
    return history;
  }

  async update(historyId: number, updateTicketStatusHistoryDto: UpdateTicketStatusHistoryDto): Promise<TicketStatusHistory> {
    const history = await this.findOne(historyId);
    Object.assign(history, updateTicketStatusHistoryDto);
    return this.ticketStatusHistoryRepository.save(history);
  }

  async remove(historyId: number): Promise<void> {
    const result = await this.ticketStatusHistoryRepository.delete(historyId);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket status history with ID "${historyId}" not found`);
    }
  }
}
