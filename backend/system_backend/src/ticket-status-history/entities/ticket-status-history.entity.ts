import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity'; // Import QueueTicket
import { User } from '../../users/entities/user.entity'; // Import User
import { TicketStatus } from '../../ticket-statuses/entities/ticket-status.entity'; // <--- IMPORT New TicketStatus Entity

@Entity('ticket_status_history')
export class TicketStatusHistory {
  @PrimaryGeneratedColumn({ name: 'history_id' })
  historyId: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @ManyToOne(() => QueueTicket, queueTicket => queueTicket.statusHistory)
  @JoinColumn({ name: 'ticket_id' })
  queueTicket: QueueTicket;

  // Old Status - now links to TicketStatus entity
  @Column({ name: 'old_status_id', nullable: true })
  oldStatusId: number | null;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.ticketStatusHistories)
  @JoinColumn({ name: 'old_status_id' })
  oldStatus: TicketStatus | null;

  // New Status - now links to TicketStatus entity
  @Column({ name: 'new_status_id' })
  newStatusId: number;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.ticketStatusHistories)
  @JoinColumn({ name: 'new_status_id' })
  newStatus: TicketStatus;

  // Added to resolve: Property 'status' does not exist on type 'TicketStatusHistory'.
  // This means the TicketStatus entity's OneToMany expects a 'status' property on TicketStatusHistory.
  // This 'status' here will represent the new status of this history entry, for the relationship.
  @Column({ name: 'related_status_id' }) // Use a distinct column name for this specific relation
  relatedStatusId: number;

  @ManyToOne(() => TicketStatus, ticketStatus => ticketStatus.ticketStatusHistories)
  @JoinColumn({ name: 'related_status_id' })
  status: TicketStatus; // <--- RESOLVES THE ERROR

  @Column({ name: 'changed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;

  @Column({ name: 'changed_by_id', nullable: true })
  changedById: number | null;

  @ManyToOne(() => User, user => user.ticketStatusHistories)
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;
}