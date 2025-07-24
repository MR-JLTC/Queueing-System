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

  async create(createTicketStatusHistoryDto: CreateTicketStatusHistoryDto): Promise<TicketStatusHistory> {
    const historyEntry = this.ticketStatusHistoryRepository.create(createTicketStatusHistoryDto);
    return this.ticketStatusHistoryRepository.save(historyEntry);
  }

  findAll(): Promise<TicketStatusHistory[]> {
    return this.ticketStatusHistoryRepository.find({ relations: ['queueTicket', 'changedBy'] });
  }

  async findOne(historyId: number): Promise<TicketStatusHistory> {
    const historyEntry = await this.ticketStatusHistoryRepository.findOne({
      where: { historyId },
      relations: ['queueTicket', 'changedBy'],
    });
    if (!historyEntry) {
      throw new NotFoundException(`Ticket Status History entry with ID "${historyId}" not found`);
    }
    return historyEntry;
  }

  async update(historyId: number, updateTicketStatusHistoryDto: UpdateTicketStatusHistoryDto): Promise<TicketStatusHistory> {
    const historyEntry = await this.findOne(historyId);
    Object.assign(historyEntry, updateTicketStatusHistoryDto);
    return this.ticketStatusHistoryRepository.save(historyEntry);
  }

  async remove(historyId: number): Promise<void> {
    const result = await this.ticketStatusHistoryRepository.delete(historyId);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket Status History entry with ID "${historyId}" not found`);
    }
  }
}