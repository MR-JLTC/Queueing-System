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

  @ManyToOne(() => QueueTicket, ticket => ticket.ticketStatusHistories)
  @JoinColumn({ name: 'ticket_id' })
  ticket: QueueTicket;

  @Column({ name: 'status_code', type: 'char', length: 1 })
  statusCode: string;

  @ManyToOne(() => TicketStatus, status => status.ticketStatusHistories)
  @JoinColumn({ name: 'status_code' })
  status: TicketStatus;

  @Column({ name: 'changed_by' })
  changedByUserId: number; // Renamed to avoid conflict with relation

  @ManyToOne(() => User, user => user.ticketStatusHistories)
  @JoinColumn({ name: 'changed_by' })
  changedBy: User;

  @Column({ name: 'changed_at', type: 'datetime' })
  changedAt: Date;

  @Column({ nullable: true, length: 255 })
  notes: string;

  @Column({ name: 'record_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  recordStatus: string;
}
