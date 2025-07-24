import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity'; // For relationship to QueueTicket
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity'; // For relationship to TicketStatusHistory

@Entity('ticket_statuses')
export class TicketStatus {
  @PrimaryGeneratedColumn({ name: 'status_id' })
  statusId: number;

  @Column({ name: 'status_name', unique: true, length: 50 })
  statusName: string; // e.g., 'QUEUED', 'CALLING', 'SERVED', 'MISSED', 'CANCELLED'

  @Column({ name: 'description', length: 255, nullable: true })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // One TicketStatus (e.g., 'QUEUED') can be the current status for many QueueTickets
  @OneToMany(() => QueueTicket, ticket => ticket.currentStatus)
  queueTickets: QueueTicket[];

  // A TicketStatus can be an old_status or new_status in many history entries.
  // This `status` property resolves the error 'Property 'status' does not exist on type 'TicketStatusHistory'.
  // It represents that this TicketStatus record can be linked as the 'status' in a history entry.
  @OneToMany(() => TicketStatusHistory, history => history.status)
  ticketStatusHistories: TicketStatusHistory[];
}