import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketStatus } from './entities/ticket-status.entity';
import { CreateTicketStatusDto } from './dto/create-ticket-status.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Injectable()
export class TicketStatusesService {
  constructor(
    @InjectRepository(TicketStatus)
    private ticketStatusesRepository: Repository<TicketStatus>,
  ) {}

  async create(createTicketStatusDto: CreateTicketStatusDto): Promise<TicketStatus> {
    const ticketStatus = this.ticketStatusesRepository.create(createTicketStatusDto);
    return this.ticketStatusesRepository.save(ticketStatus);
  }

  findAll(): Promise<TicketStatus[]> {
    return this.ticketStatusesRepository.find();
  }

  async findOne(statusId: number): Promise<TicketStatus> {
    const ticketStatus = await this.ticketStatusesRepository.findOne({ where: { statusId } });
    if (!ticketStatus) {
      throw new NotFoundException(`Ticket Status with ID "${statusId}" not found`);
    }
    return ticketStatus;
  }

  async update(statusId: number, updateTicketStatusDto: UpdateTicketStatusDto): Promise<TicketStatus> {
    const ticketStatus = await this.findOne(statusId);
    Object.assign(ticketStatus, updateTicketStatusDto);
    return this.ticketStatusesRepository.save(ticketStatus);
  }

  async remove(statusId: number): Promise<void> {
    const result = await this.ticketStatusesRepository.delete(statusId);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket Status with ID "${statusId}" not found`);
    }
  }
}