import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity';

@Entity('ticket_statuses')
export class TicketStatus {
  @PrimaryColumn({ name: 'status_code', type: 'char', length: 1 })
  statusCode: string;

  @Column({ name: 'status_label', length: 255 })
  statusLabel: string;

  @Column({ name: 'visibility_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string;

  @OneToMany(() => QueueTicket, ticket => ticket.currentStatus)
  queueTickets: QueueTicket[];

  @OneToMany(() => TicketStatusHistory, history => history.status)
  ticketStatusHistories: TicketStatusHistory[];
}