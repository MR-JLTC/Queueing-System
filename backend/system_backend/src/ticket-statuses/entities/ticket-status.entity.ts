// src/ticket-statuses/entities/ticket-status.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';

@Entity('ticket_statuses')
export class TicketStatus {
  @PrimaryGeneratedColumn({ name: 'status_id' })
  statusId: number;

  @Column({ name: 'status_name', unique: true, length: 50 })
  statusName: string;

  @Column({ name: 'description', nullable: true, length: 255 })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => QueueTicket, queueTicket => queueTicket.currentStatus)
  currentQueueTickets: QueueTicket[]; // Corrected property name

  @OneToMany(() => TicketStatusHistory, history => history.oldStatus)
  oldStatusHistories: TicketStatusHistory[]; // Corrected property name

  @OneToMany(() => TicketStatusHistory, history => history.newStatus)
  newStatusHistories: TicketStatusHistory[]; // Corrected property name

  @OneToMany(() => TicketStatusHistory, history => history.relatedStatus)
  relatedStatusHistories: TicketStatusHistory[]; // Corrected property name
}
