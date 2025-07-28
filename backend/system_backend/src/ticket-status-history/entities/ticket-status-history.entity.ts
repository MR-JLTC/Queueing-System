// src/ticket-status-history/entities/ticket-status-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';
import { TicketStatus } from '../../ticket-statuses/entities/ticket-status.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_status_history')
export class TicketStatusHistory {
  @PrimaryGeneratedColumn({ name: 'history_id' })
  historyId: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @ManyToOne(() => QueueTicket, ticket => ticket.statusHistory)
  @JoinColumn({ name: 'ticket_id' })
  queueTicket: QueueTicket;

  @Column({ name: 'old_status_id', nullable: true })
  oldStatusId: number | null;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.oldStatusHistories, { nullable: true })
  @JoinColumn({ name: 'old_status_id' })
  oldStatus: TicketStatus | null;

  @Column({ name: 'new_status_id' })
  newStatusId: number;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.newStatusHistories)
  @JoinColumn({ name: 'new_status_id' })
  newStatus: TicketStatus;

  @Column({ name: 'related_status_id', nullable: true })
  relatedStatusId: number | null;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.relatedStatusHistories, { nullable: true })
  @JoinColumn({ name: 'related_status_id' })
  relatedStatus: TicketStatus | null;

  @Column({ name: 'changed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Corrected column name to match DB
  changedAt: Date; // Corrected property name

  @Column({ name: 'changed_by_user_id', nullable: true })
  changedByUserId: number | null;

  @ManyToOne(() => User, user => user.ticketStatusHistories, { nullable: true })
  @JoinColumn({ name: 'changed_by_user_id' })
  changedBy: User | null;
}
