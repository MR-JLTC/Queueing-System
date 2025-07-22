import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueTicket } from './entities/queue-ticket.entity';
import { CreateQueueTicketDto } from './dto/create-queue-ticket.dto';
import { UpdateQueueTicketDto } from './dto/update-queue-ticket.dto';

@Injectable()
export class QueueTicketsService {
  constructor(
    @InjectRepository(QueueTicket)
    private queueTicketsRepository: Repository<QueueTicket>,
  ) {}

  create(createQueueTicketDto: CreateQueueTicketDto): Promise<QueueTicket> {
    const ticket = this.queueTicketsRepository.create(createQueueTicketDto);
    return this.queueTicketsRepository.save(ticket);
  }

  findAll(): Promise<QueueTicket[]> {
    return this.queueTicketsRepository.find();
  }

  async findOne(ticketId: number): Promise<QueueTicket> {
    const ticket = await this.queueTicketsRepository.findOne({ where: { ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Queue ticket with ID "${ticketId}" not found`);
    }
    return ticket;
  }

  async update(ticketId: number, updateQueueTicketDto: UpdateQueueTicketDto): Promise<QueueTicket> {
    const ticket = await this.findOne(ticketId);
    Object.assign(ticket, updateQueueTicketDto);
    return this.queueTicketsRepository.save(ticket);
  }

  async remove(ticketId: number): Promise<void> {
    const result = await this.queueTicketsRepository.delete(ticketId);
    if (result.affected === 0) {
      throw new NotFoundException(`Queue ticket with ID "${ticketId}" not found`);
    }
  }
}