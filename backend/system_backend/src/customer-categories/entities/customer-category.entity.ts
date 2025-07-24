import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity'; // Import QueueTicket

@Entity('customer_categories')
export class CustomerCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'category_name', unique: true, length: 255 })
  categoryName: string; // e.g., "VIP", "Regular", "Senior Citizen"

  @Column({ name: 'description', length: 500, nullable: true })
  description: string;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // One category can have multiple queue tickets
  @OneToMany(() => QueueTicket, ticket => ticket.category) // This will refer to 'category' on QueueTicket
  queueTickets: QueueTicket[];
}