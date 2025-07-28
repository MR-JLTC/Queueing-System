// src/customer-categories/entities/customer-category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity'; // Import QueueTicket

@Entity('customer_categories')
export class CustomerCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'category_name', unique: true, length: 255 })
  categoryName: string;

  @Column({ name: 'description', nullable: true, length: 500 })
  description: string;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => QueueTicket, queueTicket => queueTicket.category)
  queueTickets: QueueTicket[];
}
