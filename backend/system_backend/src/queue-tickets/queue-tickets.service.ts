import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueTicket } from './entities/queue-ticket.entity';
import { CreateQueueTicketDto } from './dto/create-queue-ticket.dto';
import { UpdateQueueTicketDto } from './dto/update-queue-ticket.dto';
import { TicketStatus } from './../ticket-statuses/entities/ticket-status.entity'; // <--- Corrected Import
import { TicketStatusHistoryService } from './../ticket-status-history/ticket-status-history.service'; // Assuming this service exists

@Injectable()
export class QueueTicketsService {
  constructor(
    @InjectRepository(QueueTicket)
    private queueTicketsRepository: Repository<QueueTicket>,
    @InjectRepository(TicketStatus) // Inject TicketStatus Repository to fetch status entities
    private ticketStatusesRepository: Repository<TicketStatus>,
    private ticketStatusHistoryService: TicketStatusHistoryService, // Inject history service
  ) {}

  async create(createQueueTicketDto: CreateQueueTicketDto): Promise<QueueTicket> {
    const { currentStatusId, ...ticketData } = createQueueTicketDto;

    const initialStatus = await this.ticketStatusesRepository.findOne({ where: { statusId: currentStatusId } });
    if (!initialStatus) {
      throw new BadRequestException(`Initial Ticket Status with ID "${currentStatusId}" not found`);
    }

    const ticket = this.queueTicketsRepository.create({
      ...ticketData,
      currentStatus: initialStatus, // Assign the fetched entity
    });

    const savedTicket = await this.queueTicketsRepository.save(ticket);

    // Record initial status history
    await this.ticketStatusHistoryService.create({
      ticketId: savedTicket.ticketId,
      oldStatusId: null, // No old status for creation
      newStatusId: initialStatus.statusId,
      relatedStatusId: initialStatus.statusId, // For the 'status' relationship
      // changedById: /* Get current user ID from request, if available */
    });

    return savedTicket;
  }

  findAll(): Promise<QueueTicket[]> {
    return this.queueTicketsRepository.find({
      relations: ['branch', 'window', 'assignedToStaff', 'category', 'currentStatus'],
    });
  }

  async findOne(ticketId: number): Promise<QueueTicket> {
    const ticket = await this.queueTicketsRepository.findOne({
      where: { ticketId },
      relations: ['branch', 'window', 'assignedToStaff', 'category', 'currentStatus', 'statusHistory'],
    });
    if (!ticket) {
      throw new NotFoundException(`Queue Ticket with ID "${ticketId}" not found`);
    }
    return ticket;
  }

  async update(ticketId: number, updateQueueTicketDto: UpdateQueueTicketDto): Promise<QueueTicket> {
    const ticket = await this.findOne(ticketId);
    Object.assign(ticket, updateQueueTicketDto);

    // If currentStatusId is provided in DTO, update the relation
    if (updateQueueTicketDto.currentStatusId !== undefined) {
      const newStatus = await this.ticketStatusesRepository.findOne({ where: { statusId: updateQueueTicketDto.currentStatusId } });
      if (!newStatus) {
        throw new BadRequestException(`New Ticket Status with ID "${updateQueueTicketDto.currentStatusId}" not found`);
      }
      ticket.currentStatus = newStatus; // Assign the new status entity
    }

    return this.queueTicketsRepository.save(ticket);
  }

  async remove(ticketId: number): Promise<void> {
    const result = await this.queueTicketsRepository.delete(ticketId);
    if (result.affected === 0) {
      throw new NotFoundException(`Queue Ticket with ID "${ticketId}" not found`);
    }
  }

  async updateTicketStatus(ticketId: number, newStatusId: number): Promise<QueueTicket> {
    const ticket = await this.queueTicketsRepository.findOne({ where: { ticketId }, relations: ['currentStatus'] });
    if (!ticket) {
      throw new NotFoundException(`Queue Ticket with ID "${ticketId}" not found`);
    }

    const oldStatusId = ticket.currentStatus ? ticket.currentStatus.statusId : null;

    const newStatus = await this.ticketStatusesRepository.findOne({ where: { statusId: newStatusId } });
    if (!newStatus) {
      throw new BadRequestException(`New Ticket Status with ID "${newStatusId}" not found`);
    }

    // RESOLVES: Property 'status' does not exist on type 'QueueTicket'.
    // Use 'currentStatus' property as defined in the entity.
    ticket.currentStatus = newStatus;

    const updatedTicket = await this.queueTicketsRepository.save(ticket);

    // Record status change in history
    await this.ticketStatusHistoryService.create({
      ticketId: updatedTicket.ticketId,
      oldStatusId: oldStatusId,
      newStatusId: newStatus.statusId,
      relatedStatusId: newStatus.statusId, // For the 'status' relationship in history
      // changedById: /* Get current user ID from request, if available */
    });

    return updatedTicket;
  }
}