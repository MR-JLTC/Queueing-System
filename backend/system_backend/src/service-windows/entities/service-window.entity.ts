// src/service-windows/entities/service-window.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm'; // Import Unique
import { Branch } from '../../branches/entities/branch.entity';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';
import { StaffWindowAssignment } from '../../staff-window-assignments/entities/staff-window-assignment.entity';

@Entity('service_windows')
@Unique(['branchId', 'windowNumber']) // NEW: Composite unique constraint
export class ServiceWindow {
  @PrimaryGeneratedColumn({ name: 'window_id' })
  windowId: number;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.serviceWindows)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'window_number' }) // MODIFIED: Removed unique: true from here
  windowNumber: number;

  @Column({ name: 'window_name', length: 255 })
  windowName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'last_ticket_number', type: 'int', default: 0 })
  lastTicketNumber: number;

  @OneToMany(() => QueueTicket, (ticket) => ticket.assignedToWindow)
  assignedQueueTickets: QueueTicket[];

  @OneToMany(() => StaffWindowAssignment, (staffAssignment) => staffAssignment.window)
  staffAssignments: StaffWindowAssignment[];
}
