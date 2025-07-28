// src/dashboard/dashboard.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { QueueTicket } from '../queue-tickets/entities/queue-ticket.entity';
import { ServiceWindow } from '../service-windows/entities/service-window.entity';
import { User } from '../users/entities/user.entity';
import { Branch } from '../branches/entities/branch.entity';
import { TicketStatus } from '../ticket-statuses/entities/ticket-status.entity';
import { CustomerCategory } from '../customer-categories/entities/customer-category.entity';
import { TicketStatusHistory } from '../ticket-status-history/entities/ticket-status-history.entity';
import { StaffWindowAssignment } from '../staff-window-assignments/entities/staff-window-assignment.entity';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(QueueTicket)
    private queueTicketRepository: Repository<QueueTicket>,
    @InjectRepository(ServiceWindow)
    private serviceWindowRepository: Repository<ServiceWindow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TicketStatus)
    private ticketStatusRepository: Repository<TicketStatus>,
    @InjectRepository(CustomerCategory)
    private customerCategoryRepository: Repository<CustomerCategory>,
    @InjectRepository(TicketStatusHistory)
    private ticketStatusHistoryRepository: Repository<TicketStatusHistory>,
    @InjectRepository(StaffWindowAssignment)
    private staffWindowAssignmentRepository: Repository<StaffWindowAssignment>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async getDashboardSummary(branchId?: number) {
    const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });
    const servedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'SERVED' } });
    const requeuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'REQUEUED' } });
    const cancelledStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'CANCELLED' } });

    const whereClause: any = {};
    if (branchId) {
      whereClause.branch = { branchId };
    }

    const totalQueued = queuedStatus
      ? await this.queueTicketRepository.count({
          where: { ...whereClause, currentStatus: { statusId: queuedStatus.statusId } },
        })
      : 0;

    const served = servedStatus
      ? await this.queueTicketRepository.count({
          where: { ...whereClause, currentStatus: { statusId: servedStatus.statusId } },
        })
      : 0;

    const requeues = requeuedStatus
      ? await this.queueTicketRepository.count({
          where: { ...whereClause, currentStatus: { statusId: requeuedStatus.statusId } },
        })
      : 0;

    const cancelled = cancelledStatus
      ? await this.queueTicketRepository.count({
          where: { ...whereClause, currentStatus: { statusId: cancelledStatus.statusId } },
        })
      : 0;

    return {
      totalQueued,
      served,
      requeues,
      cancelled,
    };
  }

  async getQueuesData(branchId?: number) {
    const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });

    if (!queuedStatus) {
      return [];
    }

    const whereClause: any = { currentStatus: { statusId: queuedStatus.statusId } };
    if (branchId) {
      whereClause.branch = { branchId };
    }

    const queues = await this.queueTicketRepository.find({
      where: whereClause,
      relations: ['category', 'currentStatus', 'assignedToStaff', 'assignedToWindow', 'branch'], // Corrected relation name
      order: { queuedAt: 'ASC' },
    });

    return queues.map((q) => ({
      ticketId: q.ticketId,
      customerName: (q as any).customerName || 'N/A',
      ticketNumber: q.ticketNumber,
      category: q.category?.categoryName || 'N/A',
      status: q.currentStatus?.statusName || 'N/A',
      queuedAt: q.queuedAt,
      branchName: q.branch?.branchName || 'N/A',
      assignedToStaff: q.assignedToStaff?.fullName || 'N/A',
      windowNumber: q.assignedToWindow?.windowNumber || 'N/A', // Corrected property access
      serviceType: q.serviceType || 'N/A',
    }));
  }

  async getWindowsAssignedData(branchId?: number) {
    const whereClause: any = {};
    if (branchId) {
      whereClause.branch = { branchId };
    }

    const windows = await this.serviceWindowRepository.find({
      where: whereClause,
      relations: ['staffAssignments', 'staffAssignments.staff'],
    });

    const windowData = await Promise.all(
      windows.map(async (window) => {
        const assignment = window.staffAssignments.find(
          (assign) => assign.status === 'ACTIVE', // Assuming 'isActive' is now 'status === ACTIVE'
        );

        const assignedStaffName = assignment?.staff?.fullName || 'Unassigned';

        const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });
        const totalQueuedForWindow = queuedStatus
          ? await this.queueTicketRepository.count({
              where: { assignedToWindow: { windowId: window.windowId }, currentStatus: { statusId: queuedStatus.statusId } }, // Corrected property name
            })
          : 0;

        return {
          windowId: window.windowId,
          counter: window.windowNumber,
          counterName: `Window ${window.windowNumber}`,
          staff: assignedStaffName,
          totalQueued: totalQueuedForWindow,
        };
      }),
    );

    return windowData;
  }

  async getQueueHistoryData(branchId?: number, period: string = 'day', startDate?: string, endDate?: string) {
    let queryStartDate: Date;
    let queryEndDate: Date;

    if (startDate && endDate) {
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
      queryEndDate.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      if (period === 'day') {
        queryStartDate = new Date(now);
        queryStartDate.setHours(0, 0, 0, 0);
        queryEndDate = new Date(now);
        queryEndDate.setHours(23, 59, 59, 999);
      } else if (period === 'week') {
        const dayOfWeek = now.getDay();
        queryStartDate = new Date(now);
        queryStartDate.setDate(now.getDate() - dayOfWeek);
        queryStartDate.setHours(0, 0, 0, 0);
        queryEndDate = new Date(queryStartDate);
        queryEndDate.setDate(queryEndDate.getDate() + 6);
        queryEndDate.setHours(23, 59, 59, 999);
      } else if (period === 'month') {
        queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        queryEndDate.setHours(23, 59, 59, 999);
      } else if (period === 'year') {
        queryStartDate = new Date(now.getFullYear(), 0, 1);
        queryEndDate = new Date(now.getFullYear(), 11, 31);
        queryEndDate.setHours(23, 59, 59, 999);
      } else {
        queryStartDate = new Date(now);
        queryStartDate.setHours(0, 0, 0, 0);
        queryEndDate = new Date(now);
        queryEndDate.setHours(23, 59, 59, 999);
      }
    }

    const whereClause: any = { changedAt: Between(queryStartDate, queryEndDate) };

    if (branchId) {
      whereClause.queueTicket = { branch: { branchId } };
    }

    const historyEntries = await this.ticketStatusHistoryRepository.find({
      where: whereClause,
      relations: ['queueTicket', 'queueTicket.category', 'oldStatus', 'newStatus', 'queueTicket.branch', 'changedBy'],
    });

    const queuedStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'QUEUED' } });
    const cancelledStatus = await this.ticketStatusRepository.findOne({ where: { statusName: 'CANCELLED' } });

    const totalQueuedTickets = new Set<number>();
    const uniqueCancelledTicketIds = new Set<number>();

    let pwdCount = 0;
    let seniorCitizensCount = 0;
    let standardCount = 0;

    historyEntries.forEach((entry) => {
      if (entry.newStatus?.statusId === queuedStatus?.statusId && entry.queueTicket?.ticketId) {
        totalQueuedTickets.add(entry.queueTicket.ticketId);
      }

      if (entry.newStatus?.statusId === cancelledStatus?.statusId && entry.queueTicket?.ticketId) {
        uniqueCancelledTicketIds.add(entry.queueTicket.ticketId);
      }

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
