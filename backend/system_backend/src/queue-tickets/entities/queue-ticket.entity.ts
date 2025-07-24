import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { ServiceWindow } from '../../service-windows/entities/service-window.entity';
import { User } from '../../users/entities/user.entity';
import { CustomerCategory } from '../../customer-categories/entities/customer-category.entity';
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity';
import { TicketStatus } from '../../ticket-statuses/entities/ticket-status.entity'; // <--- IMPORT New TicketStatus Entity

// REMOVE THIS ENUM DEFINITION (TicketStatus is now an entity)
// export enum TicketStatus {
//   QUEUED = 'QUEUED',
//   CALLING = 'CALLING',
//   SERVED = 'SERVED',
//   MISSED = 'MISSED',
//   CANCELLED = 'CANCELLED',
// }

@Entity('queue_tickets')
export class QueueTicket {
  @PrimaryGeneratedColumn({ name: 'ticket_id' })
  ticketId: number;

  @Column({ name: 'ticket_number', length: 50, unique: true })
  ticketNumber: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch, branch => branch.queueTickets)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'assigned_to_window_id', nullable: true })
  assignedToWindowId: number | null;

  @ManyToOne(() => ServiceWindow, serviceWindow => serviceWindow.queueTickets)
  @JoinColumn({ name: 'assigned_to_window_id' })
  window: ServiceWindow;

  @Column({ name: 'assigned_to_staff_id', nullable: true })
  assignedToStaffId: number | null;

  @ManyToOne(() => User, user => user.staffAssignedTickets)
  @JoinColumn({ name: 'assigned_to_staff_id' })
  assignedToStaff: User;

  @Column({ name: 'customer_category_id', nullable: true })
  customerCategoryId: number | null;

  @ManyToOne(() => CustomerCategory, category => category.queueTickets)
  @JoinColumn({ name: 'customer_category_id' })
  category: CustomerCategory;

  @Column({ name: 'service_type', length: 255, nullable: true })
  serviceType: string;

  // Change 'status' from enum to ManyToOne relationship with TicketStatus entity
  @Column({ name: 'current_status_id' }) // <--- Changed column name to reflect FK
  currentStatusId: number;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.queueTickets)
  @JoinColumn({ name: 'current_status_id' })
  currentStatus: TicketStatus; // <--- RENAMED to 'currentStatus' to match error for TicketStatus entity

  @Column({ name: 'queued_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  queuedAt: Date;

  @Column({ name: 'called_at', type: 'timestamp', nullable: true })
  calledAt: Date | null;

  @Column({ name: 'served_at', type: 'timestamp', nullable: true })
  servedAt: Date | null;

  @Column({ name: 'cancelled_by_id', nullable: true })
  cancelledById: number | null;

  @ManyToOne(() => User, user => user.cancelledTickets)
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: User;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @OneToMany(() => TicketStatusHistory, history => history.queueTicket)
  statusHistory: TicketStatusHistory[];
}