// src/dashboard/dashboard.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { QueueTicket } from '../queue-tickets/entities/queue-ticket.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity';
import { User } from '../users/entities/user.entity'; // For staff details and potentially customer if users are customers
import { Branch } from '../branches/entities/branch.entity'; // For branch details
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { CustomerCategory } from '../customer-categories/entities/customer-category.entity';
import { TicketStatusHistory } from '../ticket-status-history/entities/ticket-status-history.entity';
import { StaffWindowAssignment } from '../staff-window-assignments/entities/staff-window-assignment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(QueueTicket)
    private queueTicketRepository: Repository<QueueTicket>,
    @InjectRepository(ServiceWindow)
    private serviceWindowRepository: Repository<ServiceWindow>,
    @InjectRepository(User)
    private userRepository: Repository<User>, // Potentially needed for customer details if QueueTicket links to User
    @InjectRepository(TicketStatus)
    private ticketStatusRepository: Repository<TicketStatus>,
    @InjectRepository(CustomerCategory)
    private customerCategoryRepository: Repository<CustomerCategory>,
    @InjectRepository(TicketStatusHistory)
    private ticketStatusHistoryRepository: Repository<TicketStatusHistory>,
    @InjectRepository(StaffWindowAssignment)
    private staffWindowAssignmentRepository: Repository<StaffWindowAssignment>,
  ) {}

  /**
   * Retrieves a summary of queue tickets for a specific branch.
   * Counts tickets based on their current status (QUEUED, SERVED, REQUEUED, CANCELLED).
   * @param branchId The ID of the branch.
   * @returns An object with counts for each status.
   */
  async getDashboardSummary(branchId: number) {
    // Fetch status IDs to use in queries
    const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });
    const servedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'SERVED' } });
    const requeuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'REQUEUED' } });
    const cancelledStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'CANCELLED' } });

    // Count tickets by status, ensuring to filter by the branch relation
    const totalQueued = queuedStatus
      ? await this.queueTicketRepository.count({
          where: { branch: { branchId }, currentStatus: { statusId: queuedStatus.statusId } },
        })
      : 0;

    const served = servedStatus
      ? await this.queueTicketRepository.count({
          where: { branch: { branchId }, currentStatus: { statusId: servedStatus.statusId } },
        })
      : 0;

    const requeues = requeuedStatus
      ? await this.queueTicketRepository.count({
          where: { branch: { branchId }, currentStatus: { statusId: requeuedStatus.statusId } },
        })
      : 0;

    const cancelled = cancelledStatus
      ? await this.queueTicketRepository.count({
          where: { branch: { branchId }, currentStatus: { statusId: cancelledStatus.statusId } },
        })
      : 0;

    return {
      totalQueued,
      served,
      requeues,
      cancelled,
    };
  }

  /**
   * Retrieves a list of active (QUEUED) queue tickets for a specific branch.
   * Includes related data like category, current status, assigned staff, and window.
   * @param branchId The ID of the branch.
   * @returns An array of simplified queue ticket objects.
   */
  async getQueuesData(branchId: number) {
    const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });

    if (!queuedStatus) {
      return []; // If 'QUEUED' status is not defined, there are no active queues
    }

    const queues = await this.queueTicketRepository.find({
      where: { branch: { branchId }, currentStatus: { statusId: queuedStatus.statusId } },
      // IMPORTANT: If QueueTicket has a direct 'customerName: string' column, remove 'customer' from relations.
      // If it links to a 'User' or 'Customer' entity, ensure the relation name is correct and the related entity has 'fullName'.
      // Removed 'customer' from relations based on the latest error indicating it doesn't exist.
      relations: ['category', 'currentStatus', 'assignedToStaff', 'window', 'branch'],
      order: { queuedAt: 'ASC' }, // Order by when they were queued
    });

    return queues.map((q) => ({
      ticketId: q.ticketId,
      // CORRECTED: Removed direct 'q.customer' access as the error indicates it doesn't exist.
      // Now it *only* relies on 'customerName' property on QueueTicket or defaults to 'N/A'.
      // If 'customerName' is not a direct column on QueueTicket, you MUST add it or adjust this.
      customerName: (q as any).customerName || 'N/A', // Assuming customerName is a direct column on QueueTicket
      ticketNumber: q.ticketNumber,
      category: q.category?.categoryName || 'N/A',
      status: q.currentStatus?.statusName || 'N/A',
      queuedAt: q.queuedAt,
      branchName: q.branch?.branchName || 'N/A',
      assignedToStaff: q.assignedToStaff?.fullName || 'N/A',
      windowNumber: q.window?.windowNumber || 'N/A',
      serviceType: q.serviceType || 'N/A',
    }));
  }

  /**
   * Retrieves information about service windows and their assigned staff for a specific branch.
   * Includes the count of currently queued tickets for each window.
   * @param branchId The ID of the branch.
   * @returns An array of objects detailing each window's status.
   */
  async getWindowsAssignedData(branchId: number) {
    const windows = await this.serviceWindowRepository.find({
      where: { branch: { branchId } }, // Filter windows by branch
      relations: ['staffAssignments', 'staffAssignments.staff'], // Load staff assignments and the related staff user
    });

    const windowData = await Promise.all(
      windows.map(async (window) => {
        // Find the active staff assignment for this window
        // CORRECTED: Assuming 'isActive' property exists on StaffWindowAssignment entity.
        // You MUST add 'isActive: boolean;' to src/staff-window-assignments/entities/staff-window-assignment.entity.ts
        // and run a migration if it's not already there.
        const assignment = window.staffAssignments.find(
          (assign) => (assign as any).isActive, // Cast to any to bypass TS error if entity not updated yet
        );

        const assignedStaffName = assignment?.staff?.fullName || 'Unassigned';

        // Count queued tickets specifically for this window
        const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });
        const totalQueuedForWindow = queuedStatus
          ? await this.queueTicketRepository.count({
              where: { window: { windowId: window.windowId }, currentStatus: { statusId: queuedStatus.statusId } },
            })
          : 0;

        return {
          windowId: window.windowId,
          counter: window.windowNumber, // Use windowNumber as 'Counter'
          counterName: `Window ${window.windowNumber}`, // Create a display name for the counter
          staff: assignedStaffName,
          totalQueued: totalQueuedForWindow,
        };
      }),
    );

    return windowData;
  }

  /**
   * Retrieves a historical summary of queue tickets for a specific branch and time period/date range.
   * Categorizes tickets by PWD, Senior Citizen, Standard, and counts total queued and cancelled.
   * @param branchId The ID of the branch.
   * @param period The predefined period ('day', 'week', 'month', 'year').
   * @param startDate Custom start date (YYYY-MM-DD).
   * @param endDate Custom end date (YYYY-MM-DD).
   * @returns An object with counts for each category and status.
   */
  async getQueueHistoryData(branchId: number, period: string = 'day', startDate?: string, endDate?: string) {
    let queryStartDate: Date;
    let queryEndDate: Date;

    // Determine the date range based on the 'period' or provided 'startDate' and 'endDate'
    if (startDate && endDate) {
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
      queryEndDate.setHours(23, 59, 59, 999); // Set to end of the day for inclusive range
    } else {
      const now = new Date();
      if (period === 'day') {
        queryStartDate = new Date(now);
        queryStartDate.setHours(0, 0, 0, 0); // Start of today
        queryEndDate = new Date(now);
        queryEndDate.setHours(23, 59, 59, 999); // End of today
      } else if (period === 'week') {
        const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
        queryStartDate = new Date(now);
        queryStartDate.setDate(now.getDate() - dayOfWeek); // Start of the current week (Sunday)
        queryStartDate.setHours(0, 0, 0, 0);
        queryEndDate = new Date(queryStartDate);
        queryEndDate.setDate(queryEndDate.getDate() + 6); // End of the current week (Saturday)
        queryEndDate.setHours(23, 59, 59, 999);
      } else if (period === 'month') {
        queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
        queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of the current month
        queryEndDate.setHours(23, 59, 59, 999);
      } else if (period === 'year') {
        queryStartDate = new Date(now.getFullYear(), 0, 1); // Start of the current year
        queryEndDate = new Date(now.getFullYear(), 11, 31); // End of the current year
        queryEndDate.setHours(23, 59, 59, 999);
      } else {
        // Default to 'day' if an invalid period is provided
        queryStartDate = new Date(now);
        queryStartDate.setHours(0, 0, 0, 0);
        queryEndDate = new Date(now);
        queryEndDate.setHours(23, 59, 59, 999);
      }
    }

    // Fetch all ticket status history entries within the specified branch and date range
    const historyEntries = await this.ticketStatusHistoryRepository.find({
      where: {
        // CORRECTED: Filtering by branch through the related queueTicket entity.
        queueTicket: { branch: { branchId } }, // Filter by branch via queueTicket relation
        changedAt: Between(queryStartDate, queryEndDate),
      },
      relations: ['queueTicket', 'queueTicket.category', 'oldStatus', 'newStatus'],
    });

    // Get relevant status IDs for filtering counts
    const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });
    const cancelledStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'CANCELLED' } });

    // Use Sets to count unique ticket IDs to avoid double-counting if a ticket has multiple relevant history entries
    const totalQueuedTickets = new Set<number>();
    const uniqueCancelledTicketIds = new Set<number>();

    let pwdCount = 0;
    let seniorCitizensCount = 0;
    let standardCount = 0;

    historyEntries.forEach((entry) => {
      // Count total unique tickets that entered 'QUEUED' status within the period
      if (entry.newStatus?.statusId === queuedStatus?.statusId && entry.queueTicket?.ticketId) {
        totalQueuedTickets.add(entry.queueTicket.ticketId);
      }

      // Count unique cancelled tickets
      if (entry.newStatus?.statusId === cancelledStatus?.statusId && entry.queueTicket?.ticketId) {
        uniqueCancelledTicketIds.add(entry.queueTicket.ticketId);
      }

      // Count categories based on the ticket's category at the time of the history entry
      // This might count a category multiple times if a ticket's status changes multiple times.
      // If you need unique category counts per ticket for the period, more complex logic is needed.
      if (entry.queueTicket?.category?.categoryName === 'PWD') {
        pwdCount++;
      }
      if (entry.queueTicket?.category?.categoryName === 'Senior Citizen') {
        seniorCitizensCount++;
      }
      if (entry.queueTicket?.category?.categoryName === 'Standard') {
        standardCount++;
      }
    });

    return {
      totalQueued: totalQueuedTickets.size,
      pwd: pwdCount,
      seniorCitizens: seniorCitizensCount,
      standard: standardCount,
      cancelled: uniqueCancelledTicketIds.size,
    };
  }
}