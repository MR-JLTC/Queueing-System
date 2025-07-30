// src/queue-tickets/entities/queue-ticket.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { ServiceWindow } from '../../service-windows/entities/service-window.entity';
import { CustomerCategory } from '../../customer-categories/entities/customer-category.entity';
import { TicketStatus } from '../../ticket-statuses/entities/ticket-status.entity';
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { User } from '../../users/entities/user.entity';

@Entity('queue_tickets')
export class QueueTicket {
  @PrimaryGeneratedColumn({ name: 'ticket_id' })
  ticketId: number;

  @Column({ name: 'ticket_number', length: 50, unique: true })
  ticketNumber: string;

  @Column({ name: 'customer_name', length: 255 })
  customerName: string;

  // Removed: customerPhone as requested
  // @Column({ name: 'customer_phone', type: 'varchar', nullable: true, length: 20 })
  // customerPhone: string | null;

  // Removed: customerEmail as requested
  // @Column({ name: 'customer_email', type: 'varchar', nullable: true, length: 255 })
  // customerEmail: string | null;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch, branch => branch.queueTickets)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'assigned_to_window_id', type: 'int', nullable: true })
  assignedToWindowId: number | null;

  @ManyToOne(() => ServiceWindow, serviceWindow => serviceWindow.assignedQueueTickets, { nullable: true })
  @JoinColumn({ name: 'assigned_to_window_id' })
  assignedToWindow: ServiceWindow | null;

  @Column({ name: 'assigned_to_staff_id', type: 'int', nullable: true })
  assignedToStaffId: number | null;

  @ManyToOne(() => Staff, staff => staff.assignedTickets, { nullable: true })
  @JoinColumn({ name: 'assigned_to_staff_id' })
  assignedToStaff: Staff | null;

  @Column({ name: 'customer_category_id', type: 'int', nullable: true })
  customerCategoryId: number | null; // Renamed from categoryId to customerCategoryId to match DB

  @ManyToOne(() => CustomerCategory, customerCategory => customerCategory.queueTickets, { nullable: true })
  @JoinColumn({ name: 'customer_category_id' })
  category: CustomerCategory | null;

  @Column({ name: 'service_type', type: 'varchar', length: 255, nullable: true })
  serviceType: string | null;

  @Column({ name: 'current_status_id' })
  currentStatusId: number;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.currentQueueTickets)
  @JoinColumn({ name: 'current_status_id' })
  currentStatus: TicketStatus;

  @Column({ name: 'queued_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  queuedAt: Date;

  @Column({ name: 'called_at', type: 'timestamp', nullable: true })
  calledAt: Date | null;

  @Column({ name: 'served_at', type: 'timestamp', nullable: true })
  servedAt: Date | null;

  @Column({ name: 'cancelled_by_id', type: 'int', nullable: true })
  cancelledById: number | null;

  @ManyToOne(() => User, user => user.cancelledTickets, { nullable: true })
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: User | null;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @OneToMany(() => TicketStatusHistory, history => history.queueTicket)
  statusHistory: TicketStatusHistory[];

  @Column({ name: 'issued_by_user_id', type: 'int', nullable: true })
  issuedByUserId: number | null;

  @ManyToOne(() => User, user => user.issuedTickets, { nullable: true })
  @JoinColumn({ name: 'issued_by_user_id' })
  issuedBy: User | null;
}
