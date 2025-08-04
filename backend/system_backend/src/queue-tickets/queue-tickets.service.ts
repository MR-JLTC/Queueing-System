import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm'; // Import 'In'
import { QueueTicket } from './entities/queue-ticket.entity';
import { CreateQueueTicketDto } from './dto/create-queue-ticket.dto';
import { UpdateQueueTicketDto } from './dto/update-queue-ticket.dto';
import { Branch } from '../branches/entities/branch.entity';
import { CustomerCategory } from '../customer-categories/entities/customer-category.entity';
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity';
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class QueueTicketsService {
  private statusIds: { QUEUED: number; CALLED: number; SERVED: number; CANCELLED: number };

  constructor(
    @InjectRepository(QueueTicket)
    private queueTicketRepository: Repository<QueueTicket>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(CustomerCategory)
    private customerCategoryRepository: Repository<CustomerCategory>,
    @InjectRepository(TicketStatus)
    private ticketStatusRepository: Repository<TicketStatus>,
    @InjectRepository(ServiceWindow)
    private serviceWindowRepository: Repository<ServiceWindow>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.initializeStatusIds();
  }

  // New method to check the ticket status
  // New method to check the ticket status
  async checkTicketStatus(ticketNumber: string) {
    const ticket = await this.queueTicketRepository.findOne({
      where: { ticketNumber },
      relations: ['currentStatus', 'branch', 'assignedToWindow', 'category'], // Added 'category'
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found or invalid.');
    }

    // You can add more detailed status checks here
    const status = ticket.currentStatus.statusName;
    if (status === 'SERVED' || status === 'CANCELLED') {
      throw new BadRequestException('This ticket has already been processed.');
    }

    return {
      message: 'Ticket validated successfully! Please proceed.',
      ticketInfo: {
        ticketNumber: ticket.ticketNumber,
        customerName: ticket.customerName,
        assignToWindow: ticket.assignedToWindowId,
        category: ticket.category?.categoryName || 'N/A', // Added optional chaining and a fallback
        branch: ticket.branch.branchName,
      },
    };
  }

  private async initializeStatusIds() {
    const statuses = await this.ticketStatusRepository.find();
    this.statusIds = {
      QUEUED: statuses.find(s => s.statusName === 'QUEUED')?.statusId || 1,
      CALLED: statuses.find(s => s.statusName === 'CALLED')?.statusId || 2,
      SERVED: statuses.find(s => s.statusName === 'SERVED')?.statusId || 3,
      CANCELLED: statuses.find(s => s.statusName === 'CANCELLED')?.statusId || 4,
    };
    if (Object.values(this.statusIds).some(id => !id)) {
      console.warn('One or more essential ticket statuses not found in database. Ensure ticket_statuses table is seeded correctly.');
    }
  }

   async create(createQueueTicketDto: CreateQueueTicketDto): Promise<QueueTicket> {
    const {
      customerName,
      customerCategoryId,
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

    const category = await this.customerCategoryRepository.findOne({ where: { categoryId: createQueueTicketDto.customerCategoryId } });
    if (!category) throw new BadRequestException(`Customer category with ID ${customerCategoryId} not found.`);

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

  async findAll(): Promise<QueueTicket[]> {
    return this.queueTicketRepository.find({
      relations: ['branch', 'assignedToWindow', 'assignedToStaff', 'category', 'currentStatus', 'issuedBy', 'cancelledBy'],
    });
  }

  async findOne(ticketId: number): Promise<QueueTicket> {
    const ticket = await this.queueTicketRepository.findOne({
      where: { ticketId },
      relations: ['branch', 'assignedToWindow', 'assignedToStaff', 'category', 'currentStatus', 'issuedBy', 'cancelledBy'],
    });
    if (!ticket) {
      throw new NotFoundException(`Queue ticket with ID ${ticketId} not found.`);
    }
    return ticket;
  }

  async update(ticketId: number, updateQueueTicketDto: UpdateQueueTicketDto): Promise<QueueTicket> {
    const ticket = await this.queueTicketRepository.findOne({ where: { ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Queue ticket with ID ${ticketId} not found.`);
    }

    // Handle updates to relationships and direct properties
    if (updateQueueTicketDto.branchId !== undefined) {
      const branch = await this.branchRepository.findOne({ where: { branchId: updateQueueTicketDto.branchId } });
      if (!branch) throw new BadRequestException(`Branch with ID ${updateQueueTicketDto.branchId} not found.`);
      ticket.branch = branch;
      ticket.branchId = updateQueueTicketDto.branchId;
    }

    if (updateQueueTicketDto.customerCategoryId !== undefined) { // Use customerCategoryId [cite: uploaded:queue-ticket.entity.ts]
      const category = await this.customerCategoryRepository.findOne({ where: { categoryId: updateQueueTicketDto.customerCategoryId } });
      if (!category) throw new BadRequestException(`Customer category with ID ${updateQueueTicketDto.customerCategoryId} not found.`);
      ticket.category = category;
      ticket.customerCategoryId = updateQueueTicketDto.customerCategoryId; // Corrected property name [cite: uploaded:queue-ticket.entity.ts]
    }

    if (updateQueueTicketDto.currentStatusId !== undefined) {
      const status = await this.ticketStatusRepository.findOne({ where: { statusId: updateQueueTicketDto.currentStatusId } });
      if (!status) throw new BadRequestException(`Ticket Status with ID ${updateQueueTicketDto.currentStatusId} not found.`);
      ticket.currentStatus = status;
      ticket.currentStatusId = updateQueueTicketDto.currentStatusId;
    }

    if (updateQueueTicketDto.assignedToWindowId !== undefined) { // Use assignedToWindowId [cite: uploaded:queue-ticket.entity.ts]
      if (updateQueueTicketDto.assignedToWindowId === null) {
        ticket.assignedToWindow = null;
        ticket.assignedToWindowId = null;
      } else {
        const serviceWindow = await this.serviceWindowRepository.findOne({ where: { windowId: updateQueueTicketDto.assignedToWindowId } });
        if (!serviceWindow) throw new BadRequestException(`Service window with ID ${updateQueueTicketDto.assignedToWindowId} not found.`);
        ticket.assignedToWindow = serviceWindow;
        ticket.assignedToWindowId = updateQueueTicketDto.assignedToWindowId;
      }
    }

    if (updateQueueTicketDto.assignedToStaffId !== undefined) {
      if (updateQueueTicketDto.assignedToStaffId === null) {
        ticket.assignedToStaff = null;
        ticket.assignedToStaffId = null;
      } else {
        const staff = await this.staffRepository.findOne({ where: { staffId: updateQueueTicketDto.assignedToStaffId } });
        if (!staff) throw new BadRequestException(`Staff with ID ${updateQueueTicketDto.assignedToStaffId} not found.`);
        ticket.assignedToStaff = staff;
        ticket.assignedToStaffId = updateQueueTicketDto.assignedToStaffId;
      }
    }

    if (updateQueueTicketDto.issuedByUserId !== undefined) {
      if (updateQueueTicketDto.issuedByUserId === null) {
        ticket.issuedBy = null;
        ticket.issuedByUserId = null;
      } else {
        const issuedBy = await this.userRepository.findOne({ where: { userId: updateQueueTicketDto.issuedByUserId } });
        if (!issuedBy) throw new BadRequestException(`User (issuedBy) with ID ${updateQueueTicketDto.issuedByUserId} not found.`);
        ticket.issuedBy = issuedBy;
        ticket.issuedByUserId = updateQueueTicketDto.issuedByUserId;
      }
    }

    if (updateQueueTicketDto.cancelledById !== undefined) {
      if (updateQueueTicketDto.cancelledById === null) {
        ticket.cancelledBy = null;
        ticket.cancelledById = null;
      } else {
        const cancelledBy = await this.userRepository.findOne({ where: { userId: updateQueueTicketDto.cancelledById } });
        if (!cancelledBy) throw new BadRequestException(`User (cancelledBy) with ID ${updateQueueTicketDto.cancelledById} not found.`);
        ticket.cancelledBy = cancelledBy;
        ticket.cancelledById = updateQueueTicketDto.cancelledById;
      }
    }

    // Update direct properties
    if (updateQueueTicketDto.ticketNumber !== undefined) ticket.ticketNumber = updateQueueTicketDto.ticketNumber;
    if (updateQueueTicketDto.customerName !== undefined) ticket.customerName = updateQueueTicketDto.customerName;
    if (updateQueueTicketDto.customerNickname !== undefined) ticket.customerNickname = updateQueueTicketDto.customerNickname;
    if (updateQueueTicketDto.serviceType !== undefined) ticket.serviceType = updateQueueTicketDto.serviceType;
    if (updateQueueTicketDto.requeueAttempts !== undefined) ticket.requeueAttempts = updateQueueTicketDto.requeueAttempts;
    if (updateQueueTicketDto.visibilityStatus !== undefined) ticket.visibilityStatus = updateQueueTicketDto.visibilityStatus;

    // Handle Date string conversions
    if (updateQueueTicketDto.queuedAt !== undefined) {
      ticket.queuedAt = updateQueueTicketDto.queuedAt ? new Date(updateQueueTicketDto.queuedAt) : ticket.queuedAt;
    }
    if (updateQueueTicketDto.calledAt !== undefined) {
      ticket.calledAt = updateQueueTicketDto.calledAt ? new Date(updateQueueTicketDto.calledAt) : null;
    }
    if (updateQueueTicketDto.servedAt !== undefined) {
      ticket.servedAt = updateQueueTicketDto.servedAt ? new Date(updateQueueTicketDto.servedAt) : null;
    }

    return this.queueTicketRepository.save(ticket);
  }

  async remove(ticketId: number): Promise<void> {
    const result = await this.queueTicketRepository.delete(ticketId);
    if (result.affected === 0) {
      throw new NotFoundException(`Queue ticket with ID ${ticketId} not found.`);
    }
  }

  // --- The Queueing Logic Methods (Adapted to entity properties) ---

  /**
   * Calls the next available ticket for a specific service window in a branch.
   * Follows FIFO. Updates status to 'CALLED'.
   */
  async callNextTicket(branchId: number, assignedToWindowId: number): Promise<QueueTicket | null> { // branchId and assignedToWindowId are numbers
    if (!this.statusIds) await this.initializeStatusIds();

    const nextTicket = await this.queueTicketRepository.findOne({
      where: {
        branchId,
        assignedToWindowId, // Corrected property name [cite: uploaded:queue-ticket.entity.ts]
        currentStatusId: this.statusIds.QUEUED,
        visibilityStatus: 'ON_LIVE',
      },
      order: {
        queuedAt: 'ASC', // FIFO
      },
      relations: ['branch', 'assignedToWindow', 'category', 'currentStatus'], // Correct relation name
    });

    if (!nextTicket) {
      return null;
    }

    nextTicket.currentStatusId = this.statusIds.CALLED;
    nextTicket.calledAt = new Date();
    nextTicket.requeueAttempts = 0;
    return this.queueTicketRepository.save(nextTicket);
  }

  // Use WebSocket then implement it here the queue logic
  /**
   * Requeues a ticket. Increments requeue attempts.
   * If attempts reach 3, marks as 'CANCELLED'. Otherwise, reverts to 'QUEUED'.
   */
  async requeueTicket(ticketId: number, cancelledById?: number): Promise<QueueTicket> {
    if (!this.statusIds) await this.initializeStatusIds();

    const ticket = await this.queueTicketRepository.findOne({ where: { ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Queue ticket with ID ${ticketId} not found.`);
    }

    ticket.requeueAttempts += 1;

    if (ticket.requeueAttempts >= 3) {
      ticket.currentStatusId = this.statusIds.CANCELLED;
      ticket.visibilityStatus = 'CANCELLED';
      ticket.cancelledById = cancelledById || null;
    } else {
      ticket.currentStatusId = this.statusIds.QUEUED;
      ticket.calledAt = null;
      ticket.visibilityStatus = 'ON_LIVE';
    }

    return this.queueTicketRepository.save(ticket);
  }

  /**
   * Marks a ticket as 'SERVED'.
   */
  async markServed(ticketId: number): Promise<QueueTicket> {
    if (!this.statusIds) await this.initializeStatusIds();

    const ticket = await this.queueTicketRepository.findOne({ where: { ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Queue ticket with ID ${ticketId} not found.`);
    }

    ticket.currentStatusId = this.statusIds.SERVED;
    ticket.servedAt = new Date();
    ticket.visibilityStatus = 'SERVED';
    return this.queueTicketRepository.save(ticket);
  }
  
  async getQueueForWindowByWindowID(windowId: number) { // Now only expects 'windowId'
    if (!this.statusIds) await this.initializeStatusIds();

    const tickets = await this.queueTicketRepository.find({
      where: {
        assignedToWindowId: windowId,
        currentStatus: {
          // CORRECTED LINE: Use Not(In([...])) for multiple NOT conditions on the same property
          statusId: Not(In([this.statusIds.SERVED, this.statusIds.CANCELLED])),
        },
      },
      order: {
        queuedAt: 'ASC',
      },
      relations: ['branch', 'assignedToWindow', 'category', 'currentStatus', 'issuedBy'],
    });

    let calledTicket: QueueTicket | null = null;
    let pendingTicket: QueueTicket | null = null;
    const onGoingTickets: QueueTicket[] = [];

    for (const ticket of tickets) {
      if (ticket.currentStatusId === this.statusIds.CALLED) {
        calledTicket = ticket;
      } else if (ticket.currentStatusId === this.statusIds.QUEUED) {
        if (!pendingTicket) {
          pendingTicket = ticket;
        } else {
          onGoingTickets.push(ticket);
        }
      }
    }

    return {
      called: calledTicket,
      pending: pendingTicket,
      onGoing: onGoingTickets,
    };
  }

  /**
   * Gets the queue status for a specific service window.
   * Returns tickets categorized into 'called', 'pending', and 'on-going'.
   */
  async getQueueForWindow(branchId: number, assignedToWindowId: number): Promise<{ // branchId and assignedToWindowId are numbers
    called: QueueTicket | null;
    pending: QueueTicket | null;
    onGoing: QueueTicket[];
  }> {
    if (!this.statusIds) await this.initializeStatusIds();

    const tickets = await this.queueTicketRepository.find({
      where: {
        branchId,
        assignedToWindowId, // Corrected property name [cite: uploaded:queue-ticket.entity.ts]
        currentStatusId: In([this.statusIds.QUEUED, this.statusIds.CALLED]), // Fixed multiple properties error
        visibilityStatus: 'ON_LIVE',
      },
      order: {
        queuedAt: 'ASC', // FIFO order
      },
      relations: ['branch', 'assignedToWindow', 'category', 'currentStatus'], // Correct relation name
    });

    let calledTicket: QueueTicket | null = null;
    let pendingTicket: QueueTicket | null = null;
    const onGoingTickets: QueueTicket[] = [];

    for (const ticket of tickets) {
      if (ticket.currentStatusId === this.statusIds.CALLED) {
        calledTicket = ticket;
      } else if (ticket.currentStatusId === this.statusIds.QUEUED) {
        if (!pendingTicket) {
          pendingTicket = ticket;
        } else {
          onGoingTickets.push(ticket);
        }
      }
    }

    return {
      called: calledTicket,
      pending: pendingTicket,
      onGoing: onGoingTickets,
    };
  }

  /**
   * Gets all tickets for a specific branch regardless of window.
   * Useful for a general branch queue view.
   */
  async getQueueForBranch(branchId: number): Promise<QueueTicket[]> { // branchId is number
    if (!this.statusIds) await this.initializeStatusIds();

    return this.queueTicketRepository.find({
      where: {
        branchId,
        currentStatusId: In([this.statusIds.QUEUED, this.statusIds.CALLED]), // Fixed multiple properties error
        visibilityStatus: 'ON_LIVE',
      },
      order: {
        queuedAt: 'ASC',
      },
      relations: ['branch', 'assignedToWindow', 'category', 'currentStatus'], // Correct relation name
    });
  }

 async getQueueStatusByBranchAndWindow(branchId: number) {
    if (!this.statusIds) await this.initializeStatusIds(); // Ensure status IDs are loaded

    const branch = await this.branchRepository.findOne({ where: { branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found.`);
    }

    const serviceWindows = await this.serviceWindowRepository.find({
      where: { branch: { branchId } },
      order: { windowNumber: 'ASC' }, // Order by window number
    });

    const queueStatusByWindow: { [windowId: number]: {
      windowName: string;
      called: QueueTicket | null;
      pending: QueueTicket | null;
      onGoing: QueueTicket[];
    }} = {};

    for (const window of serviceWindows) {
      const tickets = await this.queueTicketRepository.find({
        where: {
          branchId,
          assignedToWindowId: window.windowId,
          // FIX: Use 'NotIn' to exclude multiple status IDs
          currentStatus: {
            statusId: Not(In([this.statusIds.SERVED, this.statusIds.CANCELLED])),
          },
        },
        relations: ['branch', 'category', 'currentStatus', 'assignedToWindow'],
        order: { queuedAt: 'ASC' }, // Oldest tickets first
      });

      let calledTicket: QueueTicket | null = null;
      let pendingTicket: QueueTicket | null = null;
      const onGoingTickets: QueueTicket[] = [];

      for (const ticket of tickets) {
        if (ticket.currentStatusId === this.statusIds.CALLED) {
          calledTicket = ticket;
        } else if (ticket.currentStatusId === this.statusIds.QUEUED) {
          if (!pendingTicket) {
            pendingTicket = ticket; // The first QUEUED ticket is 'pending'
          } else {
            onGoingTickets.push(ticket); // The rest are 'on-going'
          }
        }
      }

      queueStatusByWindow[window.windowId] = {
        windowName: window.windowName || `Window ${window.windowNumber}`,
        called: calledTicket,
        pending: pendingTicket,
        onGoing: onGoingTickets,
      };
    }

    return { queueStatusByWindow };
  }
}