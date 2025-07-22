import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';

@Entity('customer_categories')
export class CustomerCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'category_name', length: 255 })
  categoryName: string;

  @Column({ name: 'visibility_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string;

  @OneToMany(() => QueueTicket, ticket => ticket.category)
  queueTickets: QueueTicket[];
}
