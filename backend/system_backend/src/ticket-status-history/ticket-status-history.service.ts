// src/ticket-status-history/ticket-status-history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'; // Added NotFoundException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketStatusHistory } from './entities/ticket-status-history.entity';
import { CreateTicketStatusHistoryDto } from './dto/create-ticket-status-history.dto';

@Injectable()
export class TicketStatusHistoryService {
  constructor(
    @InjectRepository(TicketStatusHistory)
    private ticketStatusHistoryRepository: Repository<TicketStatusHistory>,
  ) {}

  async create(createTicketStatusHistoryDto: CreateTicketStatusHistoryDto): Promise<TicketStatusHistory> {
    const historyEntry = this.ticketStatusHistoryRepository.create({
      ...createTicketStatusHistoryDto,
      // Ensure nullable fields are explicitly set to null if undefined
      oldStatusId: createTicketStatusHistoryDto.oldStatusId === undefined ? null : createTicketStatusHistoryDto.oldStatusId,
      changedByUserId: createTicketStatusHistoryDto.changedByUserId === undefined ? null : createTicketStatusHistoryDto.changedByUserId,
      relatedStatusId: createTicketStatusHistoryDto.relatedStatusId === undefined ? null : createTicketStatusHistoryDto.relatedStatusId,
      changedAt: createTicketStatusHistoryDto.changeTimestamp || new Date(), // Corrected property name
    });
    return this.ticketStatusHistoryRepository.save(historyEntry);
  }

  findAll(): Promise<TicketStatusHistory[]> {
    return this.ticketStatusHistoryRepository.find();
  }

  async findOne(id: number): Promise<TicketStatusHistory> {
    const historyEntry = await this.ticketStatusHistoryRepository.findOne({ where: { historyId: id } });
    if (!historyEntry) { // Added null check
      throw new NotFoundException(`Ticket status history with ID "${id}" not found`);
    }
    return historyEntry;
  }

  // Removed the update method from here as well, consistent with controller
  // async update(id: number, updateTicketStatusHistoryDto: UpdateTicketStatusHistoryDto): Promise<TicketStatusHistory> {
  //   const historyEntry = await this.findOne(id);
  //   if (!historyEntry) {
  //     throw new NotFoundException(`Ticket status history with ID ${id} not found`);
  //   }
  //   Object.assign(historyEntry, updateTicketStatusHistoryDto);
  //   return this.ticketStatusHistoryRepository.save(historyEntry);
  // }

  async remove(id: number): Promise<void> {
    const result = await this.ticketStatusHistoryRepository.delete(id);
    if (result.affected === 0) { // Added check for deletion
      throw new NotFoundException(`Ticket status history with ID "${id}" not found`);
    }
  }
}
