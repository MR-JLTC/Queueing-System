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

  create(createTicketStatusDto: CreateTicketStatusDto): Promise<TicketStatus> {
    const status = this.ticketStatusesRepository.create(createTicketStatusDto);
    return this.ticketStatusesRepository.save(status);
  }

  findAll(): Promise<TicketStatus[]> {
    return this.ticketStatusesRepository.find();
  }

  async findOne(statusCode: string): Promise<TicketStatus> {
    const status = await this.ticketStatusesRepository.findOne({ where: { statusCode } });
    if (!status) {
      throw new NotFoundException(`Ticket status with code "${statusCode}" not found`);
    }
    return status;
  }

  async update(statusCode: string, updateTicketStatusDto: UpdateTicketStatusDto): Promise<TicketStatus> {
    const status = await this.findOne(statusCode);
    Object.assign(status, updateTicketStatusDto);
    return this.ticketStatusesRepository.save(status);
  }

  async remove(statusCode: string): Promise<void> {
    const result = await this.ticketStatusesRepository.delete(statusCode);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket status with code "${statusCode}" not found`);
    }
  }
}