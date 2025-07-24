import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceWindow } from '../../service-windows/entities/service-window.entity'; // <--- UPDATED IMPORT to ServiceWindow
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'branch_name', unique: true, length: 255 })
  branchName: string;

  @Column({ name: 'branch_location', length: 255, nullable: true })
  branchLocation: string;

  @Column({ name: 'contact_number', length: 50, nullable: true })
  contactNumber: string;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  @OneToMany(() => ServiceWindow, (serviceWindow) => serviceWindow.branch) // <--- Use ServiceWindow
  windows: ServiceWindow[]; // Property name changed to 'windows' for clarity as it represents many service windows

  @OneToMany(() => QueueTicket, (ticket) => ticket.branch)
  queueTickets: QueueTicket[];
}