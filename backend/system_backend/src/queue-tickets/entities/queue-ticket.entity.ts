import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CustomerCategory } from '../../customer-categories/entities/customer-category.entity';
import { ServiceWindow } from '../../service-windows/entities/service-window.entity';
import { TicketStatus } from '../../ticket-statuses/entities/ticket-status.entity';
import { User } from '../../users/entities/user.entity';
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity';

@Entity('queue_tickets')
export class QueueTicket {
  @PrimaryGeneratedColumn({ name: 'ticket_id' })
  ticketId: number;

  @Column({ name: 'queue_number', unique: true, length: 255 })
  queueNumber: string;

  @Column({ name: 'customer_name', length: 255 })
  customerName: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => CustomerCategory, category => category.queueTickets)
  @JoinColumn({ name: 'category_id' })
  category: CustomerCategory;

  @Column({ name: 'issued_at', type: 'datetime' })
  issuedAt: Date;

  @Column({ name: 'window_id', nullable: true })
  windowId: number;

  @ManyToOne(() => ServiceWindow, window => window.queueTickets)
  @JoinColumn({ name: 'window_id' })
  window: ServiceWindow;

  @Column({ name: 'current_status', type: 'char', length: 1 })
  currentStatus: string;

  @ManyToOne(() => TicketStatus, status => status.queueTickets)
  @JoinColumn({ name: 'current_status' })
  status: TicketStatus;

  @Column({ name: 'requeue_count', type: 'int', default: 0 })
  requeueCount: number;

  @Column({ name: 'served_at', type: 'datetime', nullable: true })
  servedAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancelled_by', nullable: true })
  cancelledByUserId: number; // Renamed to avoid conflict with relation

  @ManyToOne(() => User, user => user.cancelledTickets)
  @JoinColumn({ name: 'cancelled_by' })
  cancelledBy: User;

  @Column({ name: 'record_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  recordStatus: string;

  @OneToMany(() => TicketStatusHistory, history => history.ticket)
  ticketStatusHistories: TicketStatusHistory[];
}