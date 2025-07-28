// src/service-windows/entities/service-window.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';
import { StaffWindowAssignment } from '../../staff-window-assignments/entities/staff-window-assignment.entity';

@Entity('service_windows')
export class ServiceWindow {
  @PrimaryGeneratedColumn({ name: 'window_id' })
  windowId: number;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.serviceWindows) // Corrected: Link to branch.serviceWindows
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'window_number', unique: true })
  windowNumber: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => QueueTicket, (ticket) => ticket.assignedToWindow)
  assignedQueueTickets: QueueTicket[];

  @OneToMany(() => StaffWindowAssignment, (assignment) => assignment.window)
  staffAssignments: StaffWindowAssignment[];
}
