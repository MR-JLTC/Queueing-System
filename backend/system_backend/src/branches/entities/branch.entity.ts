// src/branches/entities/branch.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceWindow } from '../../service-windows/entities/service-window.entity';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'branch_name', unique: true, length: 255 })
  branchName: string;

  @Column({ name: 'branch_location', nullable: true, length: 255 })
  branchLocation: string;

  @Column({ name: 'contact_number', nullable: true, length: 50 })
  contactNumber: string;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => User, user => user.branch)
  users: User[]; // For Admin users

  @OneToMany(() => ServiceWindow, serviceWindow => serviceWindow.branch) // Corrected: branch.windows -> branch.serviceWindows
  serviceWindows: ServiceWindow[]; // Changed property name to match convention

  @OneToMany(() => QueueTicket, queueTicket => queueTicket.branch)
  queueTickets: QueueTicket[];

  @OneToMany(() => Staff, staff => staff.branch)
  staff: Staff[];
}
