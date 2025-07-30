// src/queue-tickets/queue-tickets.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueTicket } from './entities/queue-ticket.entity';
import { CreateQueueTicketDto } from './dto/create-queue-ticket.dto';
import { UpdateQueueTicketDto } from './dto/update-queue-ticket.dto';
import { Branch } from '../branches/entities/branch.entity';
import { CustomerCategory } from '../customer-categories/entities/customer-category.entity';
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity'; // Import ServiceWindow
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class QueueTicketsService {
  constructor(
    @InjectRepository(QueueTicket)
    private queueTicketRepository: Repository<QueueTicket>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(CustomerCategory)
    private customerCategoryRepository: Repository<CustomerCategory>,
    @InjectRepository(TicketStatus)
    private ticketStatusRepository: Repository<TicketStatus>,
    @InjectRepository(ServiceWindow) // Inject ServiceWindow Repository
    private serviceWindowRepository: Repository<ServiceWindow>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createQueueTicketDto: CreateQueueTicketDto): Promise<QueueTicket> {
    const {
      customerName,
      categoryId,
      branchId,
      currentStatusId,
      assignedToWindowId,
      assignedToStaffId,
      serviceType,
      queuedAt,
      issuedByUserId,
      calledAt,
      servedAt,
      cancelledById,
      visibilityStatus,
    } = createQueueTicketDto;

    // Validate relationships
    const branch = await this.branchRepository.findOne({ where: { branchId } });
    if (!branch) throw new BadRequestException(`Branch with ID ${branchId} not found.`);

    const category = await this.customerCategoryRepository.findOne({ where: { categoryId } });
    if (!category) throw new BadRequestException(`Customer category with ID ${categoryId} not found.`);

    const currentStatus = await this.ticketStatusRepository.findOne({ where: { statusId: currentStatusId } });
    if (!currentStatus) throw new BadRequestException(`Ticket status with ID ${currentStatusId} not found.`);

    let assignedToWindow: ServiceWindow | null = null;
    if (assignedToWindowId !== undefined && assignedToWindowId !== null) {
      assignedToWindow = await this.serviceWindowRepository.findOne({ where: { windowId: assignedToWindowId } });
      if (!assignedToWindow) throw new BadRequestException(`Service window with ID ${assignedToWindowId} not found.`);
    }

    let assignedToStaff: Staff | null = null;
    if (assignedToStaffId !== undefined && assignedToStaffId !== null) {
      assignedToStaff = await this.staffRepository.findOne({ where: { staffId: assignedToStaffId } });
      if (!assignedToStaff) throw new BadRequestException(`Staff with ID ${assignedToStaffId} not found.`);
    }

    let issuedBy: User | null = null;
    if (issuedByUserId !== undefined && issuedByUserId !== null) {
      issuedBy = await this.userRepository.findOne({ where: { userId: issuedByUserId } });
      if (!issuedBy) throw new BadRequestException(`User (issuedBy) with ID ${issuedByUserId} not found.`);
    }

    let cancelledBy: User | null = null;
    if (cancelledById !== undefined && cancelledById !== null) {
      cancelledBy = await this.userRepository.findOne({ where: { userId: cancelledById } });
      if (!cancelledBy) throw new BadRequestException(`User (cancelledBy) with ID ${cancelledById} not found.`);
    }

    // --- Generate a unique sequential ticket number per window ---
    let generatedTicketNumber: string;
    if (assignedToWindow) {
      // Increment the last ticket number for this specific window
      assignedToWindow.lastTicketNumber = (assignedToWindow.lastTicketNumber || 0) + 1;

      // Determine a prefix based on window name (e.g., 'P' for Payment, 'L' for Loan)
      const prefix = assignedToWindow.windowName
        ? assignedToWindow.windowName.substring(0, 1).toUpperCase()
        : `W${assignedToWindow.windowNumber}`; // Fallback to Window + Number if no name

      // Pad the number with leading zeros (e.g., 001, 002)
      const paddedNumber = String(assignedToWindow.lastTicketNumber).padStart(3, '0'); // Ensures 3 digits

      generatedTicketNumber = `${prefix}-${paddedNumber}`;

      // Save the updated lastTicketNumber back to the ServiceWindow entity
      await this.serviceWindowRepository.save(assignedToWindow);
    } else {
      // Fallback for cases where assignedToWindow is not provided (should ideally not happen if required)
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const timePart = new Date().getTime();
      generatedTicketNumber = `GEN-${datePart}-${timePart}`;
    }
    // --- End Ticket Number Generation ---

    const newQueueTicket = new QueueTicket();
    newQueueTicket.ticketNumber = generatedTicketNumber; // Assign the generated ticket number
    newQueueTicket.customerName = customerName;
    newQueueTicket.category = category;
    newQueueTicket.branch = branch;
    newQueueTicket.currentStatus = currentStatus;
    newQueueTicket.assignedToWindow = assignedToWindow;
    newQueueTicket.assignedToStaff = assignedToStaff;
    newQueueTicket.serviceType = serviceType === undefined ? null : serviceType;
    newQueueTicket.queuedAt = queuedAt || new Date();
    newQueueTicket.issuedBy = issuedBy;
    newQueueTicket.calledAt = calledAt || null;
    newQueueTicket.servedAt = servedAt || null;
    newQueueTicket.cancelledBy = cancelledBy;
    newQueueTicket.visibilityStatus = visibilityStatus || 'ON_LIVE';

    return this.queueTicketRepository.save(newQueueTicket);
  }

  findAll(): Promise<QueueTicket[]> {
    return this.queueTicketRepository.find({
      relations: ['branch', 'category', 'currentStatus', 'assignedToWindow', 'assignedToStaff', 'issuedBy', 'cancelledBy'],
    });
  }

  async findOne(ticketId: number): Promise<QueueTicket> {
    const ticket = await this.queueTicketRepository.findOne({
      where: { ticketId },
      relations: ['branch', 'category', 'currentStatus', 'assignedToWindow', 'assignedToStaff', 'issuedBy', 'cancelledBy'],
    });
    if (!ticket) {
      throw new NotFoundException(`Queue ticket with ID "${ticketId}" not found`);
    }
    return ticket;
  }

  async update(ticketId: number, updateQueueTicketDto: UpdateQueueTicketDto): Promise<QueueTicket> {
    const ticket = await this.findOne(ticketId);

    // Update relationships if IDs are provided
    if (updateQueueTicketDto.categoryId !== undefined) {
      const category = await this.customerCategoryRepository.findOne({ where: { categoryId: updateQueueTicketDto.categoryId } });
      if (!category) throw new BadRequestException(`Customer category with ID ${updateQueueTicketDto.categoryId} not found.`);
      ticket.category = category;
      delete updateQueueTicketDto.categoryId;
    }

    if (updateQueueTicketDto.branchId !== undefined) {
      const branch = await this.branchRepository.findOne({ where: { branchId: updateQueueTicketDto.branchId } });
      if (!branch) throw new BadRequestException(`Branch with ID ${updateQueueTicketDto.branchId} not found.`);
      ticket.branch = branch;
      delete updateQueueTicketDto.branchId;
    }

    if (updateQueueTicketDto.currentStatusId !== undefined) {
      const currentStatus = await this.ticketStatusRepository.findOne({ where: { statusId: updateQueueTicketDto.currentStatusId } });
      if (!currentStatus) throw new BadRequestException(`Ticket status with ID ${updateQueueTicketDto.currentStatusId} not found.`);
      ticket.currentStatus = currentStatus;
      delete updateQueueTicketDto.currentStatusId;
    }

    if (updateQueueTicketDto.assignedToWindowId !== undefined) {
      if (updateQueueTicketDto.assignedToWindowId === null) {
        ticket.assignedToWindow = null;
        ticket.assignedToWindowId = null;
      } else {
        const assignedToWindow = await this.serviceWindowRepository.findOne({ where: { windowId: updateQueueTicketDto.assignedToWindowId } });
        if (!assignedToWindow) throw new BadRequestException(`Service window with ID ${updateQueueTicketDto.assignedToWindowId} not found.`);
        ticket.assignedToWindow = assignedToWindow;
      }
      delete updateQueueTicketDto.assignedToWindowId;
    }

    if (updateQueueTicketDto.assignedToStaffId !== undefined) {
      if (updateQueueTicketDto.assignedToStaffId === null) {
        ticket.assignedToStaff = null;
        ticket.assignedToStaffId = null;
      } else {
        const assignedToStaff = await this.staffRepository.findOne({ where: { staffId: updateQueueTicketDto.assignedToStaffId } });
        if (!assignedToStaff) throw new BadRequestException(`Staff with ID ${updateQueueTicketDto.assignedToStaffId} not found.`);
        ticket.assignedToStaff = assignedToStaff;
      }
      delete updateQueueTicketDto.assignedToStaffId;
    }

    if (updateQueueTicketDto.issuedByUserId !== undefined) {
      if (updateQueueTicketDto.issuedByUserId === null) {
        ticket.issuedBy = null;
        ticket.issuedByUserId = null;
      } else {
        const issuedBy = await this.userRepository.findOne({ where: { userId: updateQueueTicketDto.issuedByUserId } });
        if (!issuedBy) throw new BadRequestException(`User (issuedBy) with ID ${updateQueueTicketDto.issuedByUserId} not found.`);
        ticket.issuedBy = issuedBy;
      }
      delete updateQueueTicketDto.issuedByUserId;
    }

    if (updateQueueTicketDto.cancelledById !== undefined) {
      if (updateQueueTicketDto.cancelledById === null) {
        ticket.cancelledBy = null;
        ticket.cancelledById = null;
      } else {
        const cancelledBy = await this.userRepository.findOne({ where: { userId: updateQueueTicketDto.cancelledById } });
        if (!cancelledBy) throw new BadRequestException(`User (cancelledBy) with ID ${updateQueueTicketDto.cancelledById} not found.`);
        ticket.cancelledBy = cancelledBy;
      }
      delete updateQueueTicketDto.cancelledById;
    }

    // Ensure serviceType is handled as string or null
    if (updateQueueTicketDto.serviceType !== undefined) {
      ticket.serviceType = updateQueueTicketDto.serviceType === '' ? null : updateQueueTicketDto.serviceType;
      delete updateQueueTicketDto.serviceType;
    }

    Object.assign(ticket, updateQueueTicketDto);
    return this.queueTicketRepository.save(ticket);
  }

  async remove(ticketId: number): Promise<void> {
    const result = await this.queueTicketRepository.delete(ticketId);
    if (result.affected === 0) {
      throw new NotFoundException(`Queue ticket with ID "${ticketId}" not found`);
    }
  }
}
